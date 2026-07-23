/**
 * QuickJS WASM - A snapshotable JavaScript runtime via WebAssembly.
 *
 * Provides a clean JavaScript API for running sandboxed JS code in a QuickJS
 * VM compiled to WASM. The key differentiator is the ability to snapshot the
 * entire VM state (including pending promises) and restore it in a fresh
 * WASM instance.
 */
export type HostFunction = (this_val: JSValueHandle, ...args: JSValueHandle[]) => JSValueHandle;
interface QuickJSExports {
    memory: WebAssembly.Memory;
    __stack_pointer: WebAssembly.Global;
    _initialize(): void;
    qjs_init(): number;
    qjs_destroy(): void;
    qjs_eval(codePtr: number, codeLen: number, filenamePtr: number, flags: number): number;
    qjs_new_string(strPtr: number, strLen: number): number;
    qjs_new_number(num: number): number;
    qjs_new_object(): number;
    qjs_new_array(): number;
    qjs_get_undefined(): number;
    qjs_get_null(): number;
    qjs_get_true(): number;
    qjs_get_false(): number;
    qjs_new_big_int64(lo: number, hi: number): number;
    qjs_get_big_int64(valPtr: number, loOutPtr: number, hiOutPtr: number): number;
    qjs_get_float64(valPtr: number): number;
    qjs_get_string(valPtr: number): number;
    qjs_free_cstring(strPtr: number): void;
    qjs_typeof(valPtr: number): number;
    qjs_is_exception(valPtr: number): number;
    qjs_is_undefined(valPtr: number): number;
    qjs_is_null(valPtr: number): number;
    qjs_is_bool(valPtr: number): number;
    qjs_is_number(valPtr: number): number;
    qjs_is_string(valPtr: number): number;
    qjs_is_object(valPtr: number): number;
    qjs_is_array(valPtr: number): number;
    qjs_is_function(valPtr: number): number;
    qjs_is_error(valPtr: number): number;
    qjs_is_promise(valPtr: number): number;
    qjs_is_symbol(valPtr: number): number;
    qjs_is_big_int(valPtr: number): number;
    qjs_get_bool(valPtr: number): number;
    qjs_dup_value(valPtr: number): number;
    qjs_free_value(valPtr: number): void;
    qjs_get_global(): number;
    qjs_get_prop_string(objPtr: number, namePtr: number): number;
    qjs_set_prop_string(objPtr: number, namePtr: number, valPtr: number): number;
    qjs_get_prop_uint32(objPtr: number, idx: number): number;
    qjs_set_prop_uint32(objPtr: number, idx: number, valPtr: number): number;
    qjs_call(funcPtr: number, thisPtr: number, argc: number, argvPtr: number): number;
    qjs_new_host_function(namePtr: number, nameLen: number, funcId: number, argCount: number): number;
    qjs_new_promise(resolveOutPtr: number, rejectOutPtr: number): number;
    qjs_promise_state(promisePtr: number): number;
    qjs_promise_result(promisePtr: number): number;
    qjs_is_job_pending(): number;
    qjs_execute_pending_job(): number;
    qjs_get_exception(): number;
    qjs_new_error(): number;
    qjs_get_runtime_ptr(): number;
    qjs_get_context_ptr(): number;
    qjs_set_runtime_and_context(rtPtr: number, ctxPtr: number): void;
    malloc(size: number): number;
    free(ptr: number): void;
    wasm_malloc(size: number): number;
    wasm_free(ptr: number): void;
}
export interface Snapshot {
    /** The raw WASM linear memory contents */
    memory: Uint8Array;
    /** The stack pointer value at snapshot time */
    stackPointer: number;
    /** Size of memory in WASM pages (64KB each) */
    memoryPages: number;
    /** Pointer to JSRuntime in the WASM memory */
    runtimePtr: number;
    /** Pointer to JSContext in the WASM memory */
    contextPtr: number;
}
export interface Deferred {
    /** Handle to the QuickJS promise object */
    handle: JSValueHandle;
    /** A host-side Promise that resolves when the QuickJS promise settles */
    settled: Promise<void>;
    /** Resolve the QuickJS promise with a value */
    resolve(value: JSValueHandle): void;
    /** Reject the QuickJS promise with a value */
    reject(value: JSValueHandle): void;
}
export declare class QuickJS {
    private exports;
    private module;
    private instance;
    private encoder;
    private decoder;
    private disposed;
    /** Registry of host callbacks, keyed by integer ID */
    private hostCallbacks;
    private nextCallbackId;
    private _global;
    private _undefined;
    private _null;
    private _true;
    private _false;
    private constructor();
    private setInstance;
    /** The global object. Cached — do not dispose. */
    get global(): JSValueHandle;
    /** The undefined value. Cached — do not dispose. */
    get undefined(): JSValueHandle;
    /** The null value. Cached — do not dispose. */
    get null(): JSValueHandle;
    /** The true value. Cached — do not dispose. */
    get true(): JSValueHandle;
    /** The false value. Cached — do not dispose. */
    get false(): JSValueHandle;
    /**
     * Create a fresh QuickJS VM instance.
     */
    static create(wasmInput?: BufferSource | WebAssembly.Module): Promise<QuickJS>;
    /**
     * Restore a QuickJS VM from a snapshot.
     */
    static restore(snapshot: Snapshot, wasmInput?: BufferSource | WebAssembly.Module): Promise<QuickJS>;
    private static resolveModule;
    private static instantiate;
    /**
     * Called from WASM when a host function is invoked from QuickJS code.
     */
    private handleHostCall;
    /** Write a JS string into WASM memory, returning the pointer. Caller must free. */
    private writeString;
    /** Read a null-terminated C string from WASM memory */
    private readCString;
    /**
     * Evaluate JavaScript code and return the result as a handle.
     * If the code throws, the returned handle will have `isException === true`.
     */
    evalCode(code: string, filename?: string): JSValueHandle;
    /**
     * Unwrap a result handle. If it's an exception, throws a host Error
     * with the QuickJS error as the `cause`. Otherwise returns the handle.
     */
    unwrapResult(result: JSValueHandle): JSValueHandle;
    /**
     * Execute all pending microtask jobs (promise reactions, etc.)
     * Returns the number of jobs executed.
     */
    executePendingJobs(): number;
    /**
     * Get the global object. Prefer the cached `vm.global` property.
     */
    getGlobal(): JSValueHandle;
    /**
     * Create a new QuickJS string value.
     */
    newString(str: string): JSValueHandle;
    /**
     * Create a new QuickJS number value.
     */
    newNumber(num: number): JSValueHandle;
    /**
     * Create a new QuickJS BigInt value.
     */
    newBigInt(val: bigint): JSValueHandle;
    /**
     * Create a new QuickJS object value.
     */
    newObject(): JSValueHandle;
    /**
     * Create a new QuickJS array value.
     */
    newArray(): JSValueHandle;
    /**
     * Get undefined. Prefer the cached `vm.undefined` property.
     */
    getUndefined(): JSValueHandle;
    /**
     * Get null. Prefer the cached `vm.null` property.
     */
    getNull(): JSValueHandle;
    /**
     * Get true. Prefer the cached `vm.true` property.
     */
    getTrue(): JSValueHandle;
    /**
     * Get false. Prefer the cached `vm.false` property.
     */
    getFalse(): JSValueHandle;
    /**
     * Create a new QuickJS function backed by a host callback.
     *
     * When the function is called inside QuickJS, the host callback is invoked
     * with the `this` value and arguments as JSValueHandles.
     */
    newFunction(name: string, fn: HostFunction): JSValueHandle;
    /**
     * Create a new promise.
     *
     * Returns a Deferred with:
     * - `handle` - the QuickJS promise object
     * - `settled` - a host Promise that resolves when the QuickJS promise settles
     * - `resolve(value)` - resolve the promise with a QuickJS value
     * - `reject(value)` - reject the promise with a QuickJS value
     */
    newPromise(): Deferred;
    /**
     * Resolve a promise handle. Returns a host-side Promise that resolves
     * with the settled value/error of the QuickJS promise.
     *
     * If the handle is not a promise, it is treated as an already-fulfilled value.
     *
     * The returned host Promise resolves to `{ value: JSValueHandle }` on
     * fulfillment or `{ error: JSValueHandle }` on rejection.
     */
    resolvePromise(promiseHandle: JSValueHandle): Promise<{
        value: JSValueHandle;
    } | {
        error: JSValueHandle;
    }>;
    /**
     * Call a QuickJS function.
     */
    callFunction(func: JSValueHandle, thisVal: JSValueHandle, ...args: JSValueHandle[]): JSValueHandle;
    /**
     * Set a property on an object. Accepts string or JSValueHandle as key.
     */
    setProp(obj: JSValueHandle, key: string | JSValueHandle, value: JSValueHandle): void;
    /**
     * Get the current exception, if any.
     */
    getException(): JSValueHandle;
    /**
     * Create a new QuickJS Error object.
     * Accepts a string message or a native Error object.
     */
    newError(messageOrError: string | Error): JSValueHandle;
    /**
     * Get the typeof a handle as a string.
     */
    typeof(handle: JSValueHandle): string;
    /**
     * Convert a QuickJS handle to a host JavaScript value.
     * Handles strings, numbers, booleans, null, undefined, bigint, arrays,
     * errors, and plain objects.
     */
    dump(handle: JSValueHandle): unknown;
    /**
     * Convert a host JavaScript value to a QuickJS handle.
     */
    hostToHandle(value: unknown): JSValueHandle;
    /**
     * Snapshot the entire VM state.
     */
    snapshot(): Snapshot;
    /**
     * Re-register a host callback after restoring from a snapshot.
     * The func_id must match the ID that was used before the snapshot.
     */
    registerHostCallback(funcId: number, fn: HostFunction): void;
    /**
     * Dispose the VM, freeing all resources.
     */
    dispose(leakCheck?: boolean): void;
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
    [Symbol.dispose](): void;
    private assertNotDisposed;
    /** @internal */
    _getExports(): QuickJSExports;
    /** @internal */
    _getMemory(): WebAssembly.Memory;
    /** @internal */
    _writeString(str: string): {
        ptr: number;
        len: number;
    };
    /** @internal */
    _readCString(ptr: number): string;
}
/**
 * A handle to a JSValue inside the QuickJS WASM instance.
 */
