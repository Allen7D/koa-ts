export function isThisType(enumType: any, type: string | number): boolean {
  // if (type in enumType) { } // 也可以判断是否在枚举
  return Object.values(enumType).includes(type)
}

export enum ClientTypeEnum {
  USER_MINI_PROGRAM = 100,
  USER_EMAIL =  101,
  USER_MOBILE = 102,
}

export enum ScopeTypeEnum {
  UserScope = 1, // 普通用户
  AdminScope = 2, // 管理员
  SuperScope = 3, // 超级管理员
}

export enum ArtTypeEnum {
  MOVIE = 100, // 电影类型
  MUSIC = 200, // 音乐类型
  SENTENCE = 300, // 文章类型
  BOOK = 400, // 文章类型
}
