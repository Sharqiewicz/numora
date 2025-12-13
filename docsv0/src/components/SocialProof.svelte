<script>

    const logos = [
        { name: 'Uniswap', src: '/uniswap.png', url: 'https://uniswap.org/' },
        { name: 'SushiSwap', src: '/sushiswap.png', url: 'https://sushi.com/' },
        { name: 'PancakeSwap', src: '/pancakeswap.png', url: 'https://pancakeswap.finance/' },
        { name: 'Vortex', src: '/vortex.png', url: 'https://vortexfinance.co/' },
        { name: 'Pendulum', src: '/pendulum.png', url: 'https://portal.pendulumchain.org/' },
        { name: 'beefy', src: '/beefy.png', url: 'https://beefy.com/' },
        { name: 'Curve Finance', src: '/curvefi.png', url: 'https://curve.fi/' },
        { name: 'Hydration', src: '/hydration.svg', url: 'https://hydration.net/' },
        { name: 'Aave', src: '/aave.png', url: 'https://aave.com/' },
    ];
</script>

<section class="py-16 my-16 border rounded-xl border-gray-200 dark:border-[#23272b] bg-gray-50 dark:bg-[#181a1b]/50 hover:scale-[1.02] transition-transform duration-300">
    <div class="text-center max-w-3xl mx-auto mb-10 px-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">We analyzed the industry leaders.</h2>
        <p class="text-gray-600 dark:text-[#a0a3c4]">
            We didn't guess how to handle money, <strong>we analyzed the DeFi leaders.</strong> Numora’s core logic is a unification of the audited, hardened implementations used in the most trusted protocols in DeFi. We extracted the logic, removed the framework dependencies, and standardized the API.
        </p>
    </div>

    <div class="flex flex-wrap justify-center items-center gap-8 md:gap-16 px-4">
        {#each logos as logo}
            <a href={logo.url} target="_blank" rel="noopener noreferrer" class="group transition-all duration-300">
                <img
                    src={logo.src}
                    alt={logo.name}
                    class="social-logo h-8 md:h-12 w-auto opacity-60 group-hover:opacity-100 "
                />
            </a>
        {/each}
    </div>
</section>

<style>
  .social-logo {
    filter: grayscale(1) sepia(1) hue-rotate(250deg) saturate(4);
  }

  .group:hover .social-logo {
    filter: none;
  }
</style>
