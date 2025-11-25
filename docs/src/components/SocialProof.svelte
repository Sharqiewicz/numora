<script>
    // Using paths directly or importing if needed.
    // Assuming they are in /public or src/assets. The previous Buttons.svelte used <img src='uniswap.png'/> implying they are in public.

    const logos = [
        { name: 'Uniswap', src: '/uniswap.png', url: 'https://uniswap.org/' },
        { name: 'SushiSwap', src: '/sushiswap.png', url: 'https://sushi.com/' },
        { name: 'PancakeSwap', src: '/pancakeswap.png', url: 'https://pancakeswap.finance/' },
        { name: 'Vortex', src: '/vortex.png', url: 'https://vortexfinance.co/' }, // Using available logo
        { name: 'Pendulum', src: '/pendulum.png', url: 'https://portal.pendulumchain.org/' } // Using available logo
    ];
</script>

<div class="py-16 border-y border-[#23272b] bg-[#181a1b]/50">
    <div class="text-center max-w-3xl mx-auto mb-10 px-4">
        <h2 class="text-2xl font-bold text-white mb-4">Battle-Tested Foundations.</h2>
        <p class="text-[#a0a3c4]">
            We didn't guess how to handle money—we analyzed the industry leaders. Numora’s core logic is a unification of the audited, hardened implementations used in the most trusted protocols in DeFi. We extracted the logic, removed the framework dependencies, and standardized the API.
        </p>
    </div>

    <div class="flex flex-wrap justify-center items-center gap-8 md:gap-16 px-4">
        {#each logos as logo}
            <a href={logo.url} target="_blank" rel="noopener noreferrer" class="group transition-all duration-300">
                <img
                    src={logo.src}
                    alt={logo.name}
                    class="h-8 md:h-10 w-auto grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 filter"
                />
            </a>
        {/each}
    </div>
</div>
