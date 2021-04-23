import Router, { RouterContext } from 'koa-router'

import { LoginValidator, TokenValidator } from '../../validator'
import { verifyToken } from '../../../core/util'
import LoginVerifyService from '../../service/login-verify'
import { api } from '../../../core/decorator'

const router = new Router({
  prefix: '/v1/token',
})

@api.controller(router)
class ClassicController {

  /**
   * 获取token，实现登录(支持多种登录方式)
   * @param account {String} 账号
   * @param secret {String} 密码
   * @param type {Number} 登录类型
   * @returns token
   */
  @api.post('/')
  async getToken(ctx: RouterContext) {
    const validator = await new LoginValidator().validate(ctx)
    const { account, secret, type }:
      { account: string, secret: string, type: number } = validator.get('body')
    const token = await LoginVerifyService.getToken(account, secret, type)
    throw new (global as any).errs.Success({ token })
  }

  /**
   * token校验
   * @param token {String} 登录令牌
   * @returns token解码信息
   */
  @api.post('/verify')
  async decryptToken(ctx: RouterContext) {
    const validator = await new TokenValidator().validate(ctx)
    const token = validator.get('body.token')
    const decode = verifyToken(token)
    throw new (global as any).errs.Success(decode)
  }
}

export default router
