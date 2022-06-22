import _ from 'lodash'
import { Op } from 'sequelize'

import { MovieModel, MusicModel, SentenceModel } from '@app/model/classic'
import BookModel from '@app/model/book'
import { ArtTypeEnum } from '@app/lib/enum'

export class ArtCollection {
  /**
   * 获取
   * @param artInfoList
   */
  static async getList(artInfoList: any[]) {
    const artInfoObj: { [propName: number]: number[] } = {
      [ArtTypeEnum.MOVIE]: [],
      [ArtTypeEnum.MUSIC]: [],
      [ArtTypeEnum.SENTENCE]: [],
    }

    for (let artInfo of artInfoList) {
      artInfoObj[artInfo.type].push(artInfo.art_id)
    }
    const artList = []
    for (let type in artInfoObj) {
      const ids = artInfoObj[type]
      if (ids.length === 0) {
        // 空数组
        continue
      }
      artList.push(await ArtCollection._getListByType(ids, parseInt(type)))
    }

    return _.flatten(artList)
  }

  /**
   *
   * @param ids
   * @param type
   * @private
   */
  private static async _getListByType(
    ids: number[],
    type: number,
  ): Promise<any[]> {
    let artList: any[] = []
    const options = {
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    }

    switch (type) {
      case ArtTypeEnum.MOVIE:
        artList = await MovieModel.findAll(options)
        break
      case ArtTypeEnum.MUSIC:
        artList = await MusicModel.findAll(options)
        break
      case ArtTypeEnum.SENTENCE:
        artList = await SentenceModel.findAll(options)
        break
      case ArtTypeEnum.BOOK:
        break
      default:
        break
    }
    return artList
  }
}

export class ArtModel {
  constructor(private art_id: number, private type: number) {}

  async getDetail(uid: number) {
    const FavorModel = require('./favor').default // 解决循环引用
    const art = (await ArtModel.getData(this.art_id, this.type)) as any
    if (!art) {
      throw new (global as any).errs.NotFound()
    }
    const isLike = await FavorModel.isUserLike(this.art_id, this.type, uid)
    art.setDataValue('like_status', isLike)
    return art
  }

  static async getData(art_id: number, type: number) {
    let art = null
    const options = {
      where: {
        id: art_id,
      },
    }
    switch (type) {
      case ArtTypeEnum.MOVIE:
        art = await MovieModel.findOne(options)
        break
      case ArtTypeEnum.MUSIC:
        art = await MusicModel.findOne(options)
        break
      case ArtTypeEnum.SENTENCE:
        art = await SentenceModel.findOne(options)
        break
      case ArtTypeEnum.BOOK:
        art = await BookModel.findOne(options)
        if (!art) {
          art = await BookModel.create({
            id: art_id,
          } as any)
        }
        break
      default:
        break
    }

    return art
  }
}
