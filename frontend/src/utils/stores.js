import { writable } from 'svelte/store';
import { push }     from 'svelte-spa-router';

export const updateStore = writable({ loading: false, checked: false, found: false, version: '' });
export const configStore = writable({
  osc_client_host: '127.0.0.1',
  osc_client_port: 9000,
  osc_path_connected: '/avatar/parameters/hr_connected',
  osc_path_percent: '/avatar/parameters/hr_percent',
  widget_id: '',
  max_heart_rate: 200,
  timeout: 10,
});
export const loadingStore = writable(true);
export const websocketUrlStore = writable('');
export const receiveDataStore = writable({ connected: false, heartRate: 0 });

window.go.main.App.GetConfig().then(value => {
  configStore.set({
    osc_client_host: value.osc_client_host,
    osc_client_port: value.osc_client_port,
    osc_path_connected: value.osc_path_connected,
    osc_path_percent: value.osc_path_percent,
    widget_id: value.widget_id,
    max_heart_rate: value.max_heart_rate,
    timeout: value.timeout,
  });
});
configStore.subscribe(() => {
  window.go.main.App.GetWebSocketUrl().then(result => {
    loadingStore.set(false);
    websocketUrlStore.set(result);
    if (result === '') {
      push('/widgetId').then();
    }
  });
});
