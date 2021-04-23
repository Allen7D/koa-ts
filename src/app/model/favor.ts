import { Sequelize, Table, Column, DataType } from 'sequelize-typescript'
import { Op } from 'sequelize'
import { BaseModel } from '../../core/db'
import { ArtTypeEnum } from '../lib/enum'
import { ArtCollection } from './art'


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

  keys(): void {
  }

  static async confirm(art_id: number, type: number, uid: number) {
    /**
     * 确定收藏（喜欢like）
     */
    this.abortRepeat({
      where: {
        art_id,
        type,
        uid,
      },
    })
    // 事务（数据一致性）

  }

  static async cancel(art_id: number, type: number, uid: number) {
    /**
     * 取消收藏（不喜欢dislike）
     */

  }

  static async isUserLike(art_id: number, type: number, uid: number): Promise<boolean> {
    const favor = await FavorModel.findOne({
      where: {
        art_id,
        type,
        uid,
      },
    })
    return favor ? true : false
  }

  static async getMyClassicFavors(uid: number) {
    /**
     * 获取用户所有的收藏(非书籍)
     */
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

  static async getBookFavors(uid: number, book_id: number) {
    /**
     * 获取用户
     */
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
