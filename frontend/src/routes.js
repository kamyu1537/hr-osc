import Main     from './pages/Main.svelte';
import About    from './pages/About.svelte';
import Settings from './pages/Settings.svelte';
import WidgetId from './pages/WidgetId.svelte';

// const routes = [
//   { name: '/', component: Main },
//   { name: 'about', component: About },
//   { name: 'settings', component: Settings },
//   { name: 'widgetId', component: WidgetId },
// ];

const routes = {
  '/about': About,
  '/settings': Settings,
  '/widgetId': WidgetId,
  '*': Main,
};

export { routes };
