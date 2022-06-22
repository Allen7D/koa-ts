import { Table, Column, DataType } from 'sequelize-typescript'

import FavorModel from '@app/model/favor'
import { ArtTypeEnum } from '@app/lib/enum'
import { BaseModel } from '@core/db'

@Table({
  tableName: 'comment',
  comment: '书籍评论',
})
export default class CommentModel extends BaseModel<CommentModel> {
  @Column({
    type: DataType.STRING(12),
    comment: '短评内容',
  })
  content!: string

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '点赞数',
  })
  nums!: number

  @Column({
    type: DataType.INTEGER,
    comment: '书籍ID',
  })
  book_id!: number

  keys(): void {}

  static async addShortComment(bookID: number, content: string) {
    /**
     * 添加书籍短评论或点赞
     * bookID: 书籍ID
     * content: 书籍内容
     */
    const comment = await CommentModel.findOne({
      where: {
        book_id: bookID,
        content,
      },
    })
    // 处理相同或者不同的评论
    if (!comment) {
      return await CommentModel.create({
        book_id: bookID,
        content,
        nums: 1,
      } as CommentModel)
    } else {
      return await comment.increment('nums', {
        by: 1,
      })
    }
  }

  static async getShortCommentList(bookID: number) {
    /**
     * 获取书籍的所有评论
     * bookID: 书籍ID
     */
    const commentList = await CommentModel.findAll({
      where: {
        book_id: bookID,
      },
    })
    return commentList
  }
}
