import { invoke } from '@tauri-apps/api';
import { IConfig } from './config';

export const startHttpServer = (config: IConfig) => {
  invoke('start_http_server', { port: config.http_server_port });
};

export const getHttpHeartRate = async () => {
  return (await invoke('get_http_heartrate')) as number;
};

export const getHttpHeartRateUpdateTime = async () => {
  return (await invoke('get_http_update_time')) as number;
};
