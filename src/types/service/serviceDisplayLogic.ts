export class ServiceDisplayLogic {
	expression: "and" | "or";
	criteriaGroups: CriteriaGroup[];

	constructor(data?: Partial<ServiceDisplayLogic>) {
		this.expression = data && data.expression ? data.expression : "and";
		this.criteriaGroups =
			data && data.criteriaGroups ? data.criteriaGroups : [];
	}
}

export class CriteriaGroup {
	expression: "and" | "or";
	criteria: Criterion<unknown>[];

	constructor(data?: Partial<CriteriaGroup>) {
		this.expression = data && data.expression ? data.expression : "and";
		this.criteria = data && data.criteria ? data.criteria : [];
	}
}

export class Criterion<T> {
	type?: "pds" | "region" | "distance" | "postcode-list";
	expression?: "equal-to" | "greater-than" | "less-than" | "in";
	value: T;

	constructor(data: Partial<Criterion<T>>) {
		this.type = data && data.type ? data.type : "pds";
		this.expression = data && data.expression ? data.expression : "equal-to";
		this.value =
			data && data.value !== undefined ? data.value : ("" as unknown as T);
	}
}

export class CriterionPds extends Criterion<CriterionPds> {
	field: string;

	constructor(data: Partial<CriterionPds>) {
		super(data);
		this.type = "pds";
		this.expression = data && data.expression ? data.expression : "equal-to";
		this.field = data && data.field ? data.field : "";
	}
}

export class CriterionRegion extends Criterion<CriterionRegion> {
	regionName: string;

	constructor(data: Partial<CriterionRegion>) {
		super(data);
		this.type = "region";
		this.expression = data && data.expression ? data.expression : "equal-to";
		this.regionName = data && data.regionName ? data.regionName : "";
	}
}

export class CriterionDistance extends Criterion<CriterionDistance> {
	distanceInMiles: number;

	constructor(data: Partial<CriterionDistance>) {
		super(data);
		this.type = "distance";
		this.distanceInMiles =
			data && data.distanceInMiles ? data.distanceInMiles : 0;
		this.expression = data && data.expression ? data.expression : "less-than";
	}
}

export class CriterionPostcodeList extends Criterion<CriterionPostcodeList> {
	postcodes: string[];

	constructor(data: Partial<CriterionPostcodeList>) {
		super(data);
		this.type = "postcode-list";
		this.expression = data && data.expression ? data.expression : "in";
		this.postcodes = data && data.postcodes ? data.postcodes : [];
	}
}
