import { SitStandTest } from "./sit-stand-test";
import { TimedUpAndGoTest } from "./timed-up-and-go-test";

export const clinicalComponentRegistry = {
	sitStandTest: SitStandTest,
	timedUpAndGoTest: TimedUpAndGoTest,
};

export const clinicalComponentsTypes = {
	sitStandTest: "Sit Stand Test",
	timedUpAndGoTest: "Timed Up and Go Test",
};
