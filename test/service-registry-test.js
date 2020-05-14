const {ServiceRegistry} = require("../dist/service-registry")

const register = new ServiceRegistry({
  host: "127.0.0.1",
  port: 8500,
  promisify: true,
});
async function run() {
  await register.register({
    name: "grpc.service.test",
    address: '10.160.0.90',
    port: 8019,
    check: {
        http: 'http://10.160.0.90:8019/check-alive',
        interval: '10s',
        timeout: '5s',
    }
  });
  // await register.unRegister("grpc.service.test")
  register.subscribe("grpc.service.test" , (data) => {
    console.log(data)
  })
}

run()