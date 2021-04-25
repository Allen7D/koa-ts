/**
 * Sequelize 中文简要教程 https://itbilu.com/nodejs/npm/VkYIaRPz-.html
 */
import _ from 'lodash'
import { Model } from 'sequelize-typescript'


/**
 * Model模型JSON序列化
 */
export abstract class BaseModel<T> extends Model<T> {
  protected fields: string[] = []
  protected _locked = false  // ctrl(业务逻辑)层对字段hide和append的操作结束后，锁定
  protected _lockedFields: string[] = []  // 在业务逻辑处理中，锁住的字段
  private _exclude = ['updated_at', 'created_at', 'deleted_at']

  abstract keys(): void

  /**
   * ctrl(业务逻辑)层对字段锁定
   */
  lockField() {
    this._locked = true
  }

  /**
   * 增加属性
   */
  protected _append(arg: string) {
    if (!this.fields.includes(arg)) {
      this.fields.push(arg)
    }
  }

  append(...args: string[]) {
    for (let arg of args) {
      if (!this._locked) {
        this._lockedFields.push(arg)
        this._append(arg)
      } else {
        if (!this._lockedFields.includes(arg)) {
          this._append(arg)
        }
      }
    }
    return this
  }

  /**
   * 隐藏属性
   */
  protected _hide(arg: string) {
    let index = this.fields.indexOf(arg)
    if (index > -1) {
      this.fields.splice(index, 1)
    }
  }

  hide(...args: string[]) {
    for (let arg of args) {
      if (!this._locked) {
        this._lockedFields.push(arg)
        this._hide(arg)
      } else {
        if (!this._lockedFields.includes(arg)) {
          this._hide(arg)
        }
      }
    }
    return this
  }

  // [查看实例上的属性](https://www.cnblogs.com/ajanuw/p/14101272.html)
  // const prototype = Object.getPrototypeOf((this as any))
  // const propertyKeys = Reflect.ownKeys(prototype) as string[] // [ 'constructor', 'id', '...' ]
  /**
   * 隐藏_exclude内的属性，并添加getter属性(除了_开头的属性)
   */
  toJSON() {
    this.lockField() // 在_lockedFields中的字段不允许进行修改
    // 获取实例上的属性
    let data = _.clone((this as any).dataValues)
    let originFields = Object.keys(data) as string[] // 实例自身所的属性，包含created_at、updated_at、deleted_at等属性
    this.fields = _.clone(originFields)

    this.hide(...this._exclude); // 隐藏默认隐藏参数；去掉created_at、updated_at、deleted_at等属性

    // 载入参数操作
    // 这一步是对this.fields的修正操作，对实例属性进行一系列添加和隐藏
    // E.g: 在this.fields中可能会增加created_at、updated_at、deleted_at等属性
    (this as any).keys()

    // 添加属性
    for (let key of this.fields) {
      if (!originFields.includes(key)) {
        _.set(data, key, (this as any)[key])
      }
    }

    // 隐藏属性
    originFields.forEach((key: string) => {
        if (!this.fields.includes(key)) {
          _.unset(data, key)
        }
      },
    )

    return data
  }

  /**
   * 查询不到，则抛异常
   *
   * @param options
   * @param e
   * @param errorCode
   * @param msg
   */
  static async findOneOr404(options: any, e?: Error, errorCode?: number, msg?: string) {
    const result = await (this as any).findOne(options)
    if (!result) {
      if (e) throw e
      throw new (global as any).errs.NotFound()
    }
    return result
  }

  /**
   * 发现已存在数据(即数据重复)，则抛异常
   *
   * @param options
   * @param e
   * @param errorCode
   * @param msg
   */
  static async abortRepeat(options: any, e?: Error, errorCode?: number, msg?: string) {
    const result = await (this as any).findOne(options)
    if (!result) {
      if (e) throw e
      throw new (global as any).errs.RepeatException()
    }
    return result
  }

}
