export interface ITimeout {
    close(): this;
    refresh(): this;
    hasRef(): boolean;
    ref(): this;
    unref(): this;
}
declare function setLongTimeout<F extends (...a: any[]) => any>(callback: F, ms?: number, ...args: Parameters<F>): ITimeout;
declare function setLongInterval<F extends (...a: any[]) => any>(callback: F, ms?: number, ...args: Parameters<F>): ITimeout;
export { setLongTimeout, setLongInterval };
