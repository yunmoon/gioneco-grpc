const {GrpcClient} = require("../dist/grpc-client")

const {ServiceRegistry} = require("../dist/service-registry")

const register = new ServiceRegistry({
  host: "127.0.0.1",
  port: 8500,
  promisify: true,
});

const grpcClient = new GrpcClient({
  protosDir: `${process.cwd()}/protos`,
  registry: register
})
function run() {
  const client = grpcClient.getGrpcClient("helloworld.Services")
  const user = 'world111111111111';
  if (client) {
    client.sayHello({name: user}, function(err, response) {
      if (err) {
        throw err
      }
      console.log('Greeting:', response.message);
    });
  } else {
    throw new Error("无法获取grpc client")
  }
 
}
setTimeout(run, 500)
// run()