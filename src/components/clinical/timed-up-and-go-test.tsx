import Image from "next/image";
import { Button } from "../ui/button";

export function TimedUpAndGoTest() {
	return (
		<div className="bg-theme text-white rounded-3xl p-8 gap-8 flex flex-col items-center max-w-full shadow-md  relative">
			<h1 className="text-center font-bold text-3xl my-0 p-0">
				Timed Up and Go Test
			</h1>
			<div>
				<div className="my-8 mb-6 flex flex-col items-center">
					<div className="relative h-[200px] w-[400px] flex items-center justify-center">
						<div className="w-full h-full  z-10 relative">
							<Image
								src="/time_and_go.png"
								fill
								className="object-contain"
								alt=""
							/>
						</div>
						<div className="absolute w-96 h-96 rounded-full bg-white/10"></div>
						<div className="absolute w-64 h-64 rounded-full bg-white/15"></div>
						<div className="absolute w-40 h-40 rounded-full bg-white/20"></div>
					</div>
				</div>
				<div className="text-center">
					<div className="text-[2.5rem] font-bold tracking-widest">00:09</div>
				</div>
			</div>
			<div className="flex w-full justify-between">
				<Button variant={"secondary"}>Back</Button>
				<Button variant={"secondary"}>Finished</Button>
			</div>
		</div>
	);
}
