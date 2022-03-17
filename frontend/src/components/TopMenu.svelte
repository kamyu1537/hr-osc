<script>
  import {createEventDispatcher} from 'svelte';
  import IoIosSettings from 'svelte-icons/io/IoIosSettings.svelte';
  import IoIosClose from 'svelte-icons/io/IoIosClose.svelte';

  let os = '';
  window.go.main.App.GetOS().then(value => os = value);

  const dispatch = createEventDispatcher();

  function clickSettings() {
    dispatch('showSettings');
  }

  function quit() {
    window.runtime.Quit();
  }
</script>

<div class="top_menu" data-wails-drag>
  <div class="title">
    {#if os !== 'darwin'}
      hr-osc
    {/if}
  </div>


  <div class="buttons">
    <div data-wails-no-drag on:click={clickSettings}>
      <div class="config_button">
        <IoIosSettings />
      </div>
    </div>

    {#if os !== 'darwin'}
      <div data-wails-no-drag on:click={quit}>
        <IoIosClose />
      </div>
    {/if}
  </div>
</div>

<style>
  .top_menu {
    display: flex;
    width: 100%;
    box-sizing: border-box;

    margin: 0;
    padding: 7px;

    align-items: center;
    justify-content: space-between;
    cursor: default;
  }

  .top_menu > .title {
    flex-shrink: 0;
    padding-left: 7px;
  }

  .top_menu > .buttons {
    display: flex;
    width: 100%;
    box-sizing: border-box;

    margin: 0;
    padding: 0;

    align-items: center;
    justify-content: flex-end;

    cursor: all-scroll;
  }

  .top_menu > .buttons > div {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    margin: 0;
    padding: 0;
    border: 0;

    width: 24px;
    height: 24px;

    border-radius: 3px;
    text-decoration: none;
    cursor: pointer;
  }

  .top_menu > .buttons > div:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .config_button {
    padding-bottom: 2px;
    width: 15px !important;
    height: 15px !important;
  }
</style>
