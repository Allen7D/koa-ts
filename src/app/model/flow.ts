import { Table, Column, DataType } from 'sequelize-typescript'
import { BaseModel } from '../../core/db'


@Table({
  tableName: 'flow',
  comment: '期刊',
})
export default class FlowModel extends BaseModel<FlowModel> {
  @Column({
    type: DataType.INTEGER,
    comment: '期刊序号',
  })
  index!: number

  @Column({
    type: DataType.INTEGER,
    comment: '内容编号',
  })
  art_id!: number

  @Column({
    type: DataType.INTEGER,
    comment: '内容类型',
  })
  type!: number

  keys(): void {
  }
}
