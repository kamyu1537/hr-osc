import { invoke } from '@tauri-apps/api/core';
import { IConfig } from './config';

export const getAddr = (config: IConfig) => {
  const host = config.osc_client_host;
  return `${host.includes(':') ? `[${host}]` : host}:${config.osc_client_port}`;
};

export const sendOscFloat = (config: IConfig, path: string, value: number) => {
  invoke('send_float', { host: config.osc_client_host, port: config.osc_client_port, path, value });
};

export const sendOscBool = (config: IConfig, path: string, value: boolean) => {
  invoke('send_bool', { host: config.osc_client_host, port: config.osc_client_port, path, value });
};
