import Router, { RouterContext } from 'koa-router'
import { api, auth } from '../../../core/decorator'
import FavorModel from '../../model/favor'
import { LikeValidator } from '../../validator'

const router = new Router({
  prefix: '/v1/like'
})

@api.controller(router)
class LikeController {
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

export default router
