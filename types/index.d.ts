export interface ITimeout {
    close(): this;
    refresh(): this;
    hasRef(): boolean;
    ref(): this;
    unref(): this;
}
declare function setLongTimeout<F extends (this: ITimeout, ...a: any[]) => any>(callback: F, ms?: number, ...args: Parameters<F>): ITimeout;
declare function setLongInterval<F extends (this: ITimeout, ...a: any[]) => any>(callback: F, ms?: number, ...args: Parameters<F>): ITimeout;
export { setLongTimeout, setLongInterval };
declare const _default: {
    setLongTimeout: typeof setLongTimeout;
    setLongInterval: typeof setLongInterval;
};
export default _default;
