const chalk = require('chalk')

import Koa from 'koa'
import config from './config'
import InitManager from './core/init'

const app = new Koa()

InitManager.initCore(app)

app.listen(config.port, () => {
  console.log(chalk.yellow(`服务器正常启动运行 >>  localhost:${config.port}`))
})
