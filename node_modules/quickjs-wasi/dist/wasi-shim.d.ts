/**
 * Minimal WASI shim for running QuickJS in any WebAssembly environment.
 *
 * Only implements the subset of WASI snapshot_preview1 that QuickJS actually uses:
 *   - clock_time_get (for Date.now())
 *   - fd_write (for console output via printf/fprintf)
 *   - fd_close (stub)
 *   - fd_fdstat_get (stub)
 *   - fd_seek (stub)
 *   - random_get (for Math.random / crypto.getRandomValues)
 */
/** Returns a wasi_snapshot_preview1 import object for WASM instantiation. */
export declare function createWasiShim(memoryAccessor: () => WebAssembly.Memory): {
    clock_time_get(clockId: number, _precision: bigint, resultPtr: number): number;
    fd_write(fd: number, iovsPtr: number, iovsLen: number, nwrittenPtr: number): number;
    fd_close(_fd: number): number;
    fd_fdstat_get(fd: number, statPtr: number): number;
    fd_seek(_fd: number, _offset: bigint, _whence: number, _resultPtr: number): number;
    random_get(bufPtr: number, bufLen: number): number;
};
//# sourceMappingURL=wasi-shim.d.ts.map