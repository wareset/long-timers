export declare class LongTimeout<F extends (this: LongTimeout<F>, ...args: any[]) => any = any> {
    private _;
    constructor(callback: F, delay: number | undefined, args: Parameters<F>, isRepeat: boolean, isRefed: boolean);
    /**
     * Отменить таймаут/интервал.
     */
    close(): this;
    /**
     * Перезапустить таймаут/интервал.
     */
    refresh(): this;
    /**
     * Для Nodejs.
     * Будет ли Nodejs ждать пока существует таймаут/интервал.
     * По умолчанию равен 'true'.
     */
    hasRef(): boolean;
    /**
     * Работает только в Nodejs.
     * Nodejs не остановится пока существует таймаут/интервал.
     */
    ref(): this;
    /**
     * Работает только в Nodejs.
     * Nodejs может завершиться не дожидаясь таймаут/интервал.
     */
    unref(): this;
}
export declare function setLongTimeout<F extends (this: LongTimeout<F>, ...args: any[]) => any>(callback: F, delay?: number, ...args: Parameters<F>): LongTimeout<F>;
export declare function setLongInterval<F extends (this: LongTimeout<F>, ...args: any[]) => any>(callback: F, delay?: number, ...args: Parameters<F>): LongTimeout<F>;
export declare function clearLongTimeout(longTimeoutOrInterval: LongTimeout): void;
export { clearLongTimeout as clearLongInterval };
