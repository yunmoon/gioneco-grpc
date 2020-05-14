# gioneco-grpc

## 1.Install
```bash
npm install gioneco-grpc
```
## 2.Usage

### server

```ts
import {GrpcServer, ServiceRegistry} from "gioneco-grpc"

const register = new ServiceRegistry({
  host: "127.0.0.1",
  port: 8500
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
  checkServerPort: 1338
})
grpcServer.ready();
```

### client

```ts
import { GrpcClient, ServiceRegistry } from "gioneco-grpc";
const register = new ServiceRegistry({
  host: "127.0.0.1",
  port: "8500",
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
```
## 3.Service registration and discovery

gioneco-grpc uses consul to implement service registration and discovery

```ts
const register = new ServiceRegistry({
  host: "127.0.0.1", // consul host
  port: 8500 // consul port
});
```