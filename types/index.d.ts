export declare class ITimeout {
    close(): this;
    refresh(): this;
    hasRef(): boolean;
    ref(): this;
    unref(): this;
}
declare function longSetTimeout<F extends (...a: any[]) => any>(callback: F, ms?: number, ...args: Parameters<F>): ITimeout;
declare function longSetInterval<F extends (...a: any[]) => any>(callback: F, ms?: number, ...args: Parameters<F>): ITimeout;
export { longSetTimeout, longSetInterval };
