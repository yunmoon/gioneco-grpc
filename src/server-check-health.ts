import Koa = require("koa");
import http = require('http');
import Router = require('koa-router')
const router = new Router()
const app = new Koa();
router.get('/check-alive', async (ctx) => {
  return ctx.body = {
    code: 0,
    msg: "success"
  }
})
app.use(router.routes());

export function startCheckHealthServer(port) {
  const server = http.createServer(app.callback());
  server.listen(port, (error) => {
    if (error) {
      throw error
    }
    console.log(`server start success => http://localhost:${port}`)
  });
}

