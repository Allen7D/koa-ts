import axios from 'axios'
import util from 'util'
import { Table, Column, DataType } from 'sequelize-typescript'

import FavorModel from '@app/model/favor'
import { ArtTypeEnum } from '@app/lib/enum'
import { BaseModel } from '@core/db'

@Table({
  tableName: 'book',
  comment: '书籍',
})
export default class BookModel extends BaseModel<BookModel> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  // @ts-ignore
  id!: number // 感叹号是非null和非undefined的类型断言

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '收藏数',
  })
  fav_nums!: number

  keys(): void {}

  /**
   * 通过「鱼书服务」获取书籍信息
   * @param id {Number} 书籍ID
   */
  static async getDetail(id: number) {
    const url = util.format((global as any).config.yushu.detailUrl, id)
    const result = await axios.get(url)
    return result.data
  }

  /**
   * 通过「鱼书服务」检索书籍列表
   * @param q {String} 关键字
   * @param start {Number} 检索下标(从第几个开始)
   * @param count {Number} 获取数量(返回多少个)
   * @param summary
   */
  static async searchFromYuShu(
    q: string,
    start: number,
    count: number,
    summary: number = 1,
  ) {
    const url = util.format(
      (global as any).config.yushu.keywordUrl,
      encodeURI(q),
      count,
      start,
      summary,
    ) // encodeURI 对中文编码
    const result = await axios.get(url)
    return result.data
  }

  /**
   * 某用户所有收藏的书籍数量
   * @param uid {Number} 用户ID
   * @param count {Number} 收藏总数
   */
  static async getMyFavorBookCount(uid: number) {
    const count = await FavorModel.count({
      where: {
        type: ArtTypeEnum.BOOK,
        uid,
      },
    })
    return count
  }
}
