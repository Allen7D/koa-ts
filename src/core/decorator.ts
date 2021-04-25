import 'reflect-metadata'
import Router, { IMiddleware } from 'koa-router'

import Auth from './middleware/auth'

/**
 * HTTP 请求方法
 *
 * @member Methods
 * @property {String} get GET请求
 * @property {String} post POST请求
 * @property {String} put PUT请求
 * @property {String} delete DELETE请求
 */
enum Methods {
  get = 'get',
  post = 'post',
  put = 'put',
  delete = 'delete',
}


/**
 * 将requestDecorator装饰的视图函数和对应的路由，增加到当前router中
 *
 * @param {Router} router 路由实例(有prefix属性)
 * @example
 * ```js
 * const router = new Router({
 *  prefix: '/v1/user',
 * })
 *
 * api.controller(router)
 * class UserController {
 *  @api.get('/')
 *  @auth.login_required
 *    async getUser(ctx: RouterContext) {
 *      ...
 *    }
 * }
 * ```
 */
function controller(router: Router) {
  return function(target: new (...args: any[]) => any) {
    for (let propertyKey of Object.getOwnPropertyNames(target.prototype)) {
      // propertyKey包含constructor字段
      const path = Reflect.getMetadata('path', target.prototype, propertyKey)
      const method: Methods = Reflect.getMetadata('method', target.prototype, propertyKey)
      const middlewares: IMiddleware[] = Reflect.getMetadata('middlewares', target.prototype, propertyKey) || []
      const handler = target.prototype[propertyKey]
      if (path && handler) {
        if (middlewares && middlewares.length) {
          router[method](path, ...middlewares, handler)
        } else {
          router[method](path, handler)
        }
      }
    }
  }
}

/**
 * 用type或path修饰target的propertyKey属性
 *
 * @param {Methods} type HTTP请求方法类型
 * @param {String} path 路由url
 * @param {String} target 类
 * @param {String} propertyKey  属性
 */
function requestDecorator(type: Methods) {
  return function(path: string) {
    return function(target: any, propertyKey: string) {
      Reflect.defineMetadata('path', path, target, propertyKey) // 请求的路径
      Reflect.defineMetadata('method', type, target, propertyKey) // 请求的方法
    }
  }
}

/**
 * 中间件装饰器(对应的middleware函数必须有2层嵌套)
 *
 * @param {IMiddleware} middleware 中间件函数
 * @param {Object} target 对象
 * @param {String} propertyKey 属性
 */
function middlewareDecorator(middleware: IMiddleware) {
  return function(target: any, propertyKey: string) {
    const originMiddlewares: IMiddleware[] = Reflect.getMetadata('middlewares', target, propertyKey) || []
    originMiddlewares.push(middleware)
    Reflect.defineMetadata('middlewares', originMiddlewares, target, propertyKey)
  }
}


/**
 * 生成有属性的中间件装饰器(对应的wrapper函数必须有3层嵌套)
 *
 * @param wrapper
 * @param {Object} target 对象
 * @param {String} propertyKey 属性
 */
function middlewareDecoratorWrapper(wrapper: (...args: any[]) => any) {
  return function(target: any, propertyKey: string) {
    const originMiddlewares: IMiddleware[] = Reflect.getMetadata('middlewares', target, propertyKey) || []
    const middleware = wrapper(propertyKey)
    originMiddlewares.push(middleware)
    Reflect.defineMetadata('middlewares', originMiddlewares, target, propertyKey)
  }
}


export const api = {
  controller,
  get: requestDecorator(Methods.get),
  post: requestDecorator(Methods.post),
  put: requestDecorator(Methods.put),
  delete: requestDecorator(Methods.delete),
}

export const auth = {
  login_required: middlewareDecoratorWrapper(Auth.verify),
}
