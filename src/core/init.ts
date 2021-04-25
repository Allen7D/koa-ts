import fs from 'fs'
import path from 'path'

import Koa from 'Koa'
import parser from 'koa-bodyparser'
import { Sequelize } from 'sequelize-typescript'

import { catchError } from './middleware/exception'


class InitManager {
  public static app: Koa

  /**
   * 入口方法
   *    第1步，添加「body(上下文请求体)解析」功能
   *    第2步，载入config配置项
   *    第4步，连接数据库
   *    第4步，全局载入异常，可以用global.errs
   *    第5步，Koa实例添加路由
   *
   * @param app {Koa} Koa实例
   * */
  static async initCore(app: Koa) {
    // 静态方法中，this 是 InitManager; app 是Koa实例, 成为类属性
    this.app = app
    this.app.use(parser())
    this.loadConfig()
    await this.connectDB()
    this.handleError()
    this.initLoadRouters()
  }

  static loadConfig(path = '') {
    const configPath = path || `${process.cwd()}/src/config`;
    (global as any).config = require(configPath).default
  }

  /**
   * 批量载入路由
   */
  static initLoadRouters() {
    fs.readdirSync(`${process.cwd()}/src/app/api/v1`)
      .filter((file: string) => {
        return (file.indexOf('.') !== 0) && (file.slice(-3) === '.ts')
      })
      .forEach((file: string) => {
        const filePath = path.join(`${process.cwd()}/src/app/api/v1`, file)
        const router = require(filePath).default
        this.app.use(router.routes())
      })
  }

  /**
   *  载入所有自定义异常
   */
  static handleError() {
    (global as any).errs = require('./exception')
    this.app.use(catchError)
  }

  /**
   * 连接数据库
   */
  static async connectDB() {
    const UserModel = require('../app/model/book').default
    const BookModel = require('../app/model/user').default
    const { MusicModel, SentenceModel, MovieModel } = require('../app/model/classic')
    const FavorModel = require('../app/model/favor').default
    const FlowModel = require('../app/model/flow').default
    const HotBookModel = require('../app/model/hot-book').default
    const CommentModel = require('../app/model/comment').default

    const { dbName, host, port, username, password, force, logging } = (global as any).config.database
    const sequelize = new Sequelize(dbName, username, password, {
      dialect: 'mysql',
      host,
      port,
      logging,
      timezone: '+08:00', // 设置时区
      define: {
        timestamps: true,
        paranoid: true, // 增加 deletedAt
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
        underscored: true, // snake
      },
      models: [
        UserModel,
        BookModel, MusicModel, SentenceModel, MovieModel,
        FavorModel, FlowModel, HotBookModel, CommentModel,
      ],
    })
    await sequelize.sync({
      force,
    })
  }
}

export default InitManager
