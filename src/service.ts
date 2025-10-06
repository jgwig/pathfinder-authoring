"use client";

import { Service } from "./types/service/service";

export const servicesDemo: Service[] = [
	new Service({
		source: "manual-input",
		type: "signpost",
		name: "falls-south-tees",
		title: "Falls - South Tees: Steady On Your Feet",
		excerpt:
			"Falling, or feeling at risk of falls, is not an inevitable part of getting older. It may be the first sign of a new or worsening health condition, so it is important to tell your GP if you do have a fall.",
		image:
			"https://south-tees.steadyonyourfeet.org/images/regional-social/opengraph-wide--south-tees.png",
		icon: "person-falling",
		organisation: "Steady On Your Feet - South Tees",

		webLink: {
			url: "https://south-tees.steadyonyourfeet.org/information-advice/falls",
			text: "Visit Website",
		},
		// summary: {
		// 	title: "Understanding and Preventing Falls",
		// 	headline:
		// 		"Falling is not an inevitable part of getting older. It could indicate a health condition, making it crucial to report falls to your GP for proper assessment.",
		// 	description:
		// 		"Falling, or feeling at risk of falls, is not an inevitable part of getting older. It may be the first sign of a new or worsening health condition (e.g. infection, dehydration, etc) so it is important to tell your GP if you do have a fall. The more details you can remember about a fall, the easier it is to pinpoint a cause. Consider when, how, and where it happened to identify potential factors. Often, there isn't one specific reason, but a number of underlying risk factors that can be reduced with simple advice. These issues may include muscle weakness, poor balance, dizziness, environmental hazards, vision and hearing problems, foot issues, memory loss, poor nutrition, medications, bladder and bowel conditions, and alcohol consumption. Falling can also impact confidence, leading to reduced activity and increased falls risk. Taking a proactive approach, even without prior falls, can help you maintain activity and independence, improving long-term quality of life.",
		// 	highlights: [
		// 		"Understand when, how, and where a fall happened to help identify causes.",
		// 		"Recognise common risk factors like muscle weakness, poor balance, and environmental hazards.",
		// 		"Address issues such as vision problems, foot health, medication side effects, and nutrition.",
		// 		"Be proactive in preventing falls to maintain confidence, activity, and independence.",
		// 	],
		// },
	}),
];
