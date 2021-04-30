import Router, { IMiddleware, RouterContext } from 'koa-router'
import { Next } from 'koa'
import basicAuth, { BasicAuthResult } from 'basic-auth'

import { verifyToken } from '../util'
import { isInScope } from '../../app/lib/scope'

export default class Auth {
  // 设置属性
  private static ctx: Router.RouterContext
  private static routerName: string


  /**
   * 权限校验
   * @param {String} routerName 视图函数的名称
   * @returns
   */
  static get verify() {
    return (routerName: string): IMiddleware => {
      return async (ctx: RouterContext, next: Next) => {
        // 如何判断「公开API」和「非公开API」
        this.ctx = ctx
        this.routerName = routerName
        const authInfo: BasicAuthResult | undefined = basicAuth(ctx.req) // 解析
        if (!authInfo || !authInfo.name) {
          throw new (global as any).errs.Forbbiden('token不合法')
        }

        const { name: token } = authInfo
        const { uid, scope } = verifyToken(token)
        if (!isInScope(scope, this.endpoint)) {
          throw new (global as any).errs.Forbbiden('权限不足')
        }
        // 可传递给后续用
        (ctx as any).auth = { uid, scope }
        await next()
      }
    }
  }

  /**
   * 视图函数的唯一标识: {路由版本}.{路由类别}+{函数名}
   *             E.g: v1.classic+getLatest
   *
   * @returns
   */
  static get endpoint() {
    const [, routerVersion, routerCategory] = this.ctx.url.split('/')
    const { routerName } = this
    return `${routerVersion}.${routerCategory}+${routerName}`
  }
}

