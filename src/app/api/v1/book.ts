import Router, { RouterContext } from 'koa-router'
import { Next } from 'koa'

import { api, auth } from '../../../core/decorator'
import BookModel from '../../model/book'
import { AddShortCommentValidator, PositiveIntegerValidator, SearchValidator } from '../../validator'
import HotBookModel from '../../model/hot-book'
import CommentModel from '../../model/comment'

const router = new Router({
  prefix: '/v1/book',
})

@api.controller(router)
class BookController {

  /**
   * 获取书籍详情
   * @param id {Number} 书籍ID
   * @returns
   */
  @api.get('/:id/detail')
  async getDetail(ctx: RouterContext, next: Next) {
    const validator = await new PositiveIntegerValidator().validate(ctx)
    const id = validator.get('path.id')
    let book = await BookModel.getDetail(id)
    throw new (global as any).errs.Success(book)
  }

  @api.get('/hot_list')
  async getHotBookList(ctx: RouterContext) {
    const bookList = await HotBookModel.getAll()
    throw new (global as any).errs.Success({
      items: bookList,
    })
  }

  /**
   * 检索书籍
   * @param q {String} 关键字
   * @param start {Number} 检索下标(从第几个开始)
   * @param count {Number} 获取数量(返回多少个)
   * @returns
   */
  @api.get('/search')
  async search(ctx: RouterContext) {
    const validator = await new SearchValidator().validate(ctx)
    const result = await BookModel.searchFromYuShu(
      validator.get('query.q'),
      validator.get('query.start'),
      validator.get('query.count'),
    )
    throw new (global as any).errs.Success(result)
  }

  /**
   * 添加书籍短评
   */
  @api.post('/add/short_comment')
  @auth.login_required
  async addShortComment(ctx: RouterContext) {
    const validator = await new AddShortCommentValidator().validate(ctx, {
      id: 'book_id',
    })
    CommentModel.addShortComment(
      validator.get('body.book_id'),
      validator.get('body.content'),
    )
    throw new (global as any).errs.Success()
  }


  /**
   * 获取书籍的所有短评
   * @param book_id {Number} 书籍ID
   * @returns
   */
  @api.get('/:book_id/short_comment')
  @auth.login_required
  async getShortCommentList(ctx: RouterContext) {
    const validator = await new PositiveIntegerValidator().validate(ctx, {
        id: 'book_id',
      })
    const book_id = validator.get('path.book_id')
    const commentList = await CommentModel.getShortCommentList(book_id)
    throw new (global as any).errs.Success({
      items: commentList,
      book_id,
    })
  }

  @api.get('/favor/count')
  @auth.login_required
  async getFavorBookCount(ctx: RouterContext) {
    /**
     * 获取当前用户收藏的书籍数量
     */
    const count = await BookModel.getMyFavorBookCount((ctx as any).auth.uid)
    throw new (global as any).errs.Success({
      count,
    })
  }


  @api.get('/hot_keyword')
  async getHotKeyword(ctx: RouterContext) {
    /**
     * 热门关键字
     */
    throw new (global as any).errs.Success({
      'hot': ['Python',
        '哈利·波特',
        '村上春树',
        '东野圭吾',
        '白夜行',
        '韩寒',
        '金庸',
        '王小波',
      ],
    })
  }

}

export default router
