/**
 * 中文简要教程 https://itbilu.com/nodejs/npm/VkYIaRPz-.html
 */
import _ from 'lodash'

import { Model } from 'sequelize-typescript'

/**
 * Model模型JSON序列化
 */
export abstract class BaseModel<T> extends Model<T> {
  protected fields: string[] = []
  private _exclude = ['updated_at', 'created_at', 'deleted_at']

  abstract keys(): void

  append(...args: string[]) {
    /**
     * 增加属性
     */
    for (let arg of args) {
      if (!this.fields.includes(arg)) {
        this.fields.push(arg)
      }
    }
    return this
  }

  hide(...args: string[]) {
    /**
     * 隐藏属性
     */
    for (let arg of args) {
      let index = this.fields.indexOf(arg)
      if (index > -1) {
        this.fields.splice(index, 1)
      }
    }
    return this
  }

  // [查看实例上的属性](https://www.cnblogs.com/ajanuw/p/14101272.html)
  // const prototype = Object.getPrototypeOf((this as any))
  // const propertyKeys = Reflect.ownKeys(prototype) as string[] // [ 'constructor', 'id', '...' ]
  toJSON() {
    /**
     * 隐藏_exclude内的属性，并添加getter属性(除了_开头的属性)
     */

      // 获取实例上的属性
    let data = _.clone((this as any).dataValues)
    let originFields = Object.keys(data) as string[] // 实例自身所的属性，包含created_at、updated_at、deleted_at等属性
    this.fields = _.clone(originFields)
    // 隐藏默认隐藏参数；去掉created_at、updated_at、deleted_at等属性
    _.pull(this.fields, ...this._exclude);
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

  static async findOneOr404(options: any, e?: Error, errorCode?: number, msg?: string) {
    const result = await (this as any).findOne(options)
    if (!result) {
      if (e) throw e
      throw new (global as any).errs.NotFound()
    }
    return result
  }

  // 发现已存在数据，即数据重复
  static async abortRepeat(options: any, e?: Error, errorCode?: number, msg?: string) {
    const result = await (this as any).findOne(options)
    if (!result) {
      if (e) throw e
      throw new (global as any).errs.RepeatException()
    }
    return result
  }
}

// 驼峰转换下划线

// function toLine(name: string) {
//   return name.replace(/([A-Z])/g, '_$1').toLowerCase();
// }
//
// function transform(obj: any, data: any) {
//   const fields: string[] = _.get(obj, 'fields', []);
//   fields.forEach(field => {
//     data[toLine(field)] = _.get(obj, field);
//   });
// }