export declare class JSValueHandle {
    private vm;
    /** @internal */
    readonly ptr: number;
    private disposed;
    constructor(vm: QuickJS, ptr: number);
    get isException(): boolean;
    get isUndefined(): boolean;
    get isNull(): boolean;
    /**
     * Get the promise state: 0 = pending, 1 = fulfilled, 2 = rejected
     */
    get promiseState(): number;
    /**
     * Get a property by name.
     */
    getProp(name: string): JSValueHandle;
    /**
     * Set a property by name.
     */
    setProp(name: string, value: JSValueHandle): void;
    /**
     * Extract the value as a number.
     */
    toNumber(): number;
    /**
     * Extract the value as a BigInt.
     */
    toBigInt(): bigint;
    /**
     * Extract the value as a string (calls JS_ToCString - works on any value).
     */
    toString(): string;
    /**
     * Use this handle, then dispose it. Returns the callback's return value.
     */
    consume<T>(fn: (handle: JSValueHandle) => T): T;
    /**
     * Duplicate this handle (increment refcount).
     */
    dup(): JSValueHandle;
    /**
     * Dispose this handle, freeing the heap-allocated JSValue.
     */
    dispose(): void;
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
    [Symbol.dispose](): void;
}
export {};
//# sourceMappingURL=index.d.ts.map