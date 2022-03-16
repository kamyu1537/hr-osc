<script>

  export let error = '';

  let connected = false;
  let heartRate = 0;
  let heartRatePercent = 0;

  window.go.main.App.GetConnected().then(value => connected = value);
  window.go.main.App.GetHeartRate().then(value => heartRate = value);
  window.go.main.App.GetHeartRatePercent().then(value => heartRatePercent = Math.floor(value * 100) * 0.01);

  window.runtime.EventsOn('onChangeConnected', (value) => {
    console.info('connected', value);
    connected = value;
  });

  window.runtime.EventsOn('onChangeHeartRate', (value) => {
    console.info('heartRate', value);
    heartRate = value;
  });

  window.runtime.EventsOn('onChangeHeartRatePercent', (value) => {
    console.info('heartRatePercent', value);
    heartRatePercent = Math.floor(value * 100) * 0.01;
  });
</script>

<div>
  <div>
    <h3 style="margin-top: 10px">Connection Status</h3>
    <div class={connected ? 'connected' : 'disconnected'}>
      {connected ? 'Connected' : 'Disconnected'}
    </div>
  </div>

  <div>
    <h3>Heart Rate</h3>
    <div>
      {heartRate} bpm
      <span style="color: gray; font-size: small">({heartRatePercent})</span>
    </div>
  </div>

  <div class={error ? 'disconnected' : ''}>
    <h3>Last Error</h3>
    <div style="font-size: small">{error || 'No error.'}</div>
  </div>
</div>

<style>

  h3 {
    margin-bottom: 0;
  }

  .connected {
    color: #489348;
  }

  .disconnected {
    color: #da504c;
  }
</style>
