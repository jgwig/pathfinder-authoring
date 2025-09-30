import { ServiceDisplayType } from "./serviceDisplayType";

import { ServiceDisplayLogic } from "./serviceDisplayLogic";
import { EmailOutputFormSection } from "./outputFormSection";
import { ServiceServerModel } from "./server/serviceServerModel";
import { ServiceSummary } from "./serviceSummary";

export class Service {
	// PROPERTIES

	// information
	id?: string;
	source: "manual-input" | "mrd";
	type: "connection" | "signpost"; // 'connection' is legacy naming (should be 'service')
	alissId?: string;
	name: string; // a unique name + used as the slug, regex: ^([a-z0-9]+-?)+$
	title: string; // 80 character title
	excerpt?: string; // 200 character intro to the service
	image: string; // URL to an image for the service
	icon?: string; // Name of an icon or the SVG. The icon component will determine which it is by the <svg> tag
	priority: number; // used for ordering 1-5 from org perspective (1 is highest, 5 is lowest)
	priorityUser: number; // used for ordering 1-5 from user perspective (1 is highest, 5 is lowest)
	postcode?: string; // legacy: not used for postcode lookup (contact output is used for postcode lookup)
	organisation?: string; // used for organisation lookup
	dataUsageStatement?: string; // What the service intends to do with the data

	// links
	appLink?: {
		url: string;
		text: string;
	};

	webLink?: {
		url: string;
		text: string;
	};

	// content
	summary?: ServiceSummary;

	// email output forms
	emailOutputForm: EmailOutputFormSection[];
	emailOutputFormThem?: EmailOutputFormSection[];
	useSeparateEmailOutputFormThem?: boolean; // used as display condition for emailOutputFormThem in service editor

	// display
	finderPaths: string[];
	serviceCategoryNamesManualInput: string[]; // used for filtering
	serviceCategoryNamesFromAliss: string[]; // used for filtering
	displayInPublicFinder: boolean; // Whether the service should be displayed in the public finder
	displayLogic?: ServiceDisplayLogic;
	displayType?: ServiceDisplayType; // how the service shall be displayed in the app (not modeled out in backend yet)

	// CONSTRUCTOR
	constructor(service: Partial<Service>) {
		this.id = service.id;
		this.source = service.source ?? "manual-input";
		this.alissId = service.alissId;
		this.name = service.name ?? "no-service-name";
		this.type = service.type === "signpost" ? "signpost" : "connection";
		this.title = service.title ?? "Service Title missing";
		this.excerpt = service.excerpt ?? "";
		this.image =
			service.image ??
			"https://images.pexels.com/photos/5825696/pexels-photo-5825696.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
		this.icon = service.icon;
		this.priority = service.priority ?? 3;
		this.priorityUser = service.priorityUser ?? 5;
		this.postcode = service.postcode;
		this.organisation = service.organisation;
		this.dataUsageStatement = service.dataUsageStatement;

		this.appLink = service.appLink;
		this.webLink = service.webLink;
		this.summary = new ServiceSummary(service.summary);
		this.finderPaths = service.finderPaths ?? [];
		this.serviceCategoryNamesManualInput =
			service.serviceCategoryNamesManualInput ?? [];
		this.serviceCategoryNamesFromAliss =
			service.serviceCategoryNamesFromAliss ?? [];
		this.displayInPublicFinder = service.displayInPublicFinder ?? true;
		this.displayLogic = service.displayLogic;

		this.emailOutputForm = Array.isArray(service?.emailOutputForm)
			? service.emailOutputForm.map((e) => new EmailOutputFormSection(e))
			: [];
		this.emailOutputFormThem = Array.isArray(service?.emailOutputFormThem)
			? service.emailOutputFormThem.map((e) => new EmailOutputFormSection(e))
			: [];
		this.useSeparateEmailOutputFormThem =
			service.useSeparateEmailOutputFormThem ?? false;
	}

	// PUBLIC METHODS

	public static fromServiceServerModel(
		serverModel: ServiceServerModel
	): Service {
		let service = new Service({});

		service.id = serverModel.id;
		service.source = serverModel.source || "manual-input";
		service.alissId = serverModel.alissId;
		service.name = serverModel.name || "no-service-name";
		service.type = serverModel.type === "signpost" ? "signpost" : "connection";
		service.title = serverModel.title || "Service Title missing";
		service.excerpt = serverModel.excerpt || "";
		service.image =
			serverModel.image ||
			"https://images.pexels.com/photos/5825696/pexels-photo-5825696.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
		service.icon = serverModel.icon;
		service.priority = serverModel.priority || 3;
		service.priorityUser = serverModel.priorityUser || 5;
		service.postcode = serverModel.postcode;
		service.organisation = serverModel.organisation;
		service.dataUsageStatement = serverModel.dataUsageStatement;
		service.serviceCategoryNamesManualInput =
			serverModel.serviceCategoryNamesManualInput || [];
		service.serviceCategoryNamesFromAliss =
			serverModel.serviceCategoryNamesFromAliss || [];

		service.appLink = serverModel.communityServiceDetails.appLink;
		service.webLink = serverModel.communityServiceDetails.webLink;
		service.summary = new ServiceSummary(
			serverModel.communityServiceDetails.summary
		);
		service.finderPaths = serverModel.communityServiceDetails.finderPaths;
		service.emailOutputForm = Array.isArray(
			serverModel.communityServiceDetails?.data
		)
			? serverModel.communityServiceDetails.data.map(
					(e) => new EmailOutputFormSection(e)
			  )
			: [];
		service.emailOutputFormThem = Array.isArray(
			serverModel.communityServiceDetails?.outputFormThem
		)
			? serverModel.communityServiceDetails.outputFormThem.map(
					(e) => new EmailOutputFormSection(e)
			  )
			: [];
		service.useSeparateEmailOutputFormThem =
			serverModel.communityServiceDetails.useSeparateOutputFormThem ?? false;

		service.displayInPublicFinder =
			serverModel.communityServiceDetails.displayInPublicFinder;
		service.displayLogic = serverModel.communityServiceDetails.displayLogic;

		return service;
	}
}
