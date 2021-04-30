<h1 align="center">
    Koa-TS
</h1> 

<h4 align="center">
    使用 TypeScript 构建 Koa2 项目的实践
    <br>🤜从0搭建自己的项目框架🤛
</h4>

* [使用文档](https://www.yuque.com/allen7d/wn852h/dam32v)
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
- 装饰器在中间件上使用，实现拆分路由装饰器、权限控制装饰器
- AOP(面向切面编程)设计，实现参数校验层、异常统一处理层
- Model模型JSON序列化控制，实现API接口级的表字段显示与隐藏
- 易扩展的接口版本管理

## 快速上手
```
git clone https://github.com/Allen7D/koa-ts.git
```

### 导入数据
#### 连接MySQL
安装MySQL后，选择一种方式执行进入数据库
**`-u`** 表示选择登陆的用户名，**`-p`** 表示登陆的用户密码
```
# 方式一
$ mysql -u root -p # 执行完毕后输入数据库密码
# 方式二
$ mysql -u root -p123456 # 直接输入数据库密码，进入(我个人的密码是: 123456)
```
#### 创建数据库
进入数据库后，执行如下语句创建
注意：MySQL的每条执行以「英文分号」结尾
```
# 建立数据库(暂定为：island，可自行命名)
CREATE DATABASE IF NOT EXISTS island DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
# 进入island数据库
USE island;
# 导入sql文件(基于绝对路径)
SOURCE /aa/bb/cc/../island.sql;
```

### 启动配置
在[src/config/index.ts](https://github.com/Allen7D/koa-ts/blob/master/src/config/index.ts)中需要自行配置如下:
- 数据库的名称(database.dbName，本项目为island)
- 数据库的账号(database.username，一般默认为root)
- 数据库的密码(database.password)
- 小程序登录需填充小程序的ID和密钥(wx.appID，wx.appSecret)

### 
```
# 1. 安装依赖
npm install
# 2. 启动 Koa2 服务（E.g: 访问测试 http://127.0.0.1:3000/v1/book/hot_keyword）
npm run dev
```
打开浏览器输入回车：http://localhost:3000/v1/book/hot_keyword 可以看到服务端的该接口返回的结果，该接口对应的业务逻辑在[src/app/api/v1/book.ts](https://github.com/Allen7D/koa-ts/blob/master/src/app/api/v1/book.ts)中的`getHotKeyword`


## 项目目录
项目的入口文件是app.ts，整个项目最核心的代码在[core目录](hhttps://github.com/Allen7D/koa-ts/tree/master/src/core)
```
.
├── app.ts              // 项目入口文件
├── core                // 项目核心代码
│   ├── init.ts             // 项目初始化
│   ├── base-validator.ts   // 校验方法的基类
│   ├── db.ts               // Model的基类
│   ├── decorator.ts        // 装饰器
│   ├── http-exception.ts   // 基础的通用性异常
│   ├── middleware          // 中间件
│   │   ├── auth.ts           	// 权限控制
│   │   └── exception.ts        // 异常统一处理
│   └── util.ts
├── config              // 配置文件
│   └── index.ts
├── types               // Typescript自定义类型
│   └── index.ts
└──  app
    ├── api
    │   ├── cms         // API接口(cms版本)
    │   │   └── user.ts     // 用户管理API接口
    │   └── v1          // API接口(v1版本)
    │       ├── book.ts     // 书籍API接口
    │       ├── classic.ts  // 期刊API接口
    │       ├── like.ts     // 点赞API接口
    │       ├── token.ts    // 登录令牌API接口
    │       └── user.ts     // 用户API接口
    ├── exception       // 业务相关异常
    │   └── index.ts    
    ├── lib
    │   ├── enum.ts         // 统一的枚举
    │   └── scope.ts        // 权限级别
    ├── model           // Model层（数据库）
    │   ├── art.ts          // 
    │   ├── book.ts         // 书籍表
    │   ├── classic.ts      // 期刊(音乐、摘句、影片)表
    │   ├── comment.ts      // 书籍评论表
    │   ├── favor.ts        // 收藏表
    │   ├── flow.ts         // 期刊号表
    │   ├── hot-book.ts     // 热门书籍表
    │   └── user.ts         // 用户表
    ├── service         // Service层
    │   ├── login-verify.ts // 登录相关校验服务
    │   └── wx-token.ts     // 微信登录相关服务
    └── validator       // 参数校验层
        └── index.ts   
```

## 部分示例代码
```js
@api.controller('/v1/book')
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
