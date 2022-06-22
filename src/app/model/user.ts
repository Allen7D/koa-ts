const bcrypt = require('bcryptjs')
import { Table, Column, DataType } from 'sequelize-typescript'

import { ScopeTypeEnum } from '@app/lib/enum'
import { WxToken } from '@app/service/wx-token'
import { BaseModel } from '@core/db'

@Table({
  tableName: 'user',
  comment: '用户',
})
export default class UserModel extends BaseModel<UserModel> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true, // 设置主键
    autoIncrement: true, // 自增加
  })
  // @ts-ignore
  id!: number

  @Column({
    type: DataType.STRING,
    comment: '用户昵称',
  })
  nickname!: string

  @Column({
    type: DataType.STRING(128),
    unique: true,
    comment: '邮箱',
  })
  email!: string

  @Column({
    type: DataType.STRING,
    set(val: string): void {
      const salt = bcrypt.genSaltSync(10) // 10表示生成密码的成本
      const psw = bcrypt.hashSync(val, salt)
      this.setDataValue('password', psw)
    },
    comment: '密码（已加密）',
  })
  password!: string

  @Column({
    type: DataType.STRING(64),
    unique: true,
    comment: '微信openid',
  })
  openid!: string

  @Column({
    type: DataType.INTEGER,
    defaultValue: ScopeTypeEnum.UserScope, // 1为user(普通用户)， 2为admin(普通管理员)， 3为super(超级管理员)
    comment: '权限级别(数字)',
  })
  auth!: string

  /**
   * auth(数字)对应的权限scope(字符串)
   * @returns {String} 用户权限
   */
  get scope() {
    return ScopeTypeEnum[(this as any).auth]
  }

  keys(): void {
    // 显示scope和created_at属性，其中scope是getter属性，created_at是默认隐藏属性
    // 隐藏password和openid属性
    this.append('scope', 'created_at').hide('password', 'openid')
  }

  /**
   * 校验密码(原始密码与加密密码进行校验)
   * @param raw {String} 原始密码
   * @returns {String} 用户权限
   */
  checkPassword(raw: string) {
    const result = bcrypt.compareSync(raw, this.password)
    if (!result) throw new (global as any).errs.AuthFailed('密码不正确')
  }

  /**
   * 邮箱校验登录
   * @param email {String} 邮箱
   * @param password {String} 密码
   */
  static async verifyByEmail(email: string, password: string) {
    const user: UserModel = await UserModel.findOneOr404(
      {
        where: {
          email,
        },
      },
      new (global as any).errs.AuthFailed('用户不存在'),
    )
    user.checkPassword(password)
    return user
  }

  static async verifyByMiniProgram(code: string, ...args: string[]) {
    const wt = new WxToken(code)
    const openid = await wt.getOpenid()
    // 是否已注册
    let user = await UserModel.findOne({
      where: {
        openid,
      },
    })
    // 未找到用户，则新增用户
    if (!user) user = await UserModel.create({ openid } as UserModel)
    return user
  }
}
