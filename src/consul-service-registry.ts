import * as Consul from "consul";
import { hostname } from "os";
import ServiceRegistry from "./interfaces/service-registry";

export class ConsulServiceRegistry implements ServiceRegistry {
  private consul: Consul.Consul;

  constructor(options: Consul.ConsulOptions) {
    this.consul = new Consul(options);
  }

  register(options: Consul.Agent.Service.RegisterOptions) {
    return new Promise((resolve, reject) => {
      if (!options.id) {
        options.id = `${options.name}:${hostname()}`;
      }
      this.consul.agent.service.register(options, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  unRegister(serviceName) {
    return new Promise((resolve, reject) => {
      this.consul.agent.service.deregister(
        `${serviceName}:${hostname()}`,
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }
  private checkServiceHealth(serviceName, serviceId) {
    const self = this;
    return new Promise((resolve, reject) => {
      self.consul.health.service(serviceName, function (err, result: any) {
        if (!err) {
          const serviceData = result.find((item) => {
            return item.Service.ID === serviceId;
          });
          const checkResult = serviceData.Checks.find((item) => {
            return item.ServiceID === serviceId;
          });
          if (checkResult.Status === "passing") {
            resolve(serviceData.Service);
          } else {
            resolve();
          }
        } else {
          reject();
        }
      });
    });
  }
  subscribe(serviceName, successCb?, errorCb?) {
    const self = this;
    const watch = this.consul.watch({
      method: this.consul.catalog.service.nodes,
      options: {
        service: serviceName,
        query: {
          passing: true,
        },
      },
    });
    watch.on("change", async function (data, res) {
      const healthService = [];
      for (const service of data) {
        const serviceId = service.ServiceID;
        const healthServer = await self.checkServiceHealth(
          serviceName,
          serviceId
        );
        if (healthServer) {
          healthService.push(healthServer);
        }
      }
      if (successCb) {
        successCb(healthService);
      }
    });

    watch.on("error", function (err) {
      console.log("error:", err);
      if (errorCb) {
        errorCb(err);
      }
    });
  }
}
