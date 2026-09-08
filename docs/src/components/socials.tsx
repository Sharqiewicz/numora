import type { CSSProperties } from "react";
import github from "@/assets/github.svg";
import x from "@/assets/x.svg";
import { cn } from "@/lib/utils";

export function Socials({
	className,
	style,
}: {
	className: string;
	style?: CSSProperties;
}) {
	return (
		<div className={cn(className, "flex gap-6")} style={style}>
			<a
				href="https://x.com/sharqiewicz"
				target="_blank"
				rel="noopener noreferrer"
				className="relative after:absolute after:-inset-2 after:content-['']"
			>
				<img
					src={x}
					alt="X"
					className="w-6 h-6 hover:scale-105 active:scale-[0.96] transition-transform duration-150 ease-out-expo cursor-pointer"
				/>
			</a>
			<a
				href="https://github.com/sharqiewicz/numora"
				target="_blank"
				rel="noopener noreferrer"
				className="relative after:absolute after:-inset-2 after:content-['']"
			>
				<img
					src={github}
					alt="GitHub"
					className="w-6 h-6 hover:scale-105 active:scale-[0.96] transition-transform duration-150 ease-out-expo cursor-pointer"
				/>
			</a>
		</div>
	);
}
