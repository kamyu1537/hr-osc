<script>
  let widgetId;

  function setWidgetId() {
    window.go.main.App.SetWidgetId(widgetId).then();
  }
</script>

<div>
  <h3>Your Stromno Widget ID</h3>
  <div>
    <input bind:value={widgetId} id="widget_id" placeholder="widget id" type="text">
    <button on:click={setWidgetId}>change</button>
  </div>
</div>
