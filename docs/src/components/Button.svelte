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
   background: #fff;
    color: #000;
    padding: 10px 20px;
    border-radius: 5px;
    transition: transform 0.2s;
    margin-top: 0 !important;
    border: none;
  }

  .read-the-docs-button:active{
    transform: scale(1.05);
  }

  .read-the-docs-button:hover{
    opacity: 0.8;
  }

  :global(html[data-theme="light"]) .read-the-docs-button,
  :global(html:not([data-theme="dark"])) .read-the-docs-button{
    background-color: #000;
    color: #fff;
  }

</style>