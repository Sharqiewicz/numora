import type React from "react";
import aaveLogo from "@/assets/defi/aave.png";
import beefyLogo from "@/assets/defi/beefy.png";
import curvefiLogo from "@/assets/defi/curvefi.png";
import pancakeswapLogo from "@/assets/defi/pancakeswap.png";
import pendulumLogo from "@/assets/defi/pendulum.png";
import sushiswapLogo from "@/assets/defi/sushiswap.png";
import uniswapLogo from "@/assets/defi/uniswap.png";
import vortexLogo from "@/assets/defi/vortex.png";
import hydrationLogo from "@/assets/tokens/hydration.svg";
import { useStaggeredReveal } from "@/hooks/use-scroll-reveal";

const logos = [
	{
		name: "Uniswap",
		src: uniswapLogo,
		url: "https://uniswap.org/",
		filled: false,
	},
	{
		name: "SushiSwap",
		src: sushiswapLogo,
		url: "https://sushi.com/",
		filled: true,
	},
	{
		name: "PancakeSwap",
		src: pancakeswapLogo,
		url: "https://pancakeswap.finance/",
		filled: true,
	},
	{
		name: "Vortex",
		src: vortexLogo,
		url: "https://vortexfinance.co/",
		filled: true,
	},
	{
		name: "Pendulum",
		src: pendulumLogo,
		url: "https://portal.pendulumchain.org/",
		filled: true,
	},
	{ name: "beefy", src: beefyLogo, url: "https://beefy.com/", filled: false },
	{
		name: "Curve Finance",
		src: curvefiLogo,
		url: "https://curve.fi/",
		filled: false,
	},
	{
		name: "Hydration",
		src: hydrationLogo,
		url: "https://hydration.net/",
		filled: false,
	},
	{ name: "Aave", src: aaveLogo, url: "https://aave.com/", filled: false },
];

interface SocialProofProps {
	heading?: string;
	description?: React.ReactNode;
}

export function SocialProof({ heading, description }: SocialProofProps = {}) {
	const { ref, isVisible } = useStaggeredReveal(logos.length, {
		threshold: 0.15,
		staggerDelay: 80,
	});

	const defaultDescription = (
		<>
			We didn't guess how to handle numbers,{" "}
			<strong className="text-foreground">
				we analyzed the industry leaders.
			</strong>{" "}
			Numora's core logic is a unification of the audited, hardened
			implementations used in the most trusted protocols in DeFi. We extracted
			the logic, removed the framework dependencies, and standardized the API.
		</>
	);

	return (
		<div
			ref={ref}
			className="py-12 sm:py-16 px-4 sm:px-16 my-16 rounded-xl bg-surface-1 shadow-border"
		>
			<div
				className={`
          text-center max-w-3xl mx-auto mb-10 px-4
          scroll-reveal ${isVisible ? "is-visible" : ""}
        `}
			>
				<h2 className="text-3xl mb-4">
					{heading ?? "We analyzed the industry leaders."}
				</h2>
				<p className="text-muted-foreground">
					{description ?? defaultDescription}
				</p>
			</div>

			<div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 px-4">
				{logos.map((logo, index) => (
					<a
						key={logo.name}
						href={logo.url}
						target="_blank"
						rel="noopener noreferrer"
						className={`
              group relative
              transition-[opacity,transform,scale] duration-300 ease-out
              hover:scale-110
              active:scale-[0.96] active:duration-150 active:ease-out-expo
              ${isVisible ? "animate-logo-reveal" : "opacity-0"}
            `}
						style={{
							animationDelay: isVisible ? `${index * 80 + 200}ms` : "0ms",
							animationFillMode: "forwards",
						}}
					>
						<div
							className="
                absolute inset-0 -z-10
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                blur-xl bg-secondary/20
                scale-150
              "
						/>
						<img
							src={logo.src}
							alt={logo.name}
							className={`
                h-10 md:h-12 w-auto
                filter grayscale-[30%]
                group-hover:grayscale-0
                transition-[filter] duration-300
                ${logo.filled ? "outline outline-1 -outline-offset-1 outline-white/10" : ""}
              `}
						/>
					</a>
				))}
			</div>
		</div>
	);
}
