const EXEC_TIME = 21e8
const DIFF_TIME = 214e7

const __setTimeout = setTimeout
const __clearTimeout = clearTimeout

const __performance = typeof performance === 'object' ? performance : Date

function loop(iam: LongTimeout, ms: number) {
  // @ts-ignore
  const _ = iam._
  _.to =
    ms > DIFF_TIME
      ? __setTimeout(
          // prettier-ignore
          function () { loop(iam, ms - EXEC_TIME) },
          ((_.pn += EXEC_TIME), EXEC_TIME)
        )
      : __setTimeout(
          _.cb,
          (ms -= __performance.now() - (_.pn += ms)) >= 1 ? ms : 1
        )

  _.hr ? iam.ref() : iam.unref()
}

export class LongTimeout<
  F extends (this: LongTimeout<F>, ...args: any[]) => any = any,
> {
  private _: {
    // performance.now
    pn: number
    // NodeJS.Timeout or number (timeoutId)
    to: NodeJS.Timeout
    // callback
    cb: any // борьба с ts
    // delay
    ms: number
    // has ref
    hr: boolean
  }

  constructor(
    callback: F,
    delay: number | undefined,
    args: Parameters<F>,
    isRepeat: boolean,
    isRefed: boolean
  ) {
    const iam = this
    this._ = {
      pn: __performance.now(),
      to: 0 as any,
      cb() {
        if (isRepeat) loop(iam, iam._.ms)
        callback.apply(iam, args)
      },
      ms: (delay = (delay = +delay!) >= 1 ? delay : 1),
      hr: isRefed,
    }
    loop(this, delay)
  }

  /**
   * Отменить таймаут/интервал.
   */
  close() {
    return __clearTimeout(this._.to), this
  }

  /**
   * Перезапустить таймаут/интервал.
   */
  refresh() {
    this._.pn = __performance.now()
    return this.close(), loop(this, this._.ms), this
  }

  /**
   * Для Nodejs.
   * Будет ли Nodejs ждать пока существует таймаут/интервал.
   * По умолчанию равен 'true'.
   */
  hasRef() {
    return this._.hr
  }

  /**
   * Работает только в Nodejs.
   * Nodejs не остановится пока существует таймаут/интервал.
   */
  ref() {
    const _ = this._
    return (_.hr = true), _.to.ref && _.to.ref(), this
  }

  /**
   * Работает только в Nodejs.
   * Nodejs может завершиться не дожидаясь таймаут/интервал.
   */
  unref() {
    const _ = this._
    return (_.hr = false), _.to.unref && _.to.unref(), this
  }
}

export function setLongTimeout<
  F extends (this: LongTimeout<F>, ...args: any[]) => any,
>(callback: F, delay?: number, ...args: Parameters<F>): LongTimeout<F> {
  return new LongTimeout(callback, delay, args, false, true)
}

export function setLongInterval<
  F extends (this: LongTimeout<F>, ...args: any[]) => any,
>(callback: F, delay?: number, ...args: Parameters<F>): LongTimeout<F> {
  return new LongTimeout(callback, delay, args, true, true)
}

export function clearLongTimeout(longTimeoutOrInterval: LongTimeout) {
  if (longTimeoutOrInterval instanceof LongTimeout)
    longTimeoutOrInterval.close()
}

export { clearLongTimeout as clearLongInterval }
