import { Service } from '../service';
import { ServiceDisplayLogic } from '../serviceDisplayLogic';
import {
  ServiceOutput,
  OutputContact,
  OutputEmail,
  OutputPds,
  OutputRedirect,
} from '../serviceOutput';
import { ServiceSummary } from '../serviceSummary';
import { EmailOutputFormSection } from '../outputFormSection';

export class ServiceServerModel {
  // INFORMATION
  id?: string;
  source: 'manual-input' | 'mrd';
  type: 'connection' | 'signpost'; // 'connection' is legacy naming (should be 'service')
  alissId?: string;
  name: string; // a unique name + used as the slug, regex: ^([a-z0-9]+-?)+$
  title: string; // 80 character title
  excerpt: string; // 200 character intro to the service
  image: string; // URL to an image for the service
  icon?: string; // Name of an icon or the SVG. The icon component will determine which it is by the <svg> tag
  priority: number; // used for ordering 1-5 from org perspective (1 is highest, 5 is lowest)
  priorityUser: number; // used for ordering 1-5 from user perspective (1 is highest, 5 is lowest)
  postcode?: string; // used for postcode lookup
  organisation?: string; // used for organisation lookup
  dataUsageStatement?: string; // What the service intends to do with the data
  serviceCategoryNamesManualInput?: string[]; // used for filtering
  serviceCategoryNamesFromAliss?: string[]; // used for filtering

  communityServiceDetails: ServiceDetails;

  constructor(service: Partial<ServiceServerModel>) {
    this.id = service.id;
    this.source = service.source || 'manual-input';
    this.alissId = service.alissId;
    this.name = service.name ?? 'no-service-name';
    this.type = service.type === 'signpost' ? 'signpost' : 'connection';
    this.title = service.title ?? 'Service Title missing';
    this.excerpt = service.excerpt || '';
    this.image =
      service.image ||
      'https://images.pexels.com/photos/5825696/pexels-photo-5825696.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
    this.icon = service.icon;
    this.priority = service.priority ?? 3;
    this.priorityUser = service.priorityUser ?? 5;
    this.postcode = service.postcode;
    this.organisation = service.organisation;
    this.dataUsageStatement = service.dataUsageStatement;
    this.serviceCategoryNamesManualInput =
      service.serviceCategoryNamesManualInput;
    this.serviceCategoryNamesFromAliss = service.serviceCategoryNamesFromAliss;
    this.communityServiceDetails = new ServiceDetails(
      service.communityServiceDetails
    );
  }

  public static fromService(service: Service): ServiceServerModel {
    let serverModel = new ServiceServerModel({});

    serverModel.id = service.id;
    serverModel.source = service.source;
    serverModel.alissId = service.alissId;
    serverModel.name = service.name;
    serverModel.type = service.type;
    serverModel.title = service.title;
    serverModel.excerpt = service.excerpt || '';
    serverModel.image = service.image;
    serverModel.icon = service.icon;
    serverModel.priority = service.priority;
    serverModel.priorityUser = service.priorityUser;
    serverModel.postcode = service.postcode;
    serverModel.organisation = service.organisation;
    serverModel.dataUsageStatement = service.dataUsageStatement;
    serverModel.serviceCategoryNamesManualInput =
      service.serviceCategoryNamesManualInput;
    serverModel.serviceCategoryNamesFromAliss =
      service.serviceCategoryNamesFromAliss;

    serverModel.communityServiceDetails.webLink = service.webLink;
    serverModel.communityServiceDetails.appLink = service.appLink;
    serverModel.communityServiceDetails.summary = service.summary;
    serverModel.communityServiceDetails.finderPaths = service.finderPaths;
    serverModel.communityServiceDetails.data = service.emailOutputForm;
    serverModel.communityServiceDetails.outputFormThem =
      service.emailOutputFormThem;
    serverModel.communityServiceDetails.useSeparateOutputFormThem =
      service.useSeparateEmailOutputFormThem;
    serverModel.communityServiceDetails.displayInPublicFinder =
      service.displayInPublicFinder;
    serverModel.communityServiceDetails.displayLogic = service.displayLogic;
    serverModel.communityServiceDetails.outputs = service.outputs;

    return serverModel;
  }
}

export class ServiceDetails {
  // LINKS
  webLink?: {
    url: string;
    text: string;
  };

  appLink?: {
    url: string;
    text: string;
  };

  // CONTENT
  summary?: ServiceSummary;

  // OUTPUTS
  outputs: ServiceOutput<
    OutputPds | OutputEmail | OutputRedirect | OutputContact
  >[];

  // EMAIL OUTPUT FORM
  data: EmailOutputFormSection[]; // legacy naming, should be 'emailOutputForm'
  outputFormThem?: EmailOutputFormSection[]; // legacy naming, should be 'emailOutputFormThem'
  useSeparateOutputFormThem?: boolean; // legacy naming, should be 'useSeparateEmailOutputFormThem'

  // DISPLAY
  finderPaths: string[];
  displayInPublicFinder: boolean;
  displayLogic?: ServiceDisplayLogic; // not modeled out in backend yet

  constructor(data?: Partial<ServiceDetails>) {
    this.webLink = data?.webLink;
    this.appLink = data?.appLink;
    this.summary = new ServiceSummary(data?.summary);
    this.finderPaths = data?.finderPaths ?? [];
    this.data = data?.data ?? [];
    this.outputFormThem = data?.outputFormThem;
    this.useSeparateOutputFormThem = data?.useSeparateOutputFormThem ?? false;
    this.displayInPublicFinder = data?.displayInPublicFinder ?? true;
    this.displayLogic = data?.displayLogic;
    this.outputs = data?.outputs ?? [];
  }
}
