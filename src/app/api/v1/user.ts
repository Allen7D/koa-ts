import { RouterContext } from 'koa-router'

import UserModel from '@app/model/user'
import { RegisterValidator } from '@app/validator'
import { api, auth } from '@core/decorator'

@api.controller('/v1/user')
class UserController {
  /**
   * 获取用户信息
   * @returns 用户信息
   */
  @api.get('/')
  @auth.login_required
  async getUser(ctx: RouterContext) {
    const { uid } = (ctx as any).auth
    const user = await UserModel.findOne({
      where: {
        id: uid,
      },
    })
    throw new (global as any).errs.Success(user)
  }

  /**
   * 用户注册
   * @param email {String} 邮箱
   * @param nickname {String} 用户昵称
   * @param password1 {String} 密码
   * @param password2 {String} 校验密码
   * @returns 用户信息
   */
  @api.post('/register')
  async register(ctx: RouterContext) {
    const validator = await new RegisterValidator().validate(ctx)
    const { email, nickname, password1: password } = validator.get('body')
    const user: UserModel = await UserModel.create({
      email,
      nickname,
      password,
    } as UserModel)

    throw new (global as any).errs.Success(user)
  }
}
