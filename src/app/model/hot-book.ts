import Sequelize, { Op } from 'sequelize'

import { Table, Column, DataType } from 'sequelize-typescript'
import { BaseModel } from '../../core/db'
import FavorModel from './favor'
import { ArtTypeEnum } from '../lib/enum'


@Table({
  tableName: 'hot-book',
  comment: '热门书籍',
})
export default class HotBookModel extends BaseModel<HotBookModel> {
  @Column({
    type: DataType.INTEGER,
    comment: '顺序',
  })
  index!: number

  @Column({
    type: DataType.STRING,
    comment: '封面',
  })
  image!: string

  @Column({
    type: DataType.STRING,
    comment: '作者',
  })
  author!: string

  @Column({
    type: DataType.STRING,
    comment: '书名',
  })
  title!: string

  keys(): void {
  }

  static async getAll() {
    /**
     * 所有书籍的点赞数
     */
    const bookList = await HotBookModel.findAll({
      order: ['index'],
    })
    const ids: Array<number> = []
    bookList.forEach(book => ids.push(book.id))
    const favorList: FavorModel[] = await FavorModel.findAll({
      where: {
        art_id: {
          [Op.in]: ids,
        },
        type: ArtTypeEnum.BOOK,
      },
      group: ['art_id'],
      attributes: ['art_id', [Sequelize.fn('COUNT', '*'), 'count']],
    })
    bookList.forEach(book => {
      HotBookModel._getBookStatus(book, favorList)
    })

    return bookList
  }

  static _getBookStatus(book: HotBookModel, favorList: FavorModel[]) {
    /**
     * 获取书本的状态信息
     */
    let count = 0
    favorList.forEach(favor => {
      if (book.id === favor.art_id) {
        count = favor.get('count') as number
      }
    })
    // @ts-ignore
    book.setDataValue('fav_nums', count)
    return book
  }
}
