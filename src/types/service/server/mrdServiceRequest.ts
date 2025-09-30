export class MrdServiceRequest {
  alissId: string;

  constructor(data?: Partial<MrdServiceRequest>) {
    this.alissId = data?.alissId ?? '';
  }
}
