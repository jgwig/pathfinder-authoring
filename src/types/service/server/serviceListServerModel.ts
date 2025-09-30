import { ServiceServerModel } from './serviceServerModel';

export class ServiceListServerModel {
  services: ServiceServerModel[];

  constructor(data?: Partial<ServiceListServerModel>) {
    this.services = data?.services ?? [];
  }
}
