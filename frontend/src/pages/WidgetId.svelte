<script>
  import { websocketUrlStore } from '../utils/stores.js';
  import { push }              from 'svelte-spa-router';

  let widgetId = '';
  let disabled = false;

  const save = async () => {
    if (disabled) return;

    disabled = true;
    try {
      const wsUrl = await window.go.main.App.UpdateConfig(JSON.stringify({ widget_id: widgetId }));
      websocketUrlStore.set(wsUrl);
      if (wsUrl !== '') push('/').then();
    } finally {
      disabled = false;
    }
  };

  const openWebsite = () => {
    window.runtime.BrowserOpenURL('https://app.stromno.com/dashboard');
  };
</script>

<div class='mt-10'>
  <h2 class='text-lg font-bold'>Input Your WidgetId</h2>
  <a class='text-purple-300 cursor-pointer hover:underline' href={'#'} on:click={openWebsite}>Stromno Dashboard</a>

  <input bind:value={widgetId} class='mt-6 cursor-text' placeholder='Stromno Widget ID' />
  <button class='mt-5 save_button' on:click={save}>Save</button>
</div>
