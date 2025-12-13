<script>
  import numoraLogo from '../assets/numora_logo.svg';
  import Button from './Button.svelte';
  import ButtonAccent from './ButtonAccent.svelte';
  import StatsRow from './StatsRow.svelte';
  import { onDestroy, onMount } from 'svelte';

  const basePaths = [
    'M774.31521 561.73913L10.18092 561.73913L74.99639 449.61438L207.76972 373.0097L236.48085 295.7517L226.234 243.88625L317.26212 176.00478L237.09688 81.99377L301.51831 17.59344L774.31521 0.73952L774.31521 561.73913Z',
    'M775.80959 561.34012L10.36995 561.34012L75.45565 477.51152L324.71497 400.25352L205.22228 322.99452L405.79833 279.87418L320.05884 168.88888L476.41909 114.74418L260.641 22.41362L775.80959 0.34025L775.80959 561.34012Z'
  ];

  let paths = [...basePaths];
  let timer;

  const jitterPath = (d, amplitude = 0.15) =>
    d.replace(/-?\d+(\.\d+)?/g, (n) => {
      const v = parseFloat(n);
      return (v + (Math.random() - 0.5) * amplitude).toFixed(5);
    });

  const tick = () => {
    paths = basePaths.map((d) => jitterPath(d));
    timer = setTimeout(tick, 500);
  };

  onMount(() => {
    tick();
  });

  onDestroy(() => {
    if (timer) clearTimeout(timer);
  });
</script>


<div>
  <div class="hb-bg relative mx-auto aspect-[19/6] h-full max-h-[22.8125rem] w-full overflow-hidden">
    <div class="base pointer-events-none" data-state="inactive">
      <div class="mask"></div>
      <div class="layer-2">
        <div class="soft-linear-overlay"></div>
        <div class="soft-linear-overlay soft-linear-overlay-mirror"></div>
      </div>
      <svg>
        <title>Effects</title>
        <defs>
          <filter id="filter0" x="-67.383" y="0.617012" width="907.766" height="695.766" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"></feBlend>
            <feGaussianBlur stdDeviation="28.6915" result="effect1_foregroundBlur_4029_6538"></feGaussianBlur>
          </filter>
        </defs>
      </svg>
      <svg class="overlay" viewBox="0 0 773 562" fill="none" style="aspect-ratio: 773 / 562; min-width: 25%; height: var(--hb-bg-height);">
        <title>ZigZag</title>
        <g filter="url(#filter0)">
          <path d={paths[0]} fill="black"></path>
        </g>
      </svg>
      <svg class="overlay overlay-mirror" viewBox="0 0 773 562" fill="none" style="aspect-ratio: 773 / 562; min-width: 25%; height: var(--hb-bg-height);">
        <title>ZigZag</title>
        <g filter="url(#filter0)">
          <path d={paths[1]} fill="black"></path>
        </g>
      </svg>
    </div>
  </div>
</div>

<div class="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 py-12 sm:py-20 px-8">
  <!-- Left Column: Text -->
  <div class="flex-1 space-y-8 text-center lg:text-left">
    <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
      The Standard for <br/>
      <span class="text-[#5b2ff5]">DeFi Numeric Inputs.</span>
    </h1>
    <p class="text-lg text-gray-600 dark:text-[#a0a3c4] max-w-2xl mx-auto lg:mx-0">
      Stop reinventing the wheel. <span class="font-numora">Numora</span> is a lightweight, framework-agnostic library designed specifically for 18-decimal precision, currency formatting, and error-free financial inputs.
    </p>

    <StatsRow />

    <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
      <a href="/general/getting-started/" class="no-underline">
        <ButtonAccent text="Get Started" />
      </a>
      <a href="https://github.com/Sharqiewicz/numora" target="_blank" class="no-underline">
        <Button text="View on Github" icon="github" />
      </a>
    </div>
  </div>

  <!-- Right Column: Visual -->
  <div class="flex-1 w-full max-w-lg">
    <div class="drop-shadow-[0_0_15px_rgba(91,47,245,0.5)] relative z-10 bg-white dark:bg-[#181a1b] border border-gray-200 dark:border-[#23272b] rounded-2xl px-4 py-6 shadow-2xl transform rotate-2 transition-transform hover:rotate-0 duration-500">

        <!-- Floating Error Representation -->
        <div class="mb-6 p-4 bg-gray-50 dark:bg-[#000] rounded-lg border border-red-500/30 text-sm font-mono relative overflow-hidden group">
             <div class="text-gray-500 dark:text-gray-400 mb-1">// Standard Input</div>
             <div class="text-gray-900 dark:text-white">0.1 + 0.2 = <span class="text-red-500 dark:text-red-400">0.30000000000000004</span></div>

             <!-- Magnifying Glass Effect placeholder using SVG -->
             <div class="absolute top-1/2 right-4 -translate-y-1/2 opacity-50 group-hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500 dark:text-red-400"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             </div>
        </div>

        <!-- Numora Solution -->
        <div class="p-4 bg-gray-50 dark:bg-[#000] rounded-lg border border-[#5b2ff5]/30 text-sm font-mono">
            <div class="text-gray-500 dark:text-gray-400 mb-1">// <span class="font-numora">Numora</span> Input</div>
             <div class="text-gray-900 dark:text-white flex items-center gap-2">
                0.1 + 0.2 = <span class="text-[#5b2ff5]">0.3</span>
                <span class="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#5b2ff5]/20 dark:bg-[#5b2ff5]/80 text-[#5b2ff5] dark:text-white uppercase tracking-wider">BigInt Safe</span>
             </div>
        </div>

        <div class="mt-4 flex justify-center items-center gap-2">
            <span class="font-numora">numora</span>
        </div>
    </div>

    <!-- Background Glow -->
    <div class="absolute inset-0 bg-gradient-to-tr from-[#5b2ff5]/20 to-transparent rounded-full blur-3xl -z-10 transform translate-y-10"></div>
  </div>
</div>


<style>

  .mask{
    background-image: repeating-linear-gradient(transparent, transparent 1px, black 1px,black 12px);
    z-index: 20;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .base{
    width: 100%;
    height: 500px;
    position: relative;
    overflow: hidden;
  }

  .hb-bg .base:before {
    content: "";
    background: linear-gradient(#ffb83d 8%, #e7ff30 36%, #ff00d4 59%, #5126ff 80%, #00ff98);
    width: 50%;
    height: 100%;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
  }
  .hb-bg .base:after {
    content: "";
    background: linear-gradient(#00ff98 8%, #5126ff 36%, #ff00d4 59%, #e7ff30 80%, #ffb83d);
    width: 50%;
    height: 100%;
    display: block;
    position: absolute;
    top: 0;
    right: 0;
  }

  .hb-bg .overlay {
    z-index: 10;
    transform-origin: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 50%;
    transform: translate(2%) scale(1.2);
  }
  .hb-bg .overlay-mirror {
      transform: translate(-1%) scale(1.2) rotateY(180deg);
  }
</style>