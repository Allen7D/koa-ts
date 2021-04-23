// 成功的errorCode的3种类型
enum SuccessTypes {
  GET,              // 获取成功
  CREATE_OR_UPDATE, // 创建 | 更新成功
  DELETE            // 删除成功
}

// [常见的HTTP状态码](https://www.jianshu.com/p/369db1ba04ea)
export class HttpException extends Error {
  public code: number
  public msg: string | Array<string>
  public errorCode: number

  constructor(msg = '服务器异常', errorCode = 10000, code = 400) {
    super()
    // [在Typescript里extends Error的终极方案](https://zhuanlan.zhihu.com/p/113019880)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, new.target)
    }
    if (typeof Object.setPrototypeOf === 'function') {
      Object.setPrototypeOf(this, new.target.prototype)
    } else {
      (this as any).__proto__ = new.target.prototype
    }

    this.code = code // HTTP StatusCode
    this.msg = msg
    this.errorCode = errorCode
  }
}


// 请求成功
export class Success extends HttpException {
  public data: object | undefined

  constructor(data?: object, errorCode?: number, msg?: string, code?: number) {
    super()
    this.data = data || undefined
    this.errorCode = errorCode || SuccessTypes.GET
    switch (errorCode) {
      case SuccessTypes.CREATE_OR_UPDATE:
        this.code = 201
        this.msg = msg || '创建 | 更新成功'
        break
      case SuccessTypes.DELETE:
        this.code = 202 // 代替204
        this.msg = msg || '删除成功'
        break
      default:
        // 默认都是请求成功
        this.code = code || 200
        this.msg = msg || '请求成功'
    }
  }
}

// 资源未找到
export class NotFound extends HttpException {
  constructor(msg?: string, errorCode?: number) {
    super()
    this.code = 404
    this.msg = msg || '资源未找到'
    this.errorCode = errorCode || 10000
  }
}

// 登录失败(等同于授权失败)
export class AuthFailed extends HttpException {
  constructor(msg?: string, errorCode?: number) {
    super()
    this.code = 401
    this.msg = msg || '授权失败'
    this.errorCode = errorCode || 10004
  }
}

// 禁止访问
export class Forbbiden extends HttpException {
  constructor(msg?: string, errorCode?: number) {
    super()
    this.code = 403
    this.msg = msg || '禁止访问'
    this.errorCode = errorCode || 10006
  }
}

// 参数错误
export class ParameterException extends HttpException {
  constructor(msg?: string | Array<string>, errorCode?: number) {
    super()
    this.code = 400
    this.msg = msg || '参数错误'
    this.errorCode = errorCode || 10000
  }
}

// 重复错误
export class RepeatException extends HttpException {
  constructor(msg?: string | Array<string>, errorCode?: number) {
    super()
    this.code = 400
    this.msg = msg || '数据重复错误'
    this.errorCode = errorCode || 10110
  }
}
