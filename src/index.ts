function loop(iam: Timeout, ms: number) {
  const MAX_TIME = 2e9 // 2e9
  iam._.t =
    ms > MAX_TIME
      ? setTimeout(function () {
          loop(iam, ms - MAX_TIME)
        }, MAX_TIME)
      : setTimeout(function () {
          if (iam._.i) loop(iam, iam._.m)
          iam._.f.apply(iam, iam._.a)
        }, ms)
  iam.hasRef() || iam.unref()
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
    loop(this, ms)
  }

  close() {
    return clearTimeout(this._.t), this
  }

  refresh() {
    return this.close(), loop(this, this._.m), this
  }

  hasRef() {
    const _ = this._
    return _.t.hasRef ? (_.r = _.t.hasRef()) : _.r
  }

  ref() {
    const _ = this._
    return _.r || (_.t.ref && _.t.ref()), (_.r = true), this
  }

  unref() {
    const _ = this._
    return _.r && _.t.unref && _.t.unref(), (_.r = false), this
  }
}

//   _Timeout = Timeout
//   return new _Timeout(_cb, _ms, _isRepeat, _args)
// } as any

export declare class ITimeout {
  close(): this
  refresh(): this
  hasRef(): boolean
  ref(): this
  unref(): this
}

function longSetTimeout<F extends (...a: any[]) => any>(
  callback: F,
  ms?: number,
  ...args: Parameters<F>
) {
  return new Timeout(callback, ms, false, args) as ITimeout
}

function longSetInterval<F extends (...a: any[]) => any>(
  callback: F,
  ms?: number,
  ...args: Parameters<F>
) {
  return new Timeout(callback, ms, true, args) as ITimeout
}

export { longSetTimeout, longSetInterval }
