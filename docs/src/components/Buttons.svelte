<script lang="ts">
    import Button from './Button.svelte';
    import ButtonAccent from './ButtonAccent.svelte';
</script>

<div class="buttons-container">
  <a class="buttons-link" href="/guides/getting-started/">
    <Button text="Get Started" />
  </a>
  <a class="buttons-link" href="/guides/getting-started/">
    <ButtonAccent text="Learn more" />
  </a>
</div>
<div class="audited-projects"><span class="righteous-font">Numora</span>'s core logic is derived from audited, battle-tested implementations used in the following projects:</div>
<div class="audited-project-images">
<a href='https://uniswap.org/' target='_blank'><img src='uniswap.png' alt='Uniswap' class="audited-project-image"/></a>
<a href='https://sushi.com/' target='_blank'><img src='sushiswap.png' alt='SushiSwap' class="audited-project-image"/></a>
<a href='https://pancakeswap.finance/' target='_blank'><img src='pancakeswap.png' alt='PancakeSwap' class="audited-project-image"/></a>
<a href='https://vortexfinance.co/' target='_blank'><img src='vortex.png' alt='Vortex' class="audited-project-image"/></a>
<a href='https://portal.pendulumchain.org/' target='_blank'><img src='pendulum.png' alt='Pendulum' class="audited-project-image"/></a>
</div>

<footer class="footer">
    Made with <span class="">❤</span> by Kacper Szarkiewicz
</footer>

<style>

    .footer{
        text-align: center;
        margin-top: 2rem;
    }
  .github-button-star {
    position: absolute;
    right: 14px;
    top: -15px;
  }

  .github-button-container {
    width: 150px;
    height: 50px;
    margin: 2rem auto;
    position: relative;
    display: flex;
    justify-content: center;
  }

  .audited-project-images {
    display: flex;
    justify-content: space-between;
  }

  .audited-projects {
    font-size: 1.2rem;
    text-align: center;
  }
  .audited-project-image {
    width: 94px;
    transition: transform 0.2s;
  }
  .audited-project-image:hover {
    transform: scale(1.05);
    cursor: pointer;
  }

  .buttons-container {
    display: flex;
    gap: 1rem;
    margin: 2rem 0;
    height: 3.5rem;
    justify-content: center;
  }

  .buttons-link {
    text-decoration: none;
  }
</style>