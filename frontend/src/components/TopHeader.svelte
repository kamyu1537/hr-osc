<script>
  import { link, location } from 'svelte-spa-router';

  import IoIosClose             from 'svelte-icons/io/IoIosClose.svelte';
  import IoIosHome              from 'svelte-icons/io/IoIosHome.svelte';
  import IoIosInformationCircle from 'svelte-icons/io/IoIosInformationCircle.svelte';
  import IoIosSettings          from 'svelte-icons/io/IoIosSettings.svelte';

  let os = '';
  window.go.main.App.GetOS().then(result => os = result);
</script>

<div class='fixed top-0 left-0 right-0 h-9 z-10' data-wails-drag>
  <div class='w-full h-full px-2 flex items-center justify-between z-0'>
    <div class='px-1'>
      {#if os !== 'darwin'}
        hr-osc
      {/if}
    </div>


    <div class='flex gap-1 items-center h-full'>
      {#if $location !== '/about'}
        <a
          class='rounded-full overflow-hidden hover:text-gray-800 hover:bg-white w-6 h-6 flex items-center justify-center transition-colors'
          data-wails-no-drag href='/about' use:link>
          <div class='w-4 h-4'>
            <IoIosInformationCircle />
          </div>
        </a>
      {:else}
        <a
          class='rounded-full overflow-hidden hover:text-gray-800 hover:bg-white w-6 h-6 flex items-center justify-center transition-colors'
          data-wails-no-drag href='/' use:link>
          <div class='w-4 h-4'>
            <IoIosHome />
          </div>
        </a>
      {/if}

      {#if $location !== '/settings'}
        <a
          class='rounded-full overflow-hidden hover:text-gray-800 hover:bg-white w-6 h-6 flex items-center justify-center transition-colors'
          data-wails-no-drag href='/settings' use:link>
          <div class='w-4 h-4'>
            <IoIosSettings />
          </div>
        </a>
      {:else}
        <a
          class='rounded-full overflow-hidden hover:text-gray-800 hover:bg-white w-6 h-6 flex items-center justify-center transition-colors'
          data-wails-no-drag href='/' use:link>
          <div class='w-4 h-4'>
            <IoIosHome />
          </div>
        </a>
      {/if}

      {#if os !== 'darwin'}
        <div
          class='rounded-full overflow-hidden hover:text-gray-800 hover:bg-rose-500 w-6 h-6 flex items-center justify-center transition-colors cursor-pointer'
          data-wails-no-drag on:click={() => window.runtime.Quit()}>
          <div class='w-6 h-6'>
            <IoIosClose />
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
