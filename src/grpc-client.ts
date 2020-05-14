import { ServiceRegistry } from "./service-registry";
import { getProtoFiles } from "./util";
import { loadSync } from "@grpc/proto-loader";
import * as grpc from "grpc";


export class GrpcClient {
  private clients = {}
  constructor(private options: GrpcClientOptions) {
    if (!options.protosDir) {
      throw new Error("protosDir is required")
    }
    const protoFiles = getProtoFiles(this.options.protosDir)
    const services: string[] = []
    let packageDefinitionInfo
    if (protoFiles.length) {
      const packageDefinition = loadSync(protoFiles, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      })
      packageDefinitionInfo = grpc.loadPackageDefinition(packageDefinition);
      for (const protoPackage of Object.keys(packageDefinitionInfo)) {
        const service = `${protoPackage}.Services`
        services.push(service)
        if (this.options.severHost && this.options.severHost[service]) {
          const client = new packageDefinitionInfo[protoPackage].Services(this.options.severHost[service], grpc.credentials.createInsecure());
          this.clients[service] = [client]
        }
      }
    }
    for (const service of services) {
      const packageArray = service.split(".")
      if (!this.clients[service] && this.options.registry) {
        this.options.registry.subscribe(service, (healthServers) => {
          this.clients[service] = []
          for (const healthServer of healthServers) {
            const client = new packageDefinitionInfo[packageArray[0]].Services(`${healthServer.Address}:${healthServer.Port}`, grpc.credentials.createInsecure());
            this.clients[service].push(client)
          }
        })
      }
    }
  }
  getGrpcClient(serviceName) {
    const clients = this.clients[`${serviceName}.Services`];
    if (!clients || !clients.length) {
      return false
    }
    if (clients.length === 1) {
      return clients[0]
    }
    return clients[parseInt(`${Math.random() * clients.length}`)]
  }
}

export interface GrpcClientOptions {
  protosDir: string
  registry?: ServiceRegistry,
  severHost?: {
    [key: string]: string
  }
}