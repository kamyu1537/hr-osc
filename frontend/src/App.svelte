<script>
    // let name = "";
    // let greeting = "";

    // function greet() {
    // 	window.go.main.App.Greet(name).then((result) => {
    // 		greeting = result;
    // 	});
    // }

    let widgetId = "";

    let loading = true
    let error = '';
    let connected = false;
    let heartRate = -1;

    async function update() {
        heartRate = await window.go.main.App.CurrentHeartRate();
        connected = await window.go.main.App.WebSocketConnectionStatus();
        error = await window.go.main.App.GetError();
        loading = await window.go.main.App.IsLoading();
    }

    function setWidgetId() {
        window.go.main.App.SetWidgetId(widgetId).then(update)
    }

    setInterval(async () => {
        await update();
    }, 1000);
    update();
</script>

<main data-wails-no-drag>
  <h1>hr-osc</h1>

  {#if !loading}
    <p>Connection Status: {connected ? 'Connected' : 'Disconnected'}</p>
    {#if connected}
      <p>Your HeartRate: {heartRate}</p>
    {/if}
    {#if error !== ''}
      <div style="font-size: small">
        <div style="font-weight: bold">Error!</div>
        {error}
      </div>
    {/if}
  {:else}
    {#if error === 'widget_id'}
      <h3>Your Stromno Widget ID</h3>
      <div>
        <input id="widget_id" type="text" bind:value={widgetId} placeholder="widget id">
        <button on:click={setWidgetId}>change</button>
      </div>
    {:else if error !== ''}
      <h3>Error!</h3>
      <p>{error}</p>
    {:else}
      <p>Loading...</p>
    {/if}
  {/if}
  <!--	<div id="input" data-wails-no-drag>-->
  <!--		<input id="name" type="text" bind:value={name}>-->
  <!--		<button class="button" on:click={greet}>Greet</button>-->
  <!--	</div>-->
  <!--	{#if greeting}-->
  <!--		<div id="result">{greeting}</div>-->
  <!--	{/if}-->
</main>

<style>
  main {
    height: 100%;
    width: 100%;
  }
</style>
