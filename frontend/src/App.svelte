<script>
  import Router    from 'svelte-spa-router';
  import Loading   from './components/Loading.svelte';
  import TopHeader from './components/TopHeader.svelte';
  import WS        from './components/WS.svelte';
  import Update    from './components/Update.svelte';

  import { loadingStore, updateStore } from './utils/stores';
  import { routes }                    from './routes.js';

  let loading = true;
  let update;
  loadingStore.subscribe(value => loading = value);
  updateStore.subscribe(value => update = value);
</script>

<main>
  <TopHeader />
  <Update />

  {#if loading || update.loading || !update.checked}
    <Loading />
  {:else if !update.found}
    <WS />
    <div class='pt-9 h-screen'>
      <Router {routes} />
    </div>
  {/if}
</main>

<style>
  main {
    width: 100vw;
    height: 100vh;
  }
</style>
