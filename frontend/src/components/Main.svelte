<script>
  import SmallError from './SmallError.svelte';

  export let error = '';

  let connected = false;
  let heartRate = 0;

  window.go.main.App.GetConnected().then(value => connected = value);
  window.go.main.App.GetHeartRate().then(value => heartRate = value);

  window.runtime.EventsOn('onChangeConnected', (value) => {
    console.info('connected', value);
    connected = value;
  });

  window.runtime.EventsOn('onChangeHeartRate', (value) => {
    console.info('heartRate', value);
    heartRate = value;
  });
</script>

<div>
  <p>Connection Status: {connected ? 'Connected' : 'Disconnected'}</p>
  {#if connected}
    <p>Your HeartRate: {heartRate}</p>
  {/if}

  <!-- 에러가 있을 경우 -->
  {#if error !== ''}
    <SmallError>{error}</SmallError>
  {/if}
</div>
