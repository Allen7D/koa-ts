import { RouterContext } from 'koa-router'

import UserModel from '../../model/user'
import { api, auth } from '../../../core/decorator'
import { PositiveIntegerValidator } from '../../validator'

@api.controller('/cms/user')
class UserController {

  /**
   * 查询用户信息
   * @param uid {Number} 用户ID
   * @returns 用户信息
   */
  @api.get('/:uid')
  @auth.login_required
  async getUser(ctx: RouterContext) {
    const validator = await new PositiveIntegerValidator().validate(ctx, {
      id: 'uid',
    })
    const uid = validator.get('path.uid')
    const user = await UserModel.findOne({
      where: {
        id: uid
      }
    })
    throw new (global as any).errs.Success(user)
  }
}
