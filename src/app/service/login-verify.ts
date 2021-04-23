import { ClientTypeEnum } from '../lib/enum'
import UserModel from '../model/user'
import { generateToken } from '../../core/util'

export default class LoginVerifyService {
  static async getToken(account: string, secret: string, type: number): Promise<string> {
    /**
     * 生成token
     * @param account {String} 账号
     * @param secret {String} 密码
     * @param type {Number} 登录类型
     * @returns token
     */
    const promise = {
      [ClientTypeEnum.USER_MINI_PROGRAM]: UserModel.verifyByMiniProgram, // 微信小程序登录
      [ClientTypeEnum.USER_EMAIL]: UserModel.verifyByEmail, // 邮箱&密码登录
    }
    // @ts-ignore
    const identity: UserModel = await promise[type](account, secret)
    return generateToken(identity.id, identity.scope)
  }
}
