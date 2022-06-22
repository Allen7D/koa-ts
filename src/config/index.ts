export default {
  environment: 'dev',
  // environment: 'prod',
  port: 3000,           // 端口号
  database: {
    dbName: 'island',   // 数据库名
    host: 'localhost',
    port: 3306,
    username: 'root',   // 账号
    password: '159951', // 密码
    force: false,       // 是否强制删除后重建表
    logging: false,      // 打印 ORM所执行的 SQL语句
  },
  security: {
    secretKey: 'But you, Lord , are a shield around me, my glory, the One who lifts my head high.',
    expiresIn: 60 * 60 * 24 * 30, // 60秒 * 60 * 24 * 30 = 1个月
  },
  wx: {
    appID: '**abc123**',      // 微信小程序ID
    appSecret: '**abc123**',  // 微信小程序密钥
    loginUrl: 'https://api.weixin.qq.com/sns/jscode2session?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code',
  },
  yushu: {
    detailUrl: 'http://t.yushu.im/v2/book/id/%s',
    keywordUrl: 'http://t.yushu.im/v2/book/search?q=%s&count=%s&start=%s&summary=%s',
  },
}
