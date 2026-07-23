/**
 * QuickJS WASM - A snapshotable JavaScript runtime via WebAssembly.
 *
 * Provides a clean JavaScript API for running sandboxed JS code in a QuickJS
 * VM compiled to WASM. The key differentiator is the ability to snapshot the
 * entire VM state (including pending promises) and restore it in a fresh
 * WASM instance.
 */
import { createWasiShim } from './wasi-shim.js';
// ---- QuickJS VM ----
export class QuickJS {
    exports;
    module;
    instance;
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    disposed = false;
    /** Registry of host callbacks, keyed by integer ID */
    hostCallbacks = new Map();
    nextCallbackId = 1;
    // Cached singleton handles
    _global = null;
    _undefined = null;
    _null = null;
    _true = null;
    _false = null;
    constructor(module) {
        this.module = module;
        this.instance = null;
        this.exports = null;
    }
    setInstance(instance) {
        this.instance = instance;
        this.exports = instance.exports;
    }
    // ---- Cached property accessors ----
    /** The global object. Cached — do not dispose. */
    get global() {
        if (!this._global) {
            this._global = new JSValueHandle(this, this.exports.qjs_get_global());
        }
        return this._global;
    }
    /** The undefined value. Cached — do not dispose. */
    get undefined() {
        if (!this._undefined) {
            this._undefined = new JSValueHandle(this, this.exports.qjs_get_undefined());
        }
        return this._undefined;
    }
    /** The null value. Cached — do not dispose. */
    get null() {
        if (!this._null) {
            this._null = new JSValueHandle(this, this.exports.qjs_get_null());
        }
        return this._null;
    }
    /** The true value. Cached — do not dispose. */
    get true() {
        if (!this._true) {
            this._true = new JSValueHandle(this, this.exports.qjs_get_true());
        }
        return this._true;
    }
    /** The false value. Cached — do not dispose. */
    get false() {
        if (!this._false) {
            this._false = new JSValueHandle(this, this.exports.qjs_get_false());
        }
        return this._false;
    }
    /**
     * Create a fresh QuickJS VM instance.
     */
    static async create(wasmInput) {
        const module = await QuickJS.resolveModule(wasmInput);
        const vm = new QuickJS(module);
        const instance = await QuickJS.instantiate(module, vm);
        vm.setInstance(instance);
        // Initialize the WASI reactor
        vm.exports._initialize();
        // Initialize QuickJS runtime and context
        const result = vm.exports.qjs_init();
        if (result !== 0) {
            throw new Error('Failed to initialize QuickJS runtime');
        }
        return vm;
    }
    /**
     * Restore a QuickJS VM from a snapshot.
     */
    static async restore(snapshot, wasmInput) {
        const module = await QuickJS.resolveModule(wasmInput);
        const vm = new QuickJS(module);
        const instance = await QuickJS.instantiate(module, vm);
        vm.setInstance(instance);
        const exportedMemory = vm.exports.memory;
        // Grow the exported memory to match the snapshot if needed
        const currentPages = exportedMemory.buffer.byteLength / 65536;
        const neededPages = snapshot.memoryPages;
        if (neededPages > currentPages) {
            exportedMemory.grow(neededPages - currentPages);
        }
        // Copy snapshot data into the module's own memory
        const dst = new Uint8Array(exportedMemory.buffer);
        dst.set(snapshot.memory);
        // Set runtime/context pointers (they already exist in the restored memory)
        vm.exports.qjs_set_runtime_and_context(snapshot.runtimePtr, snapshot.contextPtr);
        // Restore the stack pointer
        vm.exports.__stack_pointer.value = snapshot.stackPointer;
        return vm;
    }
    // ---- Internal instantiation helpers ----
    static async resolveModule(wasmInput) {
        if (wasmInput instanceof WebAssembly.Module) {
            return wasmInput;
        }
        else if (wasmInput) {
            return WebAssembly.compile(wasmInput);
        }
        else {
            const fs = await import('node:fs');
            const path = await import('node:path');
            const url = await import('node:url');
            const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
            const wasmPath = path.resolve(__dirname, '..', 'quickjs.wasm');
            const buf = fs.readFileSync(wasmPath);
            return WebAssembly.compile(buf);
        }
    }
    static async instantiate(module, vm) {
        let memory = null;
        const wasiShim = createWasiShim(() => memory);
        const hostCall = (funcId, thisPtr, argc, argvPtr) => {
            return vm.handleHostCall(funcId, thisPtr, argc, argvPtr);
        };
        const instance = await WebAssembly.instantiate(module, {
            env: { host_call: hostCall },
            wasi_snapshot_preview1: wasiShim,
        });
        memory = instance.exports.memory;
        return instance;
    }
    /**
     * Called from WASM when a host function is invoked from QuickJS code.
     */
    handleHostCall(funcId, thisPtr, argc, argvPtr) {
        const callback = this.hostCallbacks.get(funcId);
        if (!callback) {
            return this.exports.qjs_get_undefined();
        }
        const thisHandle = new JSValueHandle(this, thisPtr);
        const args = [];
        if (argc > 0 && argvPtr !== 0) {
            const view = new DataView(this.exports.memory.buffer);
            for (let i = 0; i < argc; i++) {
                const argPtr = view.getUint32(argvPtr + i * 4, true);
                args.push(new JSValueHandle(this, argPtr));
            }
        }
        try {
            const result = callback.call(undefined, thisHandle, ...args);
            return this.exports.qjs_dup_value(result.ptr);
        }
        catch (err) {
            const errStr = err instanceof Error ? err.message : String(err);
            const errHandle = this.newError(errStr);
            const excPtr = this.exports.qjs_dup_value(errHandle.ptr);
            errHandle.dispose();
            return excPtr;
        }
    }
    // ---- String helpers ----
    /** Write a JS string into WASM memory, returning the pointer. Caller must free. */
    writeString(str) {
        const encoded = this.encoder.encode(str);
        const ptr = this.exports.wasm_malloc(encoded.length + 1);
        if (ptr === 0)
            throw new Error('wasm_malloc failed');
        const mem = new Uint8Array(this.exports.memory.buffer);
        mem.set(encoded, ptr);
        mem[ptr + encoded.length] = 0;
        return { ptr, len: encoded.length };
    }
    /** Read a null-terminated C string from WASM memory */
    readCString(ptr) {
        const mem = new Uint8Array(this.exports.memory.buffer);
        let end = ptr;
        while (mem[end] !== 0)
            end++;
        return this.decoder.decode(mem.slice(ptr, end));
    }
    // ---- Public API ----
    /**
     * Evaluate JavaScript code and return the result as a handle.
     * If the code throws, the returned handle will have `isException === true`.
     */
    evalCode(code, filename = '<eval>') {
        this.assertNotDisposed();
        const codeStr = this.writeString(code);
        const fnStr = this.writeString(filename);
        const resultPtr = this.exports.qjs_eval(codeStr.ptr, codeStr.len, fnStr.ptr, 0);
        this.exports.wasm_free(codeStr.ptr);
        this.exports.wasm_free(fnStr.ptr);
        return new JSValueHandle(this, resultPtr);
    }
    /**
     * Unwrap a result handle. If it's an exception, throws a host Error
     * with the QuickJS error as the `cause`. Otherwise returns the handle.
     */
    unwrapResult(result) {
        if (result.isException) {
            const exc = this.getException();
            const dumped = this.dump(exc);
            exc.dispose();
            result.dispose();
            if (dumped instanceof Error) {
                throw dumped;
            }
            throw new Error(String(dumped));
        }
        return result;
    }
    /**
     * Execute all pending microtask jobs (promise reactions, etc.)
     * Returns the number of jobs executed.
     */
    executePendingJobs() {
        this.assertNotDisposed();
        let count = 0;
        while (this.exports.qjs_is_job_pending()) {
            const result = this.exports.qjs_execute_pending_job();
            if (result < 0) {
                const exc = this.getException();
                throw new Error(`Job execution error: ${exc.toString()}`);
            }
            count++;
        }
        return count;
    }
    /**
     * Get the global object. Prefer the cached `vm.global` property.
     */
    getGlobal() {
        this.assertNotDisposed();
        return new JSValueHandle(this, this.exports.qjs_get_global());
    }
    /**
     * Create a new QuickJS string value.
     */
    newString(str) {
        this.assertNotDisposed();
        const { ptr, len } = this.writeString(str);
        const resultPtr = this.exports.qjs_new_string(ptr, len);
        this.exports.wasm_free(ptr);
        return new JSValueHandle(this, resultPtr);
    }
    /**
     * Create a new QuickJS number value.
     */
    newNumber(num) {
        this.assertNotDisposed();
        return new JSValueHandle(this, this.exports.qjs_new_number(num));
    }
    /**
     * Create a new QuickJS BigInt value.
     */
    newBigInt(val) {
        this.assertNotDisposed();
        // Split the bigint into lo/hi 32-bit halves
        const lo = Number(val & 0xffffffffn);
        const hi = Number((val >> 32n) & 0xffffffffn);
        return new JSValueHandle(this, this.exports.qjs_new_big_int64(lo, hi));
    }
    /**
     * Create a new QuickJS object value.
     */
    newObject() {
        this.assertNotDisposed();
        return new JSValueHandle(this, this.exports.qjs_new_object());
    }
    /**
     * Create a new QuickJS array value.
     */
    newArray() {
        this.assertNotDisposed();
        return new JSValueHandle(this, this.exports.qjs_new_array());
    }
    /**
     * Get undefined. Prefer the cached `vm.undefined` property.
     */
    getUndefined() {
        this.assertNotDisposed();
        return new JSValueHandle(this, this.exports.qjs_get_undefined());
    }
    /**
     * Get null. Prefer the cached `vm.null` property.
     */
    getNull() {
        this.assertNotDisposed();
        return new JSValueHandle(this, this.exports.qjs_get_null());
    }
    /**
     * Get true. Prefer the cached `vm.true` property.
     */
    getTrue() {
        this.assertNotDisposed();
        return new JSValueHandle(this, this.exports.qjs_get_true());
    }
    /**
     * Get false. Prefer the cached `vm.false` property.
     */
    getFalse() {
        this.assertNotDisposed();
        return new JSValueHandle(this, this.exports.qjs_get_false());
    }
    /**
     * Create a new QuickJS function backed by a host callback.
     *
     * When the function is called inside QuickJS, the host callback is invoked
     * with the `this` value and arguments as JSValueHandles.
     */
    newFunction(name, fn) {
        this.assertNotDisposed();
        const funcId = this.nextCallbackId++;
        this.hostCallbacks.set(funcId, fn);
        const { ptr: namePtr, len: nameLen } = this.writeString(name);
        const resultPtr = this.exports.qjs_new_host_function(namePtr, nameLen, funcId, 0);
        this.exports.wasm_free(namePtr);
        return new JSValueHandle(this, resultPtr);
    }
    /**
     * Create a new promise.
     *
     * Returns a Deferred with:
     * - `handle` - the QuickJS promise object
     * - `settled` - a host Promise that resolves when the QuickJS promise settles
     * - `resolve(value)` - resolve the promise with a QuickJS value
     * - `reject(value)` - reject the promise with a QuickJS value
     */
    newPromise() {
        this.assertNotDisposed();
        const resolveOutPtr = this.exports.wasm_malloc(4);
        const rejectOutPtr = this.exports.wasm_malloc(4);
        const promisePtr = this.exports.qjs_new_promise(resolveOutPtr, rejectOutPtr);
        const view = new DataView(this.exports.memory.buffer);
        const resolvePtr = view.getUint32(resolveOutPtr, true);
        const rejectPtr = view.getUint32(rejectOutPtr, true);
        this.exports.wasm_free(resolveOutPtr);
        this.exports.wasm_free(rejectOutPtr);
        const promiseHandle = new JSValueHandle(this, promisePtr);
        const resolveHandle = new JSValueHandle(this, resolvePtr);
        const rejectHandle = new JSValueHandle(this, rejectPtr);
        // Create a host-side Promise that resolves when the QuickJS promise settles
        let settledResolve;
        const settled = new Promise((res) => {
            settledResolve = res;
        });
        // Register a temporary host callback for settlement notification
        const settleCallbackId = this.nextCallbackId++;
        this.hostCallbacks.set(settleCallbackId, () => {
            settledResolve();
            this.hostCallbacks.delete(settleCallbackId);
            return this.undefined;
        });
        // Create a host function and attach .then(onSettle, onSettle) to the promise
        const { ptr: onSettleName, len: onSettleNameLen } = this.writeString('__onSettle');
        const onSettleFn = new JSValueHandle(this, this.exports.qjs_new_host_function(onSettleName, onSettleNameLen, settleCallbackId, 0));
        this.exports.wasm_free(onSettleName);
        const thenFn = promiseHandle.getProp('then');
        const onSettleDup = onSettleFn.dup();
        this.callFunction(thenFn, promiseHandle, onSettleFn, onSettleDup).dispose();
        thenFn.dispose();
        onSettleFn.dispose();
        onSettleDup.dispose();
        const vm = this;
        return {
            handle: promiseHandle,
            settled,
            resolve(value) {
                vm.callFunction(resolveHandle, vm.undefined, value).dispose();
                resolveHandle.dispose();
            },
            reject(value) {
                vm.callFunction(rejectHandle, vm.undefined, value).dispose();
                rejectHandle.dispose();
            },
        };
    }
    /**
     * Resolve a promise handle. Returns a host-side Promise that resolves
     * with the settled value/error of the QuickJS promise.
     *
     * If the handle is not a promise, it is treated as an already-fulfilled value.
     *
     * The returned host Promise resolves to `{ value: JSValueHandle }` on
     * fulfillment or `{ error: JSValueHandle }` on rejection.
     */
    resolvePromise(promiseHandle) {
        this.assertNotDisposed();
        // If the handle is not a promise, treat it as a fulfilled value
        if (!this.exports.qjs_is_promise(promiseHandle.ptr)) {
            return Promise.resolve({ value: promiseHandle.dup() });
        }
        // Check if already settled
        const state = this.exports.qjs_promise_state(promiseHandle.ptr);
        if (state === 1) {
            // fulfilled
            return Promise.resolve({ value: new JSValueHandle(this, this.exports.qjs_promise_result(promiseHandle.ptr)) });
        }
        else if (state === 2) {
            // rejected
            return Promise.resolve({ error: new JSValueHandle(this, this.exports.qjs_promise_result(promiseHandle.ptr)) });
        }
        // Pending — attach a .then/.catch to get notified
        return new Promise((hostResolve) => {
            const onFulfilled = this.newFunction('__onFulfilled', (_this, ...args) => {
                const val = args[0]?.dup() ?? this.undefined;
                hostResolve({ value: val });
                return this.undefined;
            });
            const onRejected = this.newFunction('__onRejected', (_this, ...args) => {
                const val = args[0]?.dup() ?? this.undefined;
                hostResolve({ error: val });
                return this.undefined;
            });
            const thenFn = promiseHandle.getProp('then');
            this.callFunction(thenFn, promiseHandle, onFulfilled, onRejected).dispose();
            thenFn.dispose();
            onFulfilled.dispose();
            onRejected.dispose();
        });
    }
    /**
     * Call a QuickJS function.
     */
    callFunction(func, thisVal, ...args) {
        this.assertNotDisposed();
        const argc = args.length;
        let argvPtr = 0;
        if (argc > 0) {
            argvPtr = this.exports.wasm_malloc(argc * 4);
            const view = new DataView(this.exports.memory.buffer);
            for (let i = 0; i < argc; i++) {
                view.setUint32(argvPtr + i * 4, args[i].ptr, true);
            }
        }
        const resultPtr = this.exports.qjs_call(func.ptr, thisVal.ptr, argc, argvPtr);
        if (argvPtr)
            this.exports.wasm_free(argvPtr);
        return new JSValueHandle(this, resultPtr);
    }
    /**
     * Set a property on an object. Accepts string or JSValueHandle as key.
     */
    setProp(obj, key, value) {
        this.assertNotDisposed();
        if (typeof key === 'string') {
            const { ptr: namePtr } = this.writeString(key);
            this.exports.qjs_set_prop_string(obj.ptr, namePtr, value.ptr);
            this.exports.wasm_free(namePtr);
        }
        else {
            // Use JS_SetProperty via eval as a fallback for handle keys
            // For now, convert the key to a string
            const keyStr = key.toString();
            const { ptr: namePtr } = this.writeString(keyStr);
            this.exports.qjs_set_prop_string(obj.ptr, namePtr, value.ptr);
            this.exports.wasm_free(namePtr);
        }
    }
    /**
     * Get the current exception, if any.
     */
    getException() {
        this.assertNotDisposed();
        return new JSValueHandle(this, this.exports.qjs_get_exception());
    }
    /**
     * Create a new QuickJS Error object.
     * Accepts a string message or a native Error object.
     */
    newError(messageOrError) {
        this.assertNotDisposed();
        const errPtr = this.exports.qjs_new_error();
        const errHandle = new JSValueHandle(this, errPtr);
        if (typeof messageOrError === 'string') {
            const msgHandle = this.newString(messageOrError);
            errHandle.setProp('message', msgHandle);
            msgHandle.dispose();
        }
        else {
            const msgHandle = this.newString(messageOrError.message);
            errHandle.setProp('message', msgHandle);
            msgHandle.dispose();
            if (messageOrError.name) {
                const nameHandle = this.newString(messageOrError.name);
                errHandle.setProp('name', nameHandle);
                nameHandle.dispose();
            }
            if (messageOrError.stack) {
                const stackHandle = this.newString(messageOrError.stack);
                errHandle.setProp('stack', stackHandle);
                stackHandle.dispose();
            }
        }
        return errHandle;
    }
    /**
     * Get the typeof a handle as a string.
     */
    typeof(handle) {
        this.assertNotDisposed();
        const e = this.exports;
        if (e.qjs_is_undefined(handle.ptr))
            return 'undefined';
        if (e.qjs_is_null(handle.ptr))
            return 'object'; // typeof null === 'object'
        if (e.qjs_is_bool(handle.ptr))
            return 'boolean';
        if (e.qjs_is_number(handle.ptr))
            return 'number';
        if (e.qjs_is_big_int(handle.ptr))
            return 'bigint';
        if (e.qjs_is_string(handle.ptr))
            return 'string';
        if (e.qjs_is_symbol(handle.ptr))
            return 'symbol';
        if (e.qjs_is_function(handle.ptr))
            return 'function';
        if (e.qjs_is_object(handle.ptr))
            return 'object';
        return 'unknown';
    }
    /**
     * Convert a QuickJS handle to a host JavaScript value.
     * Handles strings, numbers, booleans, null, undefined, bigint, arrays,
     * errors, and plain objects.
     */
    dump(handle) {
        this.assertNotDisposed();
        const e = this.exports;
        if (e.qjs_is_undefined(handle.ptr))
            return undefined;
        if (e.qjs_is_null(handle.ptr))
            return null;
        if (e.qjs_is_bool(handle.ptr))
            return e.qjs_get_bool(handle.ptr) !== 0;
        if (e.qjs_is_number(handle.ptr))
            return e.qjs_get_float64(handle.ptr);
        if (e.qjs_is_string(handle.ptr))
            return handle.toString();
        if (e.qjs_is_big_int(handle.ptr))
            return handle.toBigInt();
        if (e.qjs_is_exception(handle.ptr)) {
            const exc = this.getException();
            const msg = exc.toString();
            exc.dispose();
            return new Error(msg);
        }
        if (e.qjs_is_array(handle.ptr)) {
            const lenHandle = handle.getProp('length');
            const len = e.qjs_get_float64(lenHandle.ptr);
            lenHandle.dispose();
            const arr = [];
            for (let i = 0; i < len; i++) {
                const elemPtr = e.qjs_get_prop_uint32(handle.ptr, i);
                const elemHandle = new JSValueHandle(this, elemPtr);
                arr.push(this.dump(elemHandle));
                elemHandle.dispose();
            }
            return arr;
        }
        if (e.qjs_is_error(handle.ptr)) {
            const nameHandle = handle.getProp('name');
            const msgHandle = handle.getProp('message');
            const stackHandle = handle.getProp('stack');
            const name = nameHandle.isUndefined ? 'Error' : nameHandle.toString();
            const message = msgHandle.isUndefined ? '' : msgHandle.toString();
            const stack = stackHandle.isUndefined ? undefined : stackHandle.toString();
            nameHandle.dispose();
            msgHandle.dispose();
            stackHandle.dispose();
            const err = new Error(message);
            err.name = name;
            if (stack !== undefined) {
                err.stack = stack;
            }
            return err;
        }
        if (e.qjs_is_object(handle.ptr)) {
            // Use JSON.stringify as a workaround for plain objects.
            const jsonResult = this.evalCode(`(v) => JSON.stringify(v)`);
            if (jsonResult.isException) {
                jsonResult.dispose();
                return '[object Object]';
            }
            const jsonStr = this.callFunction(jsonResult, this.undefined, handle);
            jsonResult.dispose();
            if (jsonStr.isException || e.qjs_is_undefined(jsonStr.ptr)) {
                jsonStr.dispose();
                return '[object Object]';
            }
            const str = jsonStr.toString();
            jsonStr.dispose();
            try {
                return JSON.parse(str);
            }
            catch {
                return str;
            }
        }
        return undefined;
    }
    /**
     * Convert a host JavaScript value to a QuickJS handle.
     */
    hostToHandle(value) {
        this.assertNotDisposed();
        if (value === undefined)
            return this.undefined;
        if (value === null)
            return this.null;
        if (value === true)
            return this.true;
        if (value === false)
            return this.false;
        if (typeof value === 'number')
            return this.newNumber(value);
        if (typeof value === 'string')
            return this.newString(value);
        if (typeof value === 'bigint')
            return this.newBigInt(value);
        if (value instanceof Error) {
            return this.newError(value);
        }
        if (Array.isArray(value)) {
            const arr = this.newArray();
            for (let i = 0; i < value.length; i++) {
                const elemHandle = this.hostToHandle(value[i]);
                this.exports.qjs_set_prop_uint32(arr.ptr, i, elemHandle.ptr);
                elemHandle.dispose();
            }
            return arr;
        }
        if (typeof value === 'object' && value !== null) {
            const obj = this.newObject();
            for (const [key, val] of Object.entries(value)) {
                const valHandle = this.hostToHandle(val);
                obj.setProp(key, valHandle);
                valHandle.dispose();
            }
            return obj;
        }
        return this.undefined;
    }
    // ---- Snapshot / Restore ----
    /**
     * Snapshot the entire VM state.
     */
    snapshot() {
        this.assertNotDisposed();
        const memory = this.exports.memory;
        const memoryBytes = new Uint8Array(memory.buffer);
        const memoryPages = memory.buffer.byteLength / 65536;
        return {
            memory: memoryBytes.slice(),
            stackPointer: this.exports.__stack_pointer.value,
            memoryPages,
            runtimePtr: this.exports.qjs_get_runtime_ptr(),
            contextPtr: this.exports.qjs_get_context_ptr(),
        };
    }
    /**
     * Re-register a host callback after restoring from a snapshot.
     * The func_id must match the ID that was used before the snapshot.
     */
    registerHostCallback(funcId, fn) {
        this.hostCallbacks.set(funcId, fn);
        if (funcId >= this.nextCallbackId) {
            this.nextCallbackId = funcId + 1;
        }
    }
    /**
     * Dispose the VM, freeing all resources.
     */
    dispose(leakCheck = true) {
        if (!this.disposed) {
            this.disposed = true;
            if (leakCheck) {
                try {
                    this.exports.qjs_destroy();
                }
                catch {
                    // QuickJS may assert if there are leaked objects in debug builds.
                }
            }
        }
    }
    /**
     * Support for `using` declarations (Explicit Resource Management).
     * Automatically disposes the VM when it goes out of scope.
     *
     * ```typescript
     * using vm = await QuickJS.create(wasmBytes);
     * vm.evalCode('1 + 2');
     * // vm is automatically disposed here
     * ```
     */
    [Symbol.dispose]() {
        this.dispose();
    }
    assertNotDisposed() {
        if (this.disposed) {
            throw new Error('QuickJS instance has been disposed');
        }
    }
    // ---- Internal accessors for JSValueHandle ----
    /** @internal */
    _getExports() {
        return this.exports;
    }
    /** @internal */
    _getMemory() {
        return this.exports.memory;
    }
    /** @internal */
    _writeString(str) {
        return this.writeString(str);
    }
    /** @internal */
    _readCString(ptr) {
        return this.readCString(ptr);
    }
}
// ---- JSValue Handle ----
/**
 * A handle to a JSValue inside the QuickJS WASM instance.
 */
