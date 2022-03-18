<script>
  import semver          from 'semver';
  import produce         from 'immer';
  import { updateStore } from '../utils/stores.js';

  let update;
  let version = __APP_VERSION__;

  const later = async () => {
    updateStore.set(produce(update, (draft) => {
      draft.found = false;
    }));
  };

  const download = async () => {
    window.runtime.BrowserOpenURL('https://github.com/kamyu1537/hr-osc/releases/latest');
  };

  const check = async (storeValue) => {
    if (storeValue.loading) return;
    updateStore.set(produce(storeValue, (draft) => {
      draft.loading = true;
    }));

    try {
      const resp = await fetch('https://api.github.com/repos/kamyu1537/hr-osc/releases/latest');
      const release = await resp.json();

      let releaseVersion = release.tag_name;
      if (releaseVersion.split('.').length !== 3) {
        releaseVersion = releaseVersion + '.0';
      }
      if (semver.gt(releaseVersion, __APP_VERSION__)) {
        console.info('found new version!');
        updateStore.set(produce(storeValue, (draft) => {
          draft.loading = false;
          draft.checked = true;
          draft.found = true;
          draft.version = release.tag_name;
        }));
      } else {
        console.info('latest version!');
        updateStore.set(produce(storeValue, (draft) => {
          draft.loading = false;
          draft.checked = true;
          draft.found = false;
        }));
      }
    } catch (e) {
      console.error(e);
      updateStore.set(produce(storeValue, (draft) => {
        draft.loading = false;
        draft.checked = true;
      }));
    }
  };

  updateStore.subscribe(value => {
    update = value;
    if (!value.checked) {
      check(value).then();
    }
  });
</script>

{#if update.found}
  <div class='flex items-center justify-center h-screen pt-9'>
    <div>
      <h2 class='font-bold text-2xl mb-3'>Update available!</h2>
      <p class='text-sm'>
        <span class='block text-rose-500'>Current version: {version}</span>
        <span class='block text-lime-500'>New version: {update.version}</span>
      </p>

      <div class='mt-4 flex flex-row gap-1'>
        <button on:click={download} class='hover:bg-opacity-50 bg-opacity-30 bg-lime-800 w-full p-1.5 transition-colors rounded-lg'>
          Download
        </button>
        <button on:click={later} class='hover:bg-opacity-50 bg-opacity-30 bg-rose-800 py-1.5 px-4 transition-colors rounded-lg'>
          Later
        </button>
      </div>
    </div>
  </div>
{/if}
