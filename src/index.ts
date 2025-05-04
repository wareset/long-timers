function loop(iam: Timeout, ms: number, first?: boolean) {
  const MAX_TIME = 2e9 // 2e9
  const _ = iam._
  _.t =
    ms > MAX_TIME
      ? setTimeout(function () {
          loop(iam, ms - MAX_TIME)
        }, MAX_TIME)
      : setTimeout(function () {
          if (_.i) loop(iam, _.m)
          _.f.apply(iam, _.a)
        }, ms)
  if (first) _.r = _.t.hasRef ? _.t.hasRef() : true
  else iam.hasRef() ? iam.ref() : iam.unref()
}

class Timeout {
  _: {
    t: NodeJS.Timeout
    f: Function
    m: number
    i: boolean
    a: any[]
    r: boolean
  }

  constructor(
    cb: Function,
    ms: number | undefined,
    isRep: boolean,
    args: any[]
  ) {
    this._ = {
      t: 0 as any,
      f: cb,
      m: (ms = (ms = +ms!) > 0 ? ms : 0),
      i: isRep,
      a: args,
      r: true,
    }
    loop(this, ms, true)
  }

  close() {
    return clearTimeout(this._.t), this
  }

  refresh() {
    return this.close(), loop(this, this._.m), this
  }

  hasRef() {
    const _ = this._
    return _.r
  }

  ref() {
    const _ = this._
    return (_.r = true), _.t.ref && _.t.ref(), this
  }

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

function setLongTimeout<F extends (...a: any[]) => any>(
  callback: F,
  ms?: number,
  ...args: Parameters<F>
) {
  return new Timeout(callback, ms, false, args) as ITimeout
}

function setLongInterval<F extends (...a: any[]) => any>(
  callback: F,
  ms?: number,
  ...args: Parameters<F>
) {
  return new Timeout(callback, ms, true, args) as ITimeout
}

export { setLongTimeout, setLongInterval }
