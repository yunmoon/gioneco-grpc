export default interface ServiceRegistry {
  register(options: any): Promise<any>;
  unRegister(serviceName: string, options?: any): Promise<any>;
  subscribe(serviceName: string, successCb?, errorCb?);
}
