<script>
  import numoraLogo from '../assets/numora_logo.svg';
  import Button from './Button.svelte';
  import ButtonAccent from './ButtonAccent.svelte';
</script>

<div class="flex flex-col lg:flex-row items-center justify-between gap-12 py-12 sm:py-20">
  <!-- Left Column: Text -->
  <div class="flex-1 space-y-8 text-center lg:text-left">
    <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
      The Standard for <br/>
      <span class="text-[#5b2ff5] font-[var(--font-heading)]">DeFi Numeric Inputs.</span>
    </h1>
    <p class="text-lg text-gray-600 dark:text-[#a0a3c4] max-w-2xl mx-auto lg:mx-0">
      Stop reinventing the wheel. Numora is a lightweight, framework-agnostic library designed specifically for 18-decimal precision, currency formatting, and error-free financial inputs.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
      <a href="/guides/getting-started/" class="no-underline">
        <ButtonAccent text="Get Started" />
      </a>
      <a href="https://github.com/Sharqiewicz/numora" target="_blank" class="no-underline">
        <Button text="View on Github" />
      </a>
    </div>
  </div>

  <!-- Right Column: Visual -->
  <div class="flex-1 w-full max-w-lg lg:max-w-xl relative">
    <div class="relative z-10 bg-white dark:bg-[#181a1b] border border-gray-200 dark:border-[#23272b] rounded-2xl p-8 shadow-2xl transform rotate-2 transition-transform hover:rotate-0 duration-500">
        <div class="absolute -top-6 -left-6 w-20 h-20 bg-[#5b2ff5] rounded-full blur-3xl opacity-20"></div>

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
            <div class="text-gray-500 dark:text-gray-400 mb-1">// Numora Input</div>
             <div class="text-gray-900 dark:text-white flex items-center gap-2">
                0.1 + 0.2 = <span class="text-[#5b2ff5]">0.3</span>
                <span class="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-[#5b2ff5]/10 dark:bg-[#5b2ff5]/20 text-[#5b2ff5] uppercase tracking-wider">BigInt Safe</span>
             </div>
        </div>

        <div class="mt-8 flex justify-center">
            <img src={numoraLogo.src} alt="Numora Logo" class="h-16 drop-shadow-[0_0_15px_rgba(91,47,245,0.5)] animate-pulse" />
        </div>
    </div>

    <!-- Background Glow -->
    <div class="absolute inset-0 bg-gradient-to-tr from-[#5b2ff5]/20 to-transparent rounded-full blur-3xl -z-10 transform translate-y-10"></div>
  </div>
</div>
