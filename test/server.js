const Koa = require("koa");
var http = require('http');
const Router = require('koa-router')
const router = new Router()
const app = new Koa();
router.get('/check-alive', async (ctx) => {
  return ctx.body = {
    code: 0,
    msg: "success"
  }
})
app.use(router.routes());
var server = http.createServer(app.callback());

server.listen(8019, () => {
  console.log("server start success => http://localhost:8019")
});