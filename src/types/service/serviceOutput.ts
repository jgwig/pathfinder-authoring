import {
  getAllMatchingPdsSections,
  getTitlesFromPdsSectionNames,
} from 'src/assets/pds/pds-sections/allPdsSections';
import { Address } from '../base/address';
import { PdsSection } from '../pds/pdsSection';
import { GeoCoordinates } from '../base/geoCoordinates';

export class ServiceOutput<T> {
  type?: 'redirect' | 'email' | 'contact' | 'pds'; // 'redirect', 'pds' is legacy support
  introduction?: string; // used to introduce what the output will do for this particular service
  nextSteps?: string; // used to introduce what will happen next when the output is executed

  constructor(data: Partial<ServiceOutput<any>>) {
    this.type = data && data.type ? data.type : 'redirect';
    this.introduction = data.introduction;
    this.nextSteps = data.nextSteps;
  }
}

export class OutputEmail extends ServiceOutput<OutputEmail> {
  email: string;
  confirmationEmailText?: string;
  referralEmailText?: string;

  constructor(data: Partial<OutputEmail>) {
    super(data);
    this.type = 'email';
    this.email = data.email ? data.email : '';
    this.confirmationEmailText = data.confirmationEmailText;
    this.referralEmailText = data.referralEmailText;
  }
}

export class OutputContact extends ServiceOutput<OutputContact> {
  phone?: string;
  email?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;

  openingHours?: string[];
  address?: Address;
  latitude?: string;
  longitude?: string;
  geoCoordinates?: GeoCoordinates;

  get hasAddressData(): boolean {
    return this.address?.address1 ||
      this.address?.address2 ||
      this.address?.city ||
      this.address?.postcode
      ? true
      : false;
  }

  constructor(data: Partial<OutputContact>) {
    super(data);
    this.type = 'contact';
    this.phone = data.phone;
    this.email = data.email;
    this.website = data.website;
    this.facebook = data.facebook;
    this.twitter = data.twitter;
    this.instagram = data.instagram;
    this.openingHours = data.openingHours || [];
    this.address = data.address;
    this.latitude = data.latitude;
    this.longitude = data.longitude;

    this.geoCoordinates = GeoCoordinates.fromStringValues(
      this.latitude,
      this.longitude
    );
  }
}

// LEGACY SUPPORT START
export class OutputRedirect extends ServiceOutput<OutputRedirect> {
  destinationUrl: string;
  title?: string;

  constructor(data: Partial<OutputRedirect>) {
    super(data);
    this.type = 'redirect';
    this.destinationUrl = data.destinationUrl ? data.destinationUrl : '';
    this.title = data.title;
  }
}

export class OutputPds extends ServiceOutput<OutputPds> {
  mrdServiceProviderIdV2: number | null; // MrdServiceProviderId is deprecated; use MrdServiceProviderIdV2 instead
  mrdServiceIdV2: number | null; // MrdServiceId is deprecated; use MrdServiceIdV2 instead

  pdsReferralText?: string;
  pdsReferralCompletedText?: string;
  pdsMamSectionNamesProviderAccess?: string[] = []; // list of names/ids of PDS MAM sections that the service provider will get access to (used for user consent info)

  requiredPdsSectionNames?: string[] = []; // list of names/ids of required PDS sections for the user to complete
  optionalPdsSectionNames?: string[] = []; // list of names/ids of optional PDS sections for the user to complete

  get pdsMamSectionTitlesProviderAccess(): string[] {
    return getTitlesFromPdsSectionNames(this.pdsMamSectionNamesProviderAccess);
  }

  get requiredPdsSections(): PdsSection[] {
    return getAllMatchingPdsSections(this.requiredPdsSectionNames);
  }

  get optionalPdsSections(): PdsSection[] {
    return getAllMatchingPdsSections(this.optionalPdsSectionNames);
  }

  get allPdsSections(): PdsSection[] {
    return [...this.requiredPdsSections, ...this.optionalPdsSections];
  }

