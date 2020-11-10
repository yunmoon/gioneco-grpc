import { loadSync } from "@grpc/proto-loader";
import * as grpc from "grpc";
import { ip } from "address";
import Consul = require("consul");
import { startCheckHealthServer } from "./server-check-health";
import { getProtoFiles } from "./util";
import ServiceRegistry from "./interfaces/service-registry";

export class GrpcServer {
  private ip: string
  private port: number
  private bindIp: string
  private protosDir: string
  private serviceFunctionMap: ServiceFunctionMap
  private server: grpc.Server
  private registry: ServiceRegistry
  private localIp: string
  private checkServiceHealthOptions: Consul.Agent.Service.RegisterCheck
  private checkServerPort: number
  constructor({ ipAddress, port, protosDir,
    serviceFunctionMap, registry, checkServiceHealthOptions,
    checkServerPort }: GrpcServerOptions) {
    this.ip = ipAddress || '0.0.0.0'
    this.port = port || 8123
    this.bindIp = `${this.ip}:${this.port}`
    this.protosDir = protosDir
    this.serviceFunctionMap = serviceFunctionMap || {}
    this.server = new grpc.Server();
    this.localIp = ip()
    if (registry) {
      this.registry = registry
    }
    this.checkServiceHealthOptions = checkServiceHealthOptions
    this.checkServerPort = checkServerPort || 8124
  }
  async ready() {
    const protoFiles = this.getProtoFiles()
    const services = []
    if (protoFiles.length) {
      const packageDefinition = loadSync(protoFiles, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
      })
      const packageDefinitionInfo: any = grpc.loadPackageDefinition(packageDefinition);
      for (const protoPackage of Object.keys(packageDefinitionInfo)) {
        const serviceFuncs: any = {}
        if (packageDefinitionInfo[protoPackage].Services) {
          for (const funcKey of Object.keys(packageDefinitionInfo[protoPackage].Services.service)) {
            if (this.serviceFunctionMap[`${protoPackage}.${funcKey}`]) {
              serviceFuncs[funcKey] = this.serviceFunctionMap[`${protoPackage}.${funcKey}`]
            }
            services.push(`${protoPackage}.Services`)
          }
          this.server.addService(packageDefinitionInfo[protoPackage].Services.service, serviceFuncs)
        }
      }
    }
    this.server.bindAsync(this.bindIp, grpc.ServerCredentials.createInsecure(), (error) => {
      if (error) {
        console.log(`grpc服务启动失败`)
        console.error(error)
      } else {
        this.server.start();
        if (this.registry) {
          const defaultCheckOptions = {
            interval: '5s',
            timeout: '5s',
            http: ""
            // http: `http://${this.localIp}:${this.checkServerPort}/check-alive`
          }
          if (this.checkServiceHealthOptions) {
            defaultCheckOptions.interval = this.checkServiceHealthOptions.interval || defaultCheckOptions.interval
            defaultCheckOptions.timeout = this.checkServiceHealthOptions.timeout || defaultCheckOptions.timeout
            defaultCheckOptions.http = this.checkServiceHealthOptions.http || defaultCheckOptions.http
          }
          if (!this.checkServiceHealthOptions || !this.checkServiceHealthOptions.http) {
            if (!this.checkServerPort) {
              throw new Error("checkServerPort is required")
            }
            startCheckHealthServer(this.checkServerPort)
            defaultCheckOptions.http = `http://${this.localIp}:${this.checkServerPort}/check-alive`
          }
          for (const service of services) {
            this.registry.register({
              name: service,
              address: this.localIp,
              port: this.port,
              check: defaultCheckOptions
            })
          }
        }
        console.log(`grpc server:${this.bindIp}服务启动成功`)
      }
    })
  }

  private getProtoFiles() {
    return getProtoFiles(this.protosDir)
  }
}

export interface ServiceFunctionMap {
  [key: string]: Function
}
export interface GrpcServerOptions {
  ipAddress?: string
  port?: number
  protosDir: string
  serviceFunctionMap: ServiceFunctionMap
  registry?: ServiceRegistry
  checkServiceHealthOptions?: Consul.Agent.Service.RegisterCheck
  checkServerPort?: number
}