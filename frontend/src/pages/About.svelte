<script>
  const version = __APP_VERSION__;
</script>

<div class='flex items-center h-full justify-center'>
  <div>
    <div class='mb-6'>
      <h1 class='text-3xl'>hr-osc</h1>
      <p>version: {version}</p>
      <a class='underline text-sky-200 cursor-pointer text-xs' href={'#/about'} on:click={() => window.runtime.BrowserOpenURL('https://github.com/kamyu1537/hr-osc.git')}>
        Github
      </a>
    </div>

    <div class='text-sm underline text-sky-200 cursor-pointer flex flex-col'>
      <a href={'#/about'} on:click={() => window.runtime.BrowserOpenURL('https://twitter.com/kamyu1537')}>
        kamyu_ (@kamyu1537)
      </a>
      <a href={'#/about'} on:click={() => window.runtime.BrowserOpenURL('https://twitter.com/selees824')}>
        Ein (@selees824)
      </a>
    </div>
  </div>
</div>
