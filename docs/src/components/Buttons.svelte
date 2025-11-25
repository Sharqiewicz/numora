<script lang="ts">
    import Button from './Button.svelte';
    import ButtonAccent from './ButtonAccent.svelte';
</script>

<div class="flex gap-4 my-8 h-14 justify-center">
  <a class="no-underline" href="/guides/getting-started/">
    <Button text="Get Started" />
  </a>
  <a class="no-underline" href="/guides/getting-started/">
    <ButtonAccent text="Learn more" />
  </a>
</div>
<div class="text-[1.2rem] text-center"><span class="font-[var(--font-heading)]">Numora</span>'s core logic is derived from audited, battle-tested implementations used in the following projects:</div>
<div class="flex justify-between">
<a href='https://uniswap.org/' target='_blank'><img src='uniswap.png' alt='Uniswap' class="w-[94px] transition-transform duration-200 hover:scale-105 cursor-pointer"/></a>
<a href='https://sushi.com/' target='_blank'><img src='sushiswap.png' alt='SushiSwap' class="w-[94px] transition-transform duration-200 hover:scale-105 cursor-pointer"/></a>
<a href='https://pancakeswap.finance/' target='_blank'><img src='pancakeswap.png' alt='PancakeSwap' class="w-[94px] transition-transform duration-200 hover:scale-105 cursor-pointer"/></a>
<a href='https://vortexfinance.co/' target='_blank'><img src='vortex.png' alt='Vortex' class="w-[94px] transition-transform duration-200 hover:scale-105 cursor-pointer"/></a>
<a href='https://portal.pendulumchain.org/' target='_blank'><img src='pendulum.png' alt='Pendulum' class="w-[94px] transition-transform duration-200 hover:scale-105 cursor-pointer"/></a>
</div>

<footer class="text-center mt-8">
    Made with <span class="">❤</span> by Kacper Szarkiewicz
</footer>
