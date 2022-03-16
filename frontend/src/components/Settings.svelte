<script>
  import {createEventDispatcher} from 'svelte';

  let config = {};

  let widgetId = '';
  let maxHeartRate = 0;
  let connectedName = '';
  let percentName = '';

  window.go.main.App.GetConfig().then(value => {
    widgetId = value.widget_id;
    maxHeartRate = value.max_heart_rate;
    connectedName = value.osc_path_connected;
    percentName = value.osc_path_percent;

    config = value;
  });

  window.runtime.EventsOn('onChangeConfig', value => {
    widgetId = value.widget_id;
    maxHeartRate = value.max_heart_rate;
    connectedName = value.osc_path_connected;
    percentName = value.osc_path_percent;

    config = value;
  });

  const dispatch = createEventDispatcher();

  async function save() {
    let promises = [];
    if (widgetId !== config.widget_id)
      promises.push(window.go.main.App.SetWidgetId(widgetId));
    if (maxHeartRate !== config.max_heart_rate)
      promises.push(window.go.main.App.SetMaxHeartRate(widgetId));
    if (connectedName !== config.osc_path_connected)
      promises.push(window.go.main.App.SetConnectedParameterName(widgetId));
    if (percentName !== config.osc_path_percent)
      promises.push(window.go.main.App.SetPercentParameterName(widgetId));

    if (promises.length > 0) {
      await Promise.all(promises);
      await window.go.main.App.SaveConfig();
      dispatch('onChangeConfig');
    }
  }
</script>

<div class="settings">
  <h4 style="margin-top: 10px">Widget Id</h4>
  <input bind:value={widgetId} placeholder="widget id" />

  <h4>Max Heart Rate</h4>
  <input bind:value={maxHeartRate} min="0" placeholder="max heart rate (default: 200)" type="number" />

  <h4>Connected Parameter Name</h4>
  <input bind:value={connectedName} placeholder="/avatar/parameters/hr_connected" />

  <h4>Percent Parameter Name</h4>
  <input bind:value={percentName} placeholder="/avatar/parameters/hr_percent" />

  <div class="save_button" on:click={save}>Save</div>
</div>

<style>
  div.settings {
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  div.settings * {
    box-sizing: border-box;
    margin-top: 5px;
    margin-bottom: 0;
  }

  div.settings > h4 {
    margin-top: 1.5rem;
  }
</style>
