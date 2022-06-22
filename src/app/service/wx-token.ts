import util from 'util'
import axios, { AxiosResponse } from 'axios'

import config from '@config/index'

const { appID, appSecret, loginUrl } = config.wx

/**
 * 微信小程序的登录服务
 */
export class WxToken {
  public code: string
  public loginUrl: string

  constructor(code: string) {
    this.code = code
    this.loginUrl = util.format(loginUrl, appID, appSecret, this.code)
  }

  /**
   * 获取OpenID
   * @returns openid
   */
  async getOpenid() {
    const result = await axios.get(this.loginUrl)
    return this.parseOutOpenid(result)
  }

  /**
   * 解析返回结果
   * @param result {AxiosResponse} axios请求的返回结果
   * @returns openid
   */
  private parseOutOpenid(result: AxiosResponse): string {
    if (result.status !== 200)
      throw new (global as any).errs.AuthFailed('openid获取失败')
    const { errcode, errmsg, openid } = result.data
    if (errcode)
      throw new (global as any).errs.AuthFailed(`openid获取失败:${errmsg}`)

    return openid
  }
}
