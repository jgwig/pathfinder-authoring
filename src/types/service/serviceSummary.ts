import { Testimonial } from './testimonial';

export class ServiceSummary {
  title?: string; // 80 character title
  headline?: string; // 200 characters
  description?: string; // 3000 characters
  highlights?: string[]; // displays as bulleted list of text after the description
  images?: string[]; // additional images to display
  youtubeChannel?: string; // youtube channel url
  vimeoChannel?: string; // vimeo channel url
  testimonials?: Testimonial[];

  constructor(data?: Partial<ServiceSummary>) {
    this.title = data && data.title;
    this.headline = data && data.headline;
    this.description =
      data && data.description
        ? this.cleanUpDescriptionFormatting(data.description)
        : undefined;
    this.images = data && data.images ? data.images : [];
    this.highlights = data && data.highlights ? data.highlights : [];
    this.youtubeChannel = data?.youtubeChannel;
    this.vimeoChannel = data?.vimeoChannel;
    this.testimonials = data && data.testimonials ? data.testimonials : [];
  }

  cleanUpDescriptionFormatting(description: string): string {
    return description
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/(\r\n){3,}/g, '\r\n\r\n');
  }

  get firstTestimonial(): Testimonial | undefined {
    if (!this.testimonials || this.testimonials.length === 0) {
      return undefined;
    }

    // return testimonial with highest priority
    const sortedTestimonials = this.testimonials.sort((a, b) => {
      return (b.sortPriority ?? 0) - (a.sortPriority ?? 0);
    });

    if (!sortedTestimonials[0].text) return undefined;

    return sortedTestimonials[0];
  }
}
