const MAX_TIME = 2e9

function loop(iam: LongTimeout, ms: number, first?: boolean) {
  const _ = iam._

  if (ms > MAX_TIME) {
    if (_.i !== null) {
      _.i += MAX_TIME
    }

    _.t = setTimeout(function () {
      loop(iam, ms - MAX_TIME)
    }, MAX_TIME)
  } else {
    if (_.i !== null) {
      const offset = performance.now() - _.i
      _.i += ms
      ms -= offset
    }

    _.t = setTimeout(function () {
      if (_.i !== null) loop(iam, _.m)
      _.f.apply(iam, _.a)
    }, ms)
  }

  if (first) _.r = _.t.hasRef ? _.t.hasRef() : true
  else iam.hasRef() ? iam.ref() : iam.unref()
}

class LongTimeout {
  _: {
    t: NodeJS.Timeout
    f: Function
    m: number
    i: number | null
    a: any[]
    r: boolean
  }

  constructor(
    callback: Function,
    ms: number | undefined,
    repeatTime: number | null,
    args: any[]
  ) {
    this._ = {
      t: 0 as any,
      f: callback,
      m: (ms = (ms = +ms!) > 0 ? ms : 0),
      i: repeatTime,
      a: args,
      r: true,
    }
    loop(this, ms, true)
  }

  /**
   * Отменить таймаут/интервал
   */
  close() {
    return clearTimeout(this._.t), this
  }

  /**
   * Перезапустить таймаут/интервал
   */
  refresh() {
    this._.i === null || (this._.i = performance.now())
    return this.close(), loop(this, this._.m), this
  }

  /**
   * Для nodejs
   * Будет ли nodejs ждать пока исполняется таймаут/интервал
   */
  hasRef() {
    const _ = this._
    return _.r
  }

  /**
   * Для nodejs
   * nodejs не остановится пока исполняется таймаут/интервал
   */
  ref() {
    const _ = this._
    return (_.r = true), _.t.ref && _.t.ref(), this
  }

  /**
   * Для nodejs
   * nodejs может остановиться не дожидаясь таймаут/интервал
   */
  unref() {
    const _ = this._
    return (_.r = false), _.t.unref && _.t.unref(), this
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
  return new LongTimeout(callback, ms, null, args) as ITimeout
}

function setLongInterval<F extends (this: ITimeout, ...a: any[]) => any>(
  callback: F,
  ms?: number,
  ...args: Parameters<F>
) {
  return new LongTimeout(callback, ms, performance.now(), args) as ITimeout
}

export { setLongTimeout, setLongInterval }
