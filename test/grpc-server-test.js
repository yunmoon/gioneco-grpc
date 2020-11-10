const {GrpcServer} = require("../dist/grpc-server")

const {NacosServiceRegistry} = require("../dist/nacos-service-registry")

const register = new NacosServiceRegistry({
  host: "127.0.0.1",
  port: 8500,
  promisify: true,
});
const grpcServer = new GrpcServer({
  protosDir: `${process.cwd()}/protos`,
  serviceFunctionMap: {
    //package.function
    "helloworld.SayHello"(call, callback) {
      callback(null, {message: 'Hello ' + call.request.name});
    },
    "testing.UnaryCall"(call, callback){
      callback(null, {username: "test", oauth_scope:"test1"});
    },
  },
  registry:register,
  checkServiceHealthOptions: {
    http: "http://10.160.0.90:8019/check-alive"
  }
})
grpcServer.ready();