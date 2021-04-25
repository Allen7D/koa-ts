<h1 align="center">
    Koa-TS
</h1> 

<h4 align="center">
    使用 TypeScript 构建 Koa2 项目的实践
    <br>🤜从0搭建自己的项目框架🤛
</h4>

* 本项目借鉴[林间有风团队](https://github.com/TaleLin/lin-cms-koa)的Node.js项目

## 🎮 互动
QQ交流群:聊天、斗图、学习、交流，伸手党勿进

<table align="center">
  <tr>
    <td><img alt="img" src="https://github.com/Allen7D/mini-shop-server/blob/dev/media/qq_group_qr_code.jpg" width="250px"></td>
    <td><img alt="img" src="https://github.com/Allen7D/mini-shop-server/blob/dev/media/qq_group_from_lin.png" width="250px"></td>
  </tr>
  <tr>
    <td>
      <a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=ee34348c8d177a4218594598de6c3fb404861a1c7a7091cd9f4384e6dcd6ea32">
        <img border="0" src="//pub.idqqimg.com/wpa/images/group.png" alt="葬爱代码家族群" title="葬爱代码家族群">
      </a>
    </td>
    <td>
      <a target="_blank" href="//shang.qq.com/wpa/qunwpa?idkey=184ed5a00c7f903271f8d55beb814b7c9779347e114e2db51db7962bf9d016de">
        <img border="0" src="//pub.idqqimg.com/wpa/images/group.png" alt="林间有风团队官方交流" title="林间有风团队官方交流">
      </a>
    </td>
  </tr>
  <tr>
  	<td>葬爱家族QQ交流群</td>
  	<td>林间有风团队官方QQ交流群</td>
  </tr>
</table>

## 特点
- 实现Koa的同步写法，支持async/await
- 基于装饰器，实现简洁的路由中间件、权限控制中间件等等
- AOP(面向切面编程)设计，实现 **参数校验层** & **异常统一处理层**
- Model模型JSON序列化控制，实现API接口级的表字段显示与隐藏

## 启动配置
在`src\config\index.ts`中需要配置电脑数据库的名称、账号和密码，此外支持小程序登录需填充小程序的ID和密钥。
其中，默认端口号为3000

## 导入数据
安装MySQL后，执行如下语句进入数据库
```
$ mysql -u root -p # 执行完毕后输入密码
$ mysql -u root -p123456 # 直接输入密码，进入(我的密码是: 123456)
```
 **`-u`** 表示选择登陆的用户名，  **`-p`** 表示登陆的用户密码<br>
 上面命令输入之后，会提示输入密码(Enter password)

> mysql的每条执行以「分号」结尾
```
mysql> create database island; # 建立数据库(island)
mysql> use island; # 进入该数据库
mysql> source /**/../**/island.sql; # 绝对路径下的sql文件
```

## 快速开始
1. 安装依赖: `npm i`
2. 启动服务：`npm dev`（E.g: 访问 http://127.0.0.1:3000/v1/book/hot_keyword）


## 项目目录
```
.
├── app.ts              // 项目入口文件
├── core                // 项目核心代码
│   ├── init.ts             // Koa初始化配置
│   ├── base-validator.ts   // 校验方法的基类
│   ├── db.ts               // Model的基类
│   ├── decorator.ts        // 装饰器
│   ├── http-exception.ts   // 基础的通用性异常
│   └── util.ts
├── middleware          // 中间件
│   ├── auth.ts             // 权限控制
│   └── exception.ts        // 异常统一处理
├── config              // 配置文件
│   └── index.ts
├── types               // Typescript自定义类型
│   └── index.ts
└──  app
    ├── api
    │   └── v1          // 所有API接口(v1版本)
    │       ├── book.ts     // 书籍API接口
    │       ├── classic.ts  // 期刊API接口
    │       ├── like.ts     // 点赞API接口
    │       ├── token.ts    // 登录令牌API接口
    │       └── user.ts     // 用户API接口
    ├── exception       // 业务相关异常
    │   └── index.ts    
    ├── lib
    │   ├── enum.ts         // 统一的枚举
    │   └── scope.ts        // 权限级别
    ├── model           // Model层（数据库）
    │   ├── art.ts          // 
    │   ├── book.ts         // 书籍表
    │   ├── classic.ts      // 期刊(音乐、摘句、影片)表
    │   ├── comment.ts      // 书籍评论表
    │   ├── favor.ts        // 收藏表
    │   ├── flow.ts         // 期刊号表
    │   ├── hot-book.ts     // 热门书籍表
    │   └── user.ts         // 用户表
    ├── service          // Service层
    │   ├── login-verify.ts // 登录相关校验服务
    │   └── wx-token.ts     // 微信登录相关服务
    └── validator       // 参数校验层
        └── index.ts    
```

## 部分示例代码
```js
const router = new Router({
  prefix: '/v1/book',
})

@api.controller(router)
class BookController {
  ...
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
}
```
