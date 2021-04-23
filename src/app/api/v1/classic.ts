import Router, { RouterContext } from 'koa-router'

import { PositiveIntegerValidator, ClassicValidator } from '../../validator'
import { api, auth } from '../../../core/decorator'
import FlowModel from '../../model/flow'
import { ArtModel } from '../../model/art'
import FavorModel from '../../model/favor'

const router = new Router({
  prefix: '/v1/classic',
})


@api.controller(router)
class ClassicController {
  /**
   * 获取最新期间
   * @returns
   */
  @api.get('/latest')
  @auth.login_required
  async getLatest(ctx: RouterContext) {
    const flow = await FlowModel.findOneOr404({
      order: [
        ['index', 'DESC'],
      ],
    })
    const art = await ArtModel.getData(flow.art_id, flow.type) as any
    const isLike = await FavorModel.isUserLike(
      flow.art_id, flow.type, (ctx as any).auth.uid,
    )
    art.setDataValue('index', flow.index)
    art.setDataValue('like_status', isLike)

    throw new (global as any).errs.Success(art)
  }

  /**
   * 获取下一期期刊
   * @param index {Number} 期刊号
   * @returns
   */
  @api.get('/:index/next')
  @auth.login_required
  async getNext(ctx: RouterContext) {
    const validator = await new PositiveIntegerValidator().validate(ctx, {
      id: 'index',
    })
    const index = validator.get('path.index')
    const flow = await FlowModel.findOneOr404({
      where: {
        index: index + 1,
      },
    }) as FlowModel
    const art = await ArtModel.getData(flow.art_id, flow.type) as any
    const isLike = await FavorModel.isUserLike(flow.art_id, flow.type, (ctx as any).auth.uid)
    art.setDataValue('index', flow.index)
    art.setDataValue('like_status', isLike)

    throw new (global as any).errs.Success(art)
  }

  /**
   * 获取上一期期刊
   * @param index {Number} 期刊号
   * @returns
   */
  @api.get('/:index/prev')
  @auth.login_required
  async getPrev(ctx: RouterContext) {
    const validator = await new PositiveIntegerValidator().validate(ctx, {
      id: 'index',
    })
    const index = validator.get('path.index')
    const flow = await FlowModel.findOneOr404({
      where: {
        index: index - 1,
      },
    }) as FlowModel
    const art = await ArtModel.getData(flow.art_id, flow.type) as any
    const isLike = await FavorModel.isUserLike(flow.art_id, flow.type, (ctx as any).auth.uid)
    art.setDataValue('index', flow.index)
    art.setDataValue('like_status', isLike)

    throw new (global as any).errs.Success(art)
  }

  /**
   * 获取期刊的详细信息
   * @param type {Number} 期刊类别
   * @param id {Number} 期刊ID
   * @returns
   */
  @api.get('/:type/:id')
  @auth.login_required
  async getDetail(ctx: RouterContext) {
    const validator = await new ClassicValidator().validate(ctx)
    const art_id = validator.get('path.id')
    const type = validator.get('path.type')

    const artDetail = await new ArtModel(art_id, type).getDetail((ctx as any).auth.uid)
    throw new (global as any).errs.Success(artDetail)
  }

  /**
   * 获取期刊的点赞信息
   * @param type {Number} 期刊类别
   * @param id {Number} 期刊ID
   * @returns
   */
  @api.get('/:type/:id/favor')
  @auth.login_required
  async getFavor(ctx: RouterContext) {
    const validator = await new ClassicValidator().validate(ctx)
    const art_id = validator.get('path.id')
    const type = validator.get('path.type')

    const art = await ArtModel.getData(art_id, type) as any
    if (!art) {
      throw new (global as any).errs.NotFound()
    }
    const isLike = await FavorModel.isUserLike(art_id, type, (ctx as any).auth.uid)
    throw new (global as any).errs.Success({
      fav_nums: art.fav_nums,
      like_status: isLike,
    })
  }

}

export default router
