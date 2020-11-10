const {GrpcClient} = require("../dist/grpc-client")

const {NacosServiceRegistry} = require("../dist/nacos-service-registry")

const register = new NacosServiceRegistry({
  
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