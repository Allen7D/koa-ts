import util from 'util'
import axios, { AxiosResponse} from 'axios'
import config from '../../config'

const { appID, appSecret, loginUrl } = config.wx

export class WxToken {
  public code: string
  public loginUrl: string

  constructor(code: string) {
    this.code = code
    this.loginUrl = util.format(loginUrl, appID, appSecret, this.code)
  }

  async getOpenid() {
    const result = await axios.get(this.loginUrl)
    return this.parseOutOpenid(result)
  }

  private parseOutOpenid(result: AxiosResponse) {
    if (result.status !== 200) throw new (global as any).errs.AuthFailed('openid获取失败')
    const { errcode, errmsg, openid } = result.data
    if (errcode) throw new (global as any).errs.AuthFailed(`openid获取失败:${errmsg}`)

    return openid
  }
}
