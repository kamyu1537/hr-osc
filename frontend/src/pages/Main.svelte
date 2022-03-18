<script>
  import IoMdHeart                                            from 'svelte-icons/io/IoMdHeart.svelte';
  import { configStore, receiveDataStore, websocketUrlStore } from '../utils/stores.js';
  import { push }                                             from 'svelte-spa-router';

  let config;
  configStore.subscribe(data => {
    config = data;
  });

  websocketUrlStore.subscribe(value => {
    if (value) return;
    push('/widgetId');
  });

  let connected;
  let heartRate;
  receiveDataStore.subscribe(value => {
    connected = value.connected;
    heartRate = value.heartRate;
  });
</script>

<div class='w-full h-full flex items-center justify-center'>
  <div class='pb-16'>
    <div class='flex items-center justify-center'>
      <div class={`w-10 h-10 mb-2 relative ${connected ? 'text-red-400' : 'text-gray-500'}`}>
        {#if connected}
          <div class='absolute animate-ping'>
            <IoMdHeart />
          </div>
        {/if}
        <IoMdHeart />
      </div>
    </div>

    <div class='text-xl text-center'>
      {heartRate} <span class='text-base'>bpm</span>
      <div class='text-sm text-gray-600'>({(heartRate / config.max_heart_rate).toFixed(2)})</div>
    </div>
  </div>

  <div class='absolute bottom-4 text-center text-sm'>
    Connection Status
    <div class={`text-xs ${connected ? 'text-lime-500' : 'text-gray-600'}`}>
      {connected ? 'Connected' : 'Disconnected'}
    </div>
  </div>
</div>
