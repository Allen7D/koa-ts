import validator from 'validator'
import { RouterContext } from 'koa-router'

import {
  ParameterException,
} from './http-exception'

import _ from 'lodash'

import {
  findMembers,
} from './util'


export class BaseValidator {
  public data: object // body中的参数
  public parsed: any // path中的参数
  public alias: object | undefined

  constructor() {
    this.data = {}
    this.parsed = {}
  }


  private _assembleAllParams(ctx: RouterContext) {
    return {
      body: ctx.request.body,
      query: ctx.request.query,
      path: ctx.params,
      header: ctx.request.header,
    }
  }

  get(path: string, parsed = true): any {
    if (parsed) {
      const value = _.get(this.parsed, path, null)
      if (value == null) {
        const keys = path.split('.')
        const key = _.last<string>(keys)
        return _.get(this.parsed.default, key as string)
      }
      return value
    } else {
      return _.get(this.data, path)
    }
  }


  private _findMembersFilter(key: any) {
    if (/validate([A-Z])\w+/g.test(key)) {
      return true
    }
    // @ts-ignore
    if (this[key] instanceof Array) {
      // @ts-ignore
      this[key].forEach(value => {
        const isRuleType = value instanceof Rule
        if (!isRuleType) {
          throw new Error('验证数组必须全部为Rule类型')
        }
      })
      return true
    }
    return false
  }

  async validate(ctx: any, alias = {}) {
    /**
     * alias: 参数别名
     */
    this.alias = alias
    let params = this._assembleAllParams(ctx)
    this.data = _.cloneDeep(params)
    this.parsed = _.cloneDeep(params)

    const memberKeys = findMembers(this, {
      filter: this._findMembersFilter.bind(this),
    })

    const errorMsgs: string[] = []
    // const map = new Map(memberKeys)
    for (let key of memberKeys) {
      const result = await this._check(key, alias)
      if (!result.success) {
        errorMsgs.push(result.msg)
      }
    }
    if (errorMsgs.length != 0) {
      throw new ParameterException(errorMsgs)
    }
    ctx.v = this
    return this
  }

  async _check(key: string, alias = {}) {
    // @ts-ignore
    const isCustomFunc = typeof (this[key]) == 'function'
    let result
    if (isCustomFunc) {
      try {
        // @ts-ignore
        await this[key](this.data)
        result = new RuleResult(true)
      } catch (error) {
        result = new RuleResult(false, error.msg || error.message || '参数错误')
      }
      // 函数验证
    } else {
      // 属性验证, 数组，内有一组Rule
      // @ts-ignore
      const rules: Array<Rule> = this[key]
      const ruleField = new RuleField(rules)
      // 别名替换
      // @ts-ignore
      key = alias[key] ? alias[key] : key
      const param = this._findParam(key)

      result = ruleField.validate(param.value)

      if (result.pass) {
        // 如果参数路径不存在，往往是因为用户传了空值，而又设置了默认值
        if (param.path.length == 0) {
          _.set(this.parsed, ['default', key], result.legalValue)
        } else {
          _.set(this.parsed, param.path, result.legalValue)
        }
      }
    }
    if (!result.pass) {
      const msg = `${isCustomFunc ? '' : key}${result.msg}`
      return {
        msg: msg,
        success: false,
      }
    }
    return {
      msg: 'ok',
      success: true,
    }
  }

  // 在query、body、path、header中查找属性
  _findParam(key: string) {
    let value
    value = _.get(this.data, ['query', key])
    if (value) {
      return {
        value,
        path: ['query', key],
      }
    }
    value = _.get(this.data, ['body', key])
    if (value) {
      return {
        value,
        path: ['body', key],
      }
    }
    value = _.get(this.data, ['path', key])
    if (value) {
      return {
        value,
        path: ['path', key],
      }
    }
    value = _.get(this.data, ['header', key])
    if (value) {
      return {
        value,
        path: ['header', key],
      }
    }
    return {
      value: null,
      path: [],
    }
  }
}

class RuleResult {
  public pass: boolean
  public msg: string

  constructor(pass: boolean, msg = '') {
    this.pass = pass
    this.msg = msg
    // Object.assign(this, {
    //     pass,
    //     msg
    // })
  }
}

class RuleFieldResult extends RuleResult {
  public legalValue: any

  constructor(pass: boolean, msg = '', legalValue = null) {
    super(pass, msg)
    this.legalValue = legalValue
  }
}

export class Rule {
  public name: string
  public msg: string
  public params: any

  // @ts-ignore
  constructor(name: string, msg?: any, ...params: any[]) {
    this.name = name
    this.msg = msg
    this.params = params
  }

  validate(field: any) {
    if (this.name == 'isOptional')
      return new RuleResult(true)
    // @ts-ignore
    if (!validator[this.name](field + '', ...this.params)) {
      return new RuleResult(false, this.msg || '参数错误')
    }
    return new RuleResult(true, '')
  }
}

class RuleField {
  public rules: Array<Rule>

  constructor(rules: any[]) {
    this.rules = rules
  }

  validate(field: any) {
    if (field == null) {
      // 如果字段为空
      const allowEmpty = this._allowEmpty()
      const defaultValue = this._hasDefault()
      if (allowEmpty) {
        return new RuleFieldResult(true, '', defaultValue)
      } else {
        return new RuleFieldResult(false, '字段是必填参数')
      }
    }

    const filedResult = new RuleFieldResult(false)
    for (let rule of this.rules) {
      let result = rule.validate(field)
      if (!result.pass) {
        filedResult.msg = result.msg
        filedResult.legalValue = null
        // 一旦一条校验规则不通过，则立即终止这个字段的验证
        return filedResult
      }
    }
    return new RuleFieldResult(true, '', this._convert(field))
  }

  // 属性转换
  _convert(value: any) {
    for (let rule of this.rules) {
      if (rule.name == 'isInt') {
        return parseInt(value)
      }
      if (rule.name == 'isFloat') {
        return parseFloat(value)
      }
      if (rule.name == 'isBoolean') {
        return value ? true : false
      }
    }
    return value
  }

  _allowEmpty() {
    for (let rule of this.rules) {
      if (rule.name == 'isOptional') {
        return true
      }
    }
    return false
  }

  _hasDefault() {
    for (let rule of this.rules) {
      const defaultValue = rule.params[0]
      if (rule.name == 'isOptional') {
        return defaultValue
      }
    }
  }
}
