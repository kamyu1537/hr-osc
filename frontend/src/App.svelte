<script>
  import TopMenu from './components/TopMenu.svelte';
  import Main from './components/Main.svelte';
  import Error from './components/Error.svelte';
  import WidgetIdInput from './components/WidgetIdInput.svelte';
  import Settings from './components/Settings.svelte';

  let settings = false;
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

  function updateWindowSize() {
    if (settings) {
      window.runtime.WindowSetMaxSize(300, 390);
      window.runtime.WindowSetSize(300, 390);
    } else {
      window.runtime.WindowSetMaxSize(300, 255);
      window.runtime.WindowSetSize(300, 255);
    }
  }

  function toggleSettings(value) {
    settings = value ?? !settings;
    updateWindowSize();
  }

  updateWindowSize();
</script>

<main>
  <TopMenu on:showSettings={toggleSettings} />

  <div data-wails-no-drag style="flex-grow: 1; padding-bottom: 32px">
    {#if !settings}
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
    {:else}
      <Settings on:onChangeConfig={() => toggleSettings(false)} />
    {/if}
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
  }
</style>
