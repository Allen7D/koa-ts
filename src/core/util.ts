const jwt = require('jsonwebtoken')

import { DecodeToken } from '../types'

export function findMembers (instance: any, {
  prefix,
  specifiedType,
  filter,
}: {
  prefix?: any,
  specifiedType?: any,
  filter?: any
}) {
  // 递归函数
  function _find(instance: any): any {
    //基线条件（跳出递归）
    if (instance.__proto__ === null)
      return []

    let names = Reflect.ownKeys(instance)
    names = names.filter((name) => {
      // 过滤掉不满足条件的属性或方法名
      return _shouldKeep(name)
    })

    return [...names, ..._find(instance.__proto__)]
  }

  function _shouldKeep(value: any) {
    if (filter) {
      if (filter(value)) {
        return true
      }
    }
    if (prefix)
      if (value.startsWith(prefix))
        return true
    if (specifiedType)
      if (instance[value] instanceof specifiedType)
        return true
  }

  return _find(instance)
}

/**
 * 生成token
 * @param uid {Number} 用户ID
 * @param scope {String} 用户权限
 * @returns {String} token
 */
export function generateToken (uid: number, scope: string): string {
  const { secretKey, expiresIn } = (global as any).config.security
  const token = jwt.sign({
    uid,
    scope,
  }, secretKey, {
    expiresIn,
  })
  return token
}

/**
 * token校验
 * @param token {String} 登录令牌
 * @returns {DecodeToken} token解码信息
 */
export function verifyToken (token: string): DecodeToken {
  const { secretKey } = (global as any).config.security
  try {
    // 用户ID, 用户权限, 创建时间, 有效期
    let { uid, scope, iat: create_at, exp: expire_in } = jwt.verify(token, secretKey)
    return { uid, scope, create_at, expire_in }
  } catch (error) {
    let errMsg = 'token 不合法'
    // token 不合法
    if (error.name === 'JsonWebTokenError') errMsg = 'token 不合法'
    // token 过期
    if (error.name === 'TokenExpiredError') errMsg = 'token 过期'
    // token 为空
    if (token === '') errMsg = 'token 为空'
    // 统一抛出
    throw new (global as any).errs.Forbbiden(errMsg)
  }
}
