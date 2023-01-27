import { invoke } from '@tauri-apps/api';
import { IConfig } from './config';

export const startHttpServer = (config: IConfig) => {
  invoke('start_http_server', { port: config.http_server_port });
};
