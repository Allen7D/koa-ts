export interface DecodeToken {
  uid: number        // 用户ID
  scope: string      // 用户权限
  create_at: number  // token创建时间
  expire_in: number  // token有效期
}
