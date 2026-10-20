import { invoke } from '@tauri-apps/api/core';
import { IConfig } from './config';

export const startHttpServer = (config: IConfig) => {
  return invoke('start_http_server', { port: config.http_server_port, lan: config.http_server_lan });
};

export const stopHttpServer = () => {
  invoke('stop_http_server');
};

export const getHttpHeartRate = () => invoke<number>('get_http_heartrate');

export const getHttpHeartRateUpdateTime = () => invoke<number>('get_http_update_time');
