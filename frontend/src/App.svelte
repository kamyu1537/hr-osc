<script>
  import Main          from './components/Main.svelte';
  import Error         from './components/Error.svelte';
  import WidgetIdInput from './components/WidgetIdInput.svelte';

  let loading = true;
  let error = '';

  window.go.main.App.GetLoading().then(value => loading = value);
  window.go.main.App.GetDisplayError().then(value => error = value);

  window.runtime.EventsOn('onChangeLoading', value => {
    console.info('loading', value);
    loading = value;
  });
  window.runtime.EventsOn('onChangeDisplayError', value => {
    console.info('error', value);
    error = value;
  });
</script>

<main>
  <h1>hr-osc</h1>

  <div data-wails-no-drag>
    {#if !loading}
      <Main error={error} />
    {:else}
      {#if error === 'widget_id'}
        <WidgetIdInput />
      {:else if error !== ''}
        <Error>{error}</Error>
      {:else}
        <p>Loading...</p>
      {/if}
    {/if}
  </div>
</main>

<style>
  main {
    height: 100%;
    width: 100%;
  }
</style>
