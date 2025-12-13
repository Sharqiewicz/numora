import uniswapLogo from '@/assets/defi/uniswap.png'
import sushiswapLogo from '@/assets/defi/sushiswap.png'
import pancakeswapLogo from '@/assets/defi/pancakeswap.png'
import vortexLogo from '@/assets/defi/vortex.png'
import pendulumLogo from '@/assets/defi/pendulum.png'
import beefyLogo from '@/assets/defi/beefy.png'
import curvefiLogo from '@/assets/defi/curvefi.png'
import hydrationLogo from '@/assets/tokens/hydration.svg'
import aaveLogo from '@/assets/defi/aave.png'

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
]

export function SocialProof() {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-16 my-16 border rounded-xl border-[#23272b] bg-[#181a1b]/80 hover:scale-[1.02] transition-transform duration-300">
        <div className="text-center max-w-3xl mx-auto mb-10 px-4">
          <h2 className="text-3xl mb-4">
            We analyzed the industry leaders.
          </h2>
          <p>
            We didn't guess how to handle money, <strong>we analyzed the DeFi leaders.</strong> Numora's core logic is a unification of the audited, hardened implementations used in the most trusted protocols in DeFi. We extracted the logic, removed the framework dependencies, and standardized the API.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 px-4">
          {logos.map((logo) => (
            <a
              key={logo.name}
              href={logo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="social-logo-group transition-all duration-300"
            >
              <img
                src={logo.src}
                alt={logo.name}
                className="social-logo h-12 w-auto opacity-60"
              />
            </a>
          ))}
        </div>
    </div>
  )
}
