

<script lang="ts">

  interface Props {
    text: string;
    icon?: string;
  }

  let { text }: Props = $props();
</script>

<button class="font-semibold cursor-pointer bg-white text-black px-5 py-2.5 rounded transition-transform duration-200 !mt-0 border-none active:scale-105 hover:opacity-80 data-[theme=light]:bg-black data-[theme=light]:text-white dark:bg-white dark:text-black">
  {text}
</button>
