import { GeoCoordinates } from '../base/geoCoordinates';

export class Testimonial {
  text?: string;
  firstName: string;
  lastName?: string;
  age?: string;
  location?: GeoCoordinates;
  city?: string;
  gender?: string;
  sortPriority?: number;

  constructor(data?: Partial<Testimonial>) {
    this.text = data?.text;
    this.firstName = data?.firstName || 'Anonymous';
    this.lastName = data?.lastName;
    this.age = data?.age;
    this.location = data?.location;
    this.city = data?.city;
  }

  get authorDetailsForDisplay(): string {
    let details = this.firstName;

    if (this.age) {
      details += ' - ' + this.age;
    }
    if (this.city) {
      details += ' - ' + this.city;
    }

    return details.trim();
  }
}
