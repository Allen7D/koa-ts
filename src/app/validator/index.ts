import UserModel from '@app/model/user'
import { ClientTypeEnum, ArtTypeEnum, isThisType } from '@app/lib/enum'
import { BaseValidator, Rule } from '@core/base-validator'

export class PositiveIntegerValidator extends BaseValidator {
  public id: Rule[]

  constructor() {
    super()
    this.id = [new Rule('isInt', '需要是正整数', { min: 1 })]
  }
}

export class RegisterValidator extends BaseValidator {
  public email: Rule[]
  public nickname: Rule[]
  public password1: Rule[]
  public password2: Rule[]

  constructor() {
    super()
    this.email = [new Rule('isEmail', '不符合Email规范')]
    this.nickname = [
      new Rule('isLength', '昵称不符合长度规范', {
        min: 4,
        max: 32,
      }),
    ]
    this.password1 = [
      new Rule('isLength', '密码至少6个字符，最多32个字符', {
        min: 6,
        max: 32,
      }),
      new Rule(
        'matches',
        '密码不符合规范',
        '^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]',
      ),
    ]
    this.password2 = this.password1
  }

  validatePassword(vals: any) {
    const { password1: psw1, password2: psw2 } = vals.body
    if (psw1 !== psw2) throw new Error('两个密码必须相同')
  }

  async validateEmail(vals: { body: any }) {
    const { email } = vals.body
    const user = await UserModel.findOne({
      where: {
        email,
      },
    })
    if (user) throw new Error('email 已存在')
  }
}

export class LoginValidator extends BaseValidator {
  public account: Rule[]
  public secret: Rule[]
  public type: Rule[]

  constructor() {
    super()
    this.account = [
      new Rule('isLength', '不符合账号规则', {
        min: 4,
        max: 32,
      }),
    ]
    this.secret = [
      new Rule('isOptional'),
      new Rule('isLength', '至少6个字符', {
        min: 6,
        max: 128,
      }),
    ]
    // 如果是字符串数字，不会校验，且会自动转为number类型
    this.type = [new Rule('isInt', '请输入数字')]
  }

  validateType(vals: any) {
    const { type } = vals.body
    if (!type) throw new Error('type是必填参数')
    if (!isThisType(ClientTypeEnum, type)) throw new Error('type参数不合法')
  }
}

export class TokenValidator extends BaseValidator {
  public token: Rule[]

  constructor() {
    super()
    this.token = [new Rule('isLength', '不为空', { min: 1 })]
  }
}

function checkArtType(vals: any) {
  // 同时支持body和path，不推荐这么用
  let type = vals.body.type || vals.path.type
  if (!type) {
    throw new Error('type是必须参数')
  }
  type = parseInt(type) // 字符串转数字 parseInt

  if (!isThisType(ArtTypeEnum, type)) {
    throw new Error('type参数不合法')
  }
}

export class LikeValidator extends PositiveIntegerValidator {
  constructor() {
    super()
    // @ts-ignore
    this.validateType = checkArtType
  }
}

export class ClassicValidator extends LikeValidator {}

export class SearchValidator extends BaseValidator {
  public q: Rule[]
  public start: Rule[]
  public count: Rule[]

  constructor() {
    super()
    this.q = [
      new Rule('isLength', '搜索关键词不能为空', {
        min: 1,
        max: 16,
      }),
    ]
    this.start = [
      new Rule('isInt', '不符合规范', {
        min: 0,
        max: 60000,
      }),
      new Rule('isOptional', '', 0),
    ]
    this.count = [
      new Rule('isInt', '不符合规范', {
        min: 1,
        max: 20,
      }),
      new Rule('isOptional', '', 20),
    ]
  }
}

export class AddShortCommentValidator extends PositiveIntegerValidator {
  public content: Rule[]

  constructor() {
    super()
    this.content = [
      new Rule('isLength', '必须在1到12个字符之间', {
        min: 1,
        max: 12,
      }),
    ]
  }
}
