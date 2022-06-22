import { Sequelize, Table, Column, DataType } from 'sequelize-typescript'
import { Op } from 'sequelize'

import { ArtCollection } from '@app/model/art'
import { ArtTypeEnum } from '@app/lib/enum'
import { BaseModel } from '@core/db'

@Table({
  tableName: 'favor',
})
export default class FavorModel extends BaseModel<FavorModel> {
  /**
   * 业务表
   */
  @Column({
    type: DataType.INTEGER,
  })
  uid!: number

  @Column({
    type: DataType.INTEGER,
  })
  art_id!: number

  @Column({
    type: DataType.INTEGER,
  })
  type!: number

  keys(): void {}

  static async confirm(art_id: number, type: number, uid: number) {
    /**
     * 确定收藏（喜欢like）
     */
    FavorModel.abortRepeat({
      where: {
        art_id,
        type,
        uid,
      },
    })
  }

  /**
   * 取消收藏（不喜欢dislike）
   */
  static async cancel(art_id: number, type: number, uid: number) {
    FavorModel.abortRepeat({
      where: {
        art_id,
        type,
        uid,
      },
    })
  }

  /**
   * 是否用户喜欢
   */
  static async isUserLike(
    art_id: number,
    type: number,
    uid: number,
  ): Promise<boolean> {
    const favor = await FavorModel.findOne({
      where: {
        art_id,
        type,
        uid,
      },
    })
    return favor ? true : false
  }

  /**
   * 获取用户所有的收藏(非书籍)
   */
  static async getMyClassicFavors(uid: number) {
    const arts = await FavorModel.findAll({
      where: {
        uid,
        type: {
          [Op.not]: ArtTypeEnum.BOOK, // Op.not(不等于)
        },
      },
    })
    if (!arts) {
      throw new (global as any).errs.NotFound()
    }

    return await ArtCollection.getList(arts)
  }

  /**
   * 获取书籍的点赞情况和用户是否点赞
   */
  static async getBookFavor(uid: number, book_id: number) {
    const favorNums = await FavorModel.count({
      where: {
        art_id: book_id,
        type: ArtTypeEnum.BOOK,
      },
    })
    const favor = await FavorModel.findOne({
      where: {
        art_id: book_id,
        uid,
        type: ArtTypeEnum.BOOK,
      },
    })

    return {
      favor_nums: favorNums,
      like_status: favor ? true : false,
    }
  }
}
