/**
 * classic 包含music、sentence、movie
 */
import { Table, Column, DataType } from 'sequelize-typescript'
import { BaseModel } from '../../core/db'

abstract class ClassicModel<T> extends BaseModel<T> {
  @Column({
    type: DataType.STRING,
    comment: '图片',
  })
  image!: string

  @Column({
    type: DataType.STRING,
    comment: '内容',
  })
  content!: number

  @Column({
    type: DataType.DATEONLY,
  })
  pubdate!: string

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    comment: '收藏数',
  })
  fav_nums!: number

  @Column({
    type: DataType.STRING,
    comment: '标题',
  })
  title!: string

  @Column({
    type: DataType.TINYINT,
    comment: '类型', // 4种类型：100 Movie, 200 Music, 300 Sentence, 400 Book
  })
  type!: number
}


@Table({
  tableName: 'music',
  comment: '音乐',
})
export class MusicModel extends ClassicModel<MusicModel> {
  @Column({
    type: DataType.STRING,
  })
  url!: string

  keys(): void {
  }
}


@Table({
  tableName: 'sentence',
  comment: '摘句',
})
export class SentenceModel extends ClassicModel<SentenceModel> {
  keys(): void {
  }
}


@Table({
  tableName: 'movie',
  comment: '影片',
})
export class MovieModel extends ClassicModel<MovieModel> {
  keys(): void {
  }
}

