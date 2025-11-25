<script>
    import { onMount } from 'svelte';
    // Could add copy to clipboard logic here
    let copied = false;
    function copyCode() {
        navigator.clipboard.writeText(`import { useNumora } from 'numora/react';

const { props, value, error } = useNumora({
  decimals: 18,
  format: true,
  max: userBalance, // automatic clamping
  ticker: 'ETH'
});

return <input {...props} className="your-custom-styles" />;`);
        copied = true;
        setTimeout(() => copied = false, 2000);
    }
</script>

<div class="py-16 px-4">
    <div class="flex flex-col lg:flex-row gap-12 items-center max-w-6xl mx-auto">

        <!-- Text Content -->
        <div class="flex-1 lg:order-2">
            <h2 class="text-3xl font-bold text-white mb-6">Less Code. <span class="text-[#5b2ff5]">More Safety</span>.</h2>
            <p class="text-[#a0a3c4] text-lg mb-6">
                Replace 100 lines of regex and parseFloat with a single hook.
            </p>
            <p class="text-[#a0a3c4]">
                Numora abstracts the complexity of numeric handling so you can focus on your dApp's unique value.
            </p>
        </div>

        <!-- Code Block -->
        <div class="flex-1 w-full lg:order-1">
             <div class="relative bg-[#181a1b] border border-[#23272b] rounded-xl overflow-hidden shadow-2xl">
                <div class="flex items-center justify-between px-4 py-3 bg-[#23272b]/50 border-b border-[#23272b]">
                    <div class="flex gap-2">
                        <div class="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div class="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div class="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                    </div>
                    <div class="text-xs text-gray-500 font-mono">SwapComponent.tsx</div>
                    <button onclick={copyCode} class="text-xs text-gray-400 hover:text-white transition-colors">
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>

                <div class="p-6 overflow-x-auto">
                    <pre class="font-mono text-sm leading-relaxed">
<span class="text-gray-500 italic">// Before: The "Old Way" (Buggy & Verbose)</span>
<span class="text-gray-500 italic">// ... 50 lines of regex, generic onChange handlers,</span>
<span class="text-gray-500 italic">// ... manual BigNumber conversion, and useEffect hacks.</span>

<span class="text-gray-500 italic">// After: The Numora Way</span>
<span class="text-[#c678dd]">import</span> <span class="text-[#e5c07b]">{`{`}</span> <span class="text-[#e06c75]">useNumora</span> <span class="text-[#e5c07b]">{`}`}</span> <span class="text-[#c678dd]">from</span> <span class="text-[#98c379]">'numora/react'</span>;

<span class="text-[#c678dd]">const</span> <span class="text-[#e5c07b]">{`{`}</span> <span class="text-[#e06c75]">props</span>, <span class="text-[#e06c75]">value</span>, <span class="text-[#e06c75]">error</span> <span class="text-[#e5c07b]">{`}`}</span> = <span class="text-[#61afef]">useNumora</span>({`{`}
  <span class="text-[#d19a66]">decimals</span>: <span class="text-[#d19a66]">18</span>,
  <span class="text-[#d19a66]">format</span>: <span class="text-[#d19a66]">true</span>,
  <span class="text-[#d19a66]">max</span>: <span class="text-[#e06c75]">userBalance</span>, <span class="text-gray-500 italic">// automatic clamping</span>
  <span class="text-[#d19a66]">ticker</span>: <span class="text-[#98c379]">'ETH'</span>
{`}`});

<span class="text-[#c678dd]">return</span> &lt;<span class="text-[#e06c75]">input</span> <span class="text-[#e5c07b]">{`{`}</span>...<span class="text-[#e06c75]">props</span><span class="text-[#e5c07b]">{`}`}</span> <span class="text-[#d19a66]">className</span>=<span class="text-[#98c379]">"your-custom-styles"</span> />;</pre>
                </div>
             </div>
        </div>
    </div>
</div>
