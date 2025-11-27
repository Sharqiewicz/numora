<script>
    import Swap from './Swap.svelte';
</script>

<div class="py-16 relative overflow-hidden">
    <div class="text-center mb-12 max-w-3xl mx-auto">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Built for the <span class="text-[#5b2ff5]">Swap Interface</span>.</h2>
        <p class="text-gray-600 dark:text-[#a0a3c4] text-lg">
            Handling numeric state in DeFi is deceptively hard. You need to manage focus states, sanitize "bad" keystrokes, handle scientific notation, and respect user locale—all while keeping the underlying value pristine for the blockchain.
        </p>
        <p class="mt-4 text-sm text-gray-500">
            Try the input below. Type 1000, paste a messy number, or try to break the decimal precision.
        </p>
    </div>

    <div class="relative max-w-md mx-auto">
        <!-- Tooltip 1: Left side (Auto-formats) -->
        <div class="hidden md:block absolute -left-48 top-20 w-40 text-right animate-bounce" style="animation-duration: 3s;">
            <div class="absolute -right-6 top-1/5 w-5 h-[1px] bg-[#5b2ff5]"></div>
            <div class="text-[#5b2ff5] font-bold text-sm mb-1">Real-time Formatting</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Auto-formats with commas as you type.</div>
        </div>

        <!-- Tooltip 2: Right side (Decimals) -->
        <div class="hidden md:block absolute -right-48 top-32 w-40 text-left animate-bounce" style="animation-duration: 4s;">
             <div class="absolute -left-6 top-1/5 w-5 h-[1px] bg-[#5b2ff5]"></div>
            <div class="text-[#5b2ff5] font-bold text-sm mb-1">Precision Control</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Prevents >18 decimals automatically.</div>
        </div>

        <!-- Tooltip 3: Bottom (Paste) -->
         <div class="hidden md:block absolute -right-52 bottom-20 w-40 text-left animate-bounce" style="animation-duration: 5s;">
             <div class="absolute -left-10 top-1/5 w-8 h-[1px] bg-[#5b2ff5]"></div>
            <div class="text-[#5b2ff5] font-bold text-sm mb-1">Sanitization</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Pastes are sanitized instantly.</div>
        </div>

        <!-- The Swap Component -->
        <div class="relative z-10 transform transition-transform hover:scale-[1.01]">
            <Swap client:load/>
        </div>

        <!-- Glow behind -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#5b2ff5]/10 dark:bg-[#5b2ff5]/5 blur-3xl -z-0 rounded-full"></div>
    </div>
</div>
