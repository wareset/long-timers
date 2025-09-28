const MAX_TIME = 2e9
const __setTimeout = setTimeout
const __performance = typeof performance === 'object' ? performance : Date

function loop(iam: LongTimeout, ms: number, isFirst?: 1) {
  // @ts-ignore
  const _ = iam._,
    timeout = (_.to =
      ms > MAX_TIME
        ? __setTimeout(
            // prettier-ignore
            function () { loop(iam, ms - MAX_TIME) },
            ((_.pn += MAX_TIME), MAX_TIME)
          )
        : __setTimeout(_.cb, ms - (__performance.now() - (_.pn += ms))))

  if (isFirst) _.hr = timeout.hasRef ? timeout.hasRef() : true
  else _.hr ? iam.ref() : iam.unref()
}

class LongTimeout {
  private _: {
    pn: number
    to: NodeJS.Timeout
    cb: any // борьба с ts
    ms: number
    hr: boolean
  }

  constructor(
    callback: Function,
    ms: number | undefined,
    isRepeat: boolean,
    args: any[]
  ) {
    const iam = this
    this._ = {
      pn: __performance.now(),
      to: 0 as any,
      cb() {
        if (isRepeat) loop(iam, iam._.ms)
        callback.apply(iam, args)
      },
      ms: (ms = (ms = +ms!) > 0 ? ms : 0),
      hr: true,
    }
    loop(this, ms, 1)
  }

  /**
   * Отменить таймаут/интервал
   */
  close() {
    return clearTimeout(this._.to), this
  }

  /**
   * Перезапустить таймаут/интервал
   */
  refresh() {
    this._.pn = __performance.now()
    return this.close(), loop(this, this._.ms), this
  }

  /**
   * Для nodejs
   * Будет ли nodejs ждать пока исполняется таймаут/интервал
   */
  hasRef() {
    return this._.hr
  }

  /**
   * Для nodejs
   * nodejs не остановится пока исполняется таймаут/интервал
   */
  ref() {
    const _ = this._
    return (_.hr = true), _.to.ref && _.to.ref(), this
  }

  /**
   * Для nodejs
   * nodejs может остановиться не дожидаясь таймаут/интервал
   */
  unref() {
    const _ = this._
    return (_.hr = false), _.to.unref && _.to.unref(), this
  }
}

export interface ITimeout {
  close(): this
  refresh(): this
  hasRef(): boolean
  ref(): this
  unref(): this
}

function setLongTimeout<F extends (this: ITimeout, ...a: any[]) => any>(
  callback: F,
  ms?: number,
  ...args: Parameters<F>
) {
  return new LongTimeout(callback, ms, false, args) as ITimeout
}

function setLongInterval<F extends (this: ITimeout, ...a: any[]) => any>(
  callback: F,
  ms?: number,
  ...args: Parameters<F>
) {
  return new LongTimeout(callback, ms, true, args) as ITimeout
}

export { setLongTimeout, setLongInterval }