  constructor(data: Partial<OutputPds>) {
    super(data);
    this.type = 'pds';
    this.mrdServiceProviderIdV2 = data.mrdServiceProviderIdV2 ?? null;
    this.mrdServiceIdV2 = data.mrdServiceIdV2 ?? null;
    this.pdsReferralText = data.pdsReferralText;
    this.pdsReferralCompletedText = data.pdsReferralCompletedText;
    this.pdsMamSectionNamesProviderAccess =
      data.pdsMamSectionNamesProviderAccess ?? [];
    this.requiredPdsSectionNames = data.requiredPdsSectionNames ?? [];
    this.optionalPdsSectionNames = data.optionalPdsSectionNames ?? [];
  }
}
// LEGACY SUPPORT END

// HELPER FUNCTION FOR SERVICE AUTHORING FORM

// getValueFromSource

export function getOutputPdsFromSource(
  source: ServiceOutput<any>[]
): ServiceOutput<OutputPds> | undefined {
  return getValueFromSource(source, 'pds');
}

export function getOutputContactFromSource(
  source: ServiceOutput<any>[]
): ServiceOutput<OutputContact> | undefined {
  return getValueFromSource(source, 'contact');
}

export function getOutputEmailFromSource(
  source: ServiceOutput<any>[]
): ServiceOutput<OutputEmail> | undefined {
  return getValueFromSource(source, 'email');
}

function getValueFromSource<T>(
  source: ServiceOutput<T>[] | undefined,
  targetType: 'email' | 'contact' | 'pds'
): ServiceOutput<T> | undefined {
  if (Array.isArray(source)) {
    return source.find((item) => item.type === targetType);
  }
  return undefined;
}

// prepareValueForPayload

export function prepareOutputPdsForPayload(
  currentValueAtPath: ServiceOutput<any>[],
  newValue: ServiceOutput<any>[]
): ServiceOutput<any>[] {
  return prepareValueForPayload('pds', currentValueAtPath, newValue);
}

export function prepareOutputContactForPayload(
  currentValueAtPath: ServiceOutput<any>[],
  newValue: ServiceOutput<any>[]
): ServiceOutput<any>[] {
  return prepareValueForPayload('contact', currentValueAtPath, newValue);
}

export function prepareOutputEmailForPayload(
  currentValueAtPath: ServiceOutput<any>[],
  newValue: ServiceOutput<any>[]
): ServiceOutput<any>[] {
  return prepareValueForPayload('email', currentValueAtPath, newValue);
}

function prepareValueForPayload(
  targetType: 'email' | 'contact' | 'pds',
  currentValueAtPath: ServiceOutput<any>[],
  newValue?: ServiceOutput<any>[]
): ServiceOutput<any>[] {
  // expected input: currentValueAtPath is an array, else set to empty array
  if (!Array.isArray(currentValueAtPath)) {
    currentValueAtPath = [];
  }

  // expected input: newValue is an array, else return currentValueAtPath
  if (!Array.isArray(newValue)) {
    return currentValueAtPath;
  }

  // get the relevant output (of targetType) from the newValue array
  let newOutput = newValue.find((item) => item.type === targetType);

  // get the relevant output (of targetType) from the currentValueAtPath
  let oldOutput = currentValueAtPath.find((item) => item.type === targetType);

  // case: old item exists and new value is defined -> replace
  if (oldOutput && newOutput) {
    currentValueAtPath[currentValueAtPath.indexOf(oldOutput)] = newOutput;
  }
  // case: old item exists, new value is undefined -> remove
  else if (oldOutput && !newOutput) {
    currentValueAtPath.splice(currentValueAtPath.indexOf(oldOutput), 1);
  }
  // case: no old item -> just add the new value
  else if (!oldOutput && newOutput) {
    currentValueAtPath.push(newOutput);
  }
  // case: no old item and no new value -> do nothing

  return currentValueAtPath;
}
