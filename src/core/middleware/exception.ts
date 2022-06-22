import { RouterContext } from 'koa-router'

import { APIException, Success } from '@core/exception'

/**
 * 异常处理的中间件
 * @param ctx {RouterContext} 上下文
 * @param error {Error} 异常
 */
export const catchError = async (ctx: RouterContext, next: any) => {
  try {
    await next()
  } catch (error: any) {
    handleError(ctx, error)
  }
}

/**
 * 异常处理逻辑
 * @param ctx {RouterContext} 上下文
 * @param error {Error} 异常
 */
function handleError(ctx: RouterContext, error: Error) {
  const isAPIException = error instanceof APIException
  const isDev = (global as any).config.environment === 'dev'
  if (isDev && !isAPIException) {
    // 在开发环境，直接抛出未知异常的具体信息
    throw error
  }

  if (error instanceof Success) {
    ctx.body = {
      data: error.data,
      msg: error.msg,
      error_code: error.errorCode,
    }
    ctx.status = error.code
  } else if (error instanceof APIException) {
    ctx.body = {
      msg: error.msg,
      error_code: error.errorCode,
      request: `${ctx.method} ${ctx.path}`,
    }
    ctx.status = error.code
  } else {
    // 所有自定义之外的异常，都是服务端异常
    ctx.body = {
      msg: '服务端异常',
      error_code: 999,
      request: `${ctx.method} ${ctx.path}`,
    }
    ctx.status = 500
  }
}
