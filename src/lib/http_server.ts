import { invoke } from '@tauri-apps/api';

export const startHttpServer = () => {
  invoke('start_http_server', { port: 8080 });
};
