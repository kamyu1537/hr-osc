<script>
  import { push } from 'svelte-spa-router';

  import Tabs            from '../components/tabs/Tabs.svelte';
  import TabList         from '../components/tabs/TabList.svelte';
  import Tab             from '../components/tabs/Tab.svelte';
  import TabPanel        from '../components/tabs/Tabpanel.svelte';
  import { configStore } from '../utils/stores.js';

  let config;

  let widgetId;
  let timeout;
  let host;
  let port;
  let connectedPath;
  let percentPath;
  let heartRate;

  let loading = false;

  configStore.subscribe(value => {
    config = value;

    widgetId = config.widget_id;
    timeout = config.timeout;
    host = config.osc_client_host;
    port = config.osc_client_port;
    connectedPath = config.osc_path_connected;
    percentPath = config.osc_path_percent;
    heartRate = config.max_heart_rate;
  });

  const save = async () => {
    if (loading) return;

    loading = true;
    try {
      await window.go.main.App.UpdateConfig(JSON.stringify({
        widget_id: widgetId,
        timeout: timeout,
        osc_client_host: host,
        osc_client_port: port,
        osc_path_connected: connectedPath,
        osc_path_percent: percentPath,
        max_heart_rate: heartRate,
      }));
      await window.go.main.App.SaveConfig();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
      push('/').then();
    }
  };
</script>

<div class='relative pb-10 min-h-full'>
  <Tabs>
    <TabList>
      <Tab>Stromno</Tab>
      <Tab>OSC</Tab>
      <Tab>Parameters</Tab>
    </TabList>

    <TabPanel>
      <div class='block'>Stomno widget id</div>
      <input bind:value={widgetId} class='select-text block text-gray-400 text-xs w-full outline-none bg-gray-500 bg-opacity-10 active:bg-opacity-20 text-gray-600 rounded-sm p-0.5' placeholder='{config.widget_id}' />

      <div class='block mt-2'>Timeout</div>
      <input bind:value={timeout} class='select-text block text-gray-400 text-xs w-full outline-none bg-gray-500 bg-opacity-10 active:bg-opacity-20 text-gray-600 rounded-sm p-0.5' placeholder='{config.timeout}' type='number' />
    </TabPanel>

    <TabPanel>
      <div class='block'>VRChat OSC Host</div>
      <input bind:value={host} class='select-text block text-gray-400 text-xs w-full outline-none bg-gray-500 bg-opacity-10 active:bg-opacity-20 text-gray-600 rounded-sm p-0.5' placeholder='{config.osc_client_host}' />

      <div class='block mt-2'>VRChat OSC Port</div>
      <input bind:value={port} class='select-text block text-gray-400 text-xs w-full outline-none bg-gray-500 bg-opacity-10 active:bg-opacity-20 text-gray-600 rounded-sm p-0.5' placeholder='{config.osc_client_port}' type='number' />
    </TabPanel>

    <TabPanel>
      <div class='block'>Connected Parameter Path</div>
      <input bind:value={connectedPath} class='select-text block text-gray-400 text-xs w-full outline-none bg-gray-500 bg-opacity-10 active:bg-opacity-20 text-gray-600 rounded-sm p-0.5' placeholder='{config.osc_path_connected}' />

      <div class='block mt-2'>HR Percent Parameter Path</div>
      <input bind:value={percentPath} class='select-text block text-gray-400 text-xs w-full outline-none bg-gray-500 bg-opacity-10 active:bg-opacity-20 text-gray-600 rounded-sm p-0.5' placeholder='{config.osc_path_percent}' />

      <div class='block mt-2'>Max Heart Rate</div>
      <input bind:value={heartRate} class='select-text block text-gray-400 text-xs w-full outline-none bg-gray-500 bg-opacity-10 active:bg-opacity-20 text-gray-600 rounded-sm p-0.5' placeholder='{config.max_heart_rate}' type='number' />
    </TabPanel>
  </Tabs>

  <div class='absolute left-0 right-0 bottom-0 h-10'>
    <button class='w-full h-full text-white hover:bg-opacity-50 bg-opacity-30 bg-lime-800 transition-colors' on:click={save}>
      Save
    </button>
  </div>
</div>
