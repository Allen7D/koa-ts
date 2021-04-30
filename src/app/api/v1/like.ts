import { RouterContext } from 'koa-router'
import { api, auth } from '../../../core/decorator'
import FavorModel from '../../model/favor'
import { LikeValidator } from '../../validator'

@api.controller('/v1/like')
class LikeController {
  /**
   * 确认收藏(某类型期刊的内容
   * @param art_id {Number} 期刊id
   * @param type {Number} 期刊类卿
   * @returns
   */
  @api.post('/confirm')
  @auth.login_required
  async confirmLike(ctx: RouterContext) {
    const validator = await new LikeValidator().validate(ctx, {
      id: 'art_id'
    })
    await FavorModel.confirm(
      validator.get('body.art_id'), validator.get('body.type'), (ctx as any).auth.uid
    )
    throw new (global as any).errs.Success({

    })
  }

  /**
   * 确认收藏(某类型期刊的内容
   * @param art_id {Number} 期刊id
   * @param type {Number} 期刊类卿
   * @returns
   */
  @api.post('/cancel')
  @auth.login_required
  async cancelLike(ctx: RouterContext) {
    const validator = await new LikeValidator().validate(ctx)
    await FavorModel.cancel(
      validator.get('body.art_id'), validator.get('body.type'), (ctx as any).auth.uid
    )
    throw new (global as any).errs.Success()
  }
}