export class JSValueHandle {
    vm;
    /** @internal */
    ptr;
    disposed = false;
    constructor(vm, ptr) {
        this.vm = vm;
        this.ptr = ptr;
    }
    get isException() {
        return this.vm._getExports().qjs_is_exception(this.ptr) !== 0;
    }
    get isUndefined() {
        return this.vm._getExports().qjs_is_undefined(this.ptr) !== 0;
    }
    get isNull() {
        return this.vm._getExports().qjs_is_null(this.ptr) !== 0;
    }
    /**
     * Get the promise state: 0 = pending, 1 = fulfilled, 2 = rejected
     */
    get promiseState() {
        return this.vm._getExports().qjs_promise_state(this.ptr);
    }
    /**
     * Get a property by name.
     */
    getProp(name) {
        const { ptr: namePtr } = this.vm._writeString(name);
        const resultPtr = this.vm._getExports().qjs_get_prop_string(this.ptr, namePtr);
        this.vm._getExports().wasm_free(namePtr);
        return new JSValueHandle(this.vm, resultPtr);
    }
    /**
     * Set a property by name.
     */
    setProp(name, value) {
        const { ptr: namePtr } = this.vm._writeString(name);
        this.vm._getExports().qjs_set_prop_string(this.ptr, namePtr, value.ptr);
        this.vm._getExports().wasm_free(namePtr);
    }
    /**
     * Extract the value as a number.
     */
    toNumber() {
        return this.vm._getExports().qjs_get_float64(this.ptr);
    }
    /**
     * Extract the value as a BigInt.
     */
    toBigInt() {
        const e = this.vm._getExports();
        const loPtr = e.wasm_malloc(4);
        const hiPtr = e.wasm_malloc(4);
        const ret = e.qjs_get_big_int64(this.ptr, loPtr, hiPtr);
        if (ret !== 0) {
            e.wasm_free(loPtr);
            e.wasm_free(hiPtr);
            throw new Error('Failed to convert value to BigInt');
        }
        const view = new DataView(e.memory.buffer);
        const lo = view.getUint32(loPtr, true);
        const hi = view.getInt32(hiPtr, true); // signed for the high word
        e.wasm_free(loPtr);
        e.wasm_free(hiPtr);
        return (BigInt(hi) << 32n) | BigInt(lo);
    }
    /**
     * Extract the value as a string (calls JS_ToCString - works on any value).
     */
    toString() {
        const cstrPtr = this.vm._getExports().qjs_get_string(this.ptr);
        if (cstrPtr === 0)
            return '<null>';
        const str = this.vm._readCString(cstrPtr);
        this.vm._getExports().qjs_free_cstring(cstrPtr);
        return str;
    }
    /**
     * Use this handle, then dispose it. Returns the callback's return value.
     */
    consume(fn) {
        try {
            return fn(this);
        }
        finally {
            this.dispose();
        }
    }
    /**
     * Duplicate this handle (increment refcount).
     */
    dup() {
        return new JSValueHandle(this.vm, this.vm._getExports().qjs_dup_value(this.ptr));
    }
    /**
     * Dispose this handle, freeing the heap-allocated JSValue.
     */
    dispose() {
        if (!this.disposed) {
            this.vm._getExports().qjs_free_value(this.ptr);
            this.disposed = true;
        }
    }
    /**
     * Support for `using` declarations (Explicit Resource Management).
     * Automatically disposes the handle when it goes out of scope.
     *
     * ```typescript
     * using result = vm.evalCode('1 + 2');
     * console.log(result.toNumber()); // 3
     * // result is automatically disposed here
     * ```
     */
    [Symbol.dispose]() {
        this.dispose();
    }
}
//# sourceMappingURL=index.js.map