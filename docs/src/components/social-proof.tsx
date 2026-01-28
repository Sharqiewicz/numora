import { useStaggeredReveal } from '@/hooks/use-scroll-reveal';

import aaveLogo from '@/assets/defi/aave.png';
import beefyLogo from '@/assets/defi/beefy.png';
import curvefiLogo from '@/assets/defi/curvefi.png';
import pancakeswapLogo from '@/assets/defi/pancakeswap.png';
import pendulumLogo from '@/assets/defi/pendulum.png';
import sushiswapLogo from '@/assets/defi/sushiswap.png';
import uniswapLogo from '@/assets/defi/uniswap.png';
import vortexLogo from '@/assets/defi/vortex.png';
import hydrationLogo from '@/assets/tokens/hydration.svg';

const logos = [
  { name: 'Uniswap', src: uniswapLogo, url: 'https://uniswap.org/' },
  { name: 'SushiSwap', src: sushiswapLogo, url: 'https://sushi.com/' },
  { name: 'PancakeSwap', src: pancakeswapLogo, url: 'https://pancakeswap.finance/' },
  { name: 'Vortex', src: vortexLogo, url: 'https://vortexfinance.co/' },
  { name: 'Pendulum', src: pendulumLogo, url: 'https://portal.pendulumchain.org/' },
  { name: 'beefy', src: beefyLogo, url: 'https://beefy.com/' },
  { name: 'Curve Finance', src: curvefiLogo, url: 'https://curve.fi/' },
  { name: 'Hydration', src: hydrationLogo, url: 'https://hydration.net/' },
  { name: 'Aave', src: aaveLogo, url: 'https://aave.com/' },
];

export function SocialProof() {
  const { ref, isVisible } = useStaggeredReveal(logos.length, {
    threshold: 0.15,
    staggerDelay: 80,
  });

  return (
    <div
      ref={ref}
      className="py-12 sm:py-16 px-4 sm:px-16 my-16 border rounded-xl border-[#23272b] bg-[#181a1b]"
    >
      <div
        className={`
          text-center max-w-3xl mx-auto mb-10 px-4
          scroll-reveal ${isVisible ? 'is-visible' : ''}
        `}
      >
        <h2 className="text-3xl mb-4">We analyzed the industry leaders.</h2>
        <p className="text-muted-foreground">
          We didn't guess how to handle money,{' '}
          <strong className="text-foreground">we analyzed the DeFi leaders.</strong> Numora's core
          logic is a unification of the audited, hardened implementations used in the most trusted
          protocols in DeFi. We extracted the logic, removed the framework dependencies, and
          standardized the API.
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
              transition-all duration-300 ease-out
              hover:scale-110
              ${isVisible ? 'animate-logo-reveal' : 'opacity-0'}
            `}
            style={{
              animationDelay: isVisible ? `${index * 80 + 200}ms` : '0ms',
              animationFillMode: 'forwards',
            }}
          >
            {/* Glow effect on hover */}
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
              className="
                h-10 md:h-12 w-auto
                filter grayscale-[30%]
                group-hover:grayscale-0
                transition-all duration-300
              "
            />
          </a>
        ))}
      </div>

      {/* Decorative bottom gradient line */}
      <div
        className={`
          mt-10 mx-auto h-[1px] max-w-md
          bg-gradient-to-r from-transparent via-secondary/40 to-transparent
          scroll-reveal ${isVisible ? 'is-visible' : ''}
        `}
        style={{ transitionDelay: '0.8s' }}
      />
    </div>
  );
}
