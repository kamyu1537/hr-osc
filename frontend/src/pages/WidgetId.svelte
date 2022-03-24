<script>
  import { websocketUrlStore } from '../utils/stores.js';
  import { push }              from 'svelte-spa-router';

  let widgetId = '';
  let disabled = false;

  const save = async () => {
    if (disabled) return;

    disabled = true;
    try {
      const websocketUrl = await window.go.main.App.UpdateConfig(JSON.stringify({ widget_id: widgetId }));
      await window.go.main.App.SaveConfig();
      websocketUrlStore.set(websocketUrl);
      if (websocketUrl !== '') push('/').then();
    } finally {
      disabled = false;
    }
  };

  const openWebsite = () => {
    window.runtime.BrowserOpenURL('https://app.stromno.com/dashboard');
  };
</script>

<div class="text-center px-2 h-full pb-10 relative">
  <h2 class='text-xl font-bold pt-6'>Your Stromno Widget ID</h2>
  <a class='text-yellow-400 cursor-pointer hover:underline' href={'#'} on:click={openWebsite}>Stromno Dashboard</a>

  <input bind:value={widgetId} class='mt-6 cursor-text p-2 bg-gray-500 bg-opacity-10 rounded-md outline-none text-sm w-full' placeholder='input-your-stromno-widgetid' />
  <button class='bg-lime-800 text-white bg-opacity-20 hover:bg-opacity-30 rounded-md p-2 absolute bottom-2 left-2 right-2' on:click={save}>Save</button>
</div>
