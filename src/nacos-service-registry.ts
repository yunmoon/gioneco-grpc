import ServiceRegistry from "./interfaces/service-registry";
import { NacosNamingClient } from "nacos-naming";
export interface NacosNamingClientOptions {
  logger?: any;
  serverList: string | string[];
  namespace?: string;
}
export class NacosServiceRegistry implements ServiceRegistry {
  private nacosClient: NacosNamingClient;
  private isReady: boolean = false;
  constructor(options: NacosNamingClientOptions) {
    if (!options.logger) {
      options.logger = console;
    }
    this.nacosClient = new NacosNamingClient(options);
  }
  async register(options: any): Promise<any> {
    await this.init();
    const { name, address, port } = options;
    await this.nacosClient.registerInstance(name, {
      ip: address,
      port,
    });
  }
  async unRegister(serviceName: string, options?: any): Promise<any> {
    await this.init();
    const { address, port } = options;
    await this.nacosClient.deregisterInstance(serviceName, {
      ip: address,
      port,
    });
  }
  async subscribe(serviceName: string, successCb?: any) {
    await this.init();
    this.nacosClient.subscribe(serviceName, (hosts: any[]) => {
      hosts = hosts.filter((item) => {
        return item.healthy;
      });
      hosts = hosts.map((item) => {
        return {
          Address: item.host,
          Port: item.port,
        };
      });
      if (successCb) {
        successCb(hosts);
      }
    });
  }
  private async init() {
    if (!this.isReady) {
      await this.nacosClient.ready();
      this.isReady = true;
    }
  }
}
