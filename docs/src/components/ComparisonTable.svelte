<script>
    const features = [
        {
            name: 'Precision',
            standard: 'Unsafe. Browsers round after 16 digits.',
            numora: 'Exact. Handles 256-bit integers easily.'
        },
        {
            name: 'Formatting',
            standard: 'None. Cannot show 1,000 while typing.',
            numora: 'Real-time. Thousand separators as you type.'
        },
        {
            name: 'Locale',
            standard: 'Inconsistent. . vs , depends on browser OS.',
            numora: 'Deterministic. You control the separator.'
        },
        {
            name: 'Empty State',
            standard: 'Returns "" for invalid chars.',
            numora: 'Maintains last valid state or sanitizes.'
        }
    ];
</script>

<div class="py-16 px-4">
    <div class="flex flex-col lg:flex-row gap-12 items-start max-w-6xl mx-auto">

        <!-- Text Content -->
        <div class="flex-1">
            <h2 class="text-3xl font-bold text-white mb-6">Why not just use <span class="text-red-400 font-mono text-2xl bg-red-900/20 px-2 py-1 rounded"><input type="number"></span>?</h2>
            <p class="text-[#a0a3c4] text-lg mb-6">
                Native inputs are designed for e-commerce quantities, not financial protocols. Using standard inputs for DeFi introduces a class of bugs that are invisible until they drain a wallet or fail a transaction.
            </p>
            <p class="text-[#a0a3c4]">
                Numora treats numeric input as string-based state, ensuring that what the user sees is formatted for humans, but what your app sees is formatted for the EVM.
            </p>
        </div>

        <!-- Comparison Table -->
        <div class="flex-1 w-full">
            <div class="overflow-hidden rounded-xl border border-[#23272b] bg-[#181a1b]">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="border-b border-[#23272b] bg-[#23272b]/50">
                            <th class="p-4 text-sm font-medium text-gray-400">Feature</th>
                            <th class="p-4 text-sm font-medium text-red-400">Standard Input</th>
                            <th class="p-4 text-sm font-medium text-[#5b2ff5]">Numora Input</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-[#23272b]">
                        {#each features as feature}
                            <tr class="hover:bg-[#23272b]/30 transition-colors">
                                <td class="p-4 text-white font-medium">{feature.name}</td>
                                <td class="p-4 text-gray-400 text-sm">{feature.standard}</td>
                                <td class="p-4 text-white text-sm font-medium border-l border-[#23272b] bg-[#5b2ff5]/5">{feature.numora}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
