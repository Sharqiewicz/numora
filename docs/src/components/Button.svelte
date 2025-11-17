<script lang="ts">
  interface Props {
    text: string;
  }

  let { text }: Props = $props();
</script>

<button class="read-the-docs-button">
  {text}
</button>

<style>
  .read-the-docs-button {
    cursor: pointer;
    background-color: #000;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    transition: transform 0.2s;
    margin-top: 0 !important;
    border: none;
  }

  .read-the-docs-button:active{
    transform: scale(1.05);
  }
</style>