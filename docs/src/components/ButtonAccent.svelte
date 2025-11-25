

<script lang="ts">
interface Props {
    text: string;
}

let { text }: Props = $props();
</script>

<button class="cursor-pointer bg-[#5b2ff5] text-white px-5 py-2.5 rounded transition-transform duration-200 border-none !mt-0 active:scale-105">
{text}
</button>
