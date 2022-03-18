<script>
  import { getContext } from 'svelte';
  import { TABS }       from './Tabs.svelte';

  const tab = {};
  const { registerTab, selectTab, selectedTab } = getContext(TABS);

  registerTab(tab);
</script>

<button class='pb-0.5 w-full border-b-2' class:border-b-gray-600='{$selectedTab !== tab}' class:border-b-yellow-400='{$selectedTab === tab}' class:text-gray-600='{$selectedTab !== tab}' class:text-yellow-400='{$selectedTab === tab}' on:click='{() => selectTab(tab)}'>
  <slot />
</button>
