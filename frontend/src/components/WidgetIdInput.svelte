<script>
  let widgetId;

  async function save() {
    await window.go.main.App.SetWidgetId(widgetId);
    await window.go.main.App.SaveConfig();
  }
</script>

<div class="widget_id">
  <div>
    <h3 style="margin-top: 0">Your Stromno Widget ID</h3>
    <div>
      <input bind:value={widgetId} id="widget_id" placeholder="widget id" type="text">
      <div class="save_button" on:click={save}>Save</div>
    </div>
  </div>
</div>

<style>
  .widget_id {
    width: 100%;
    height: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
