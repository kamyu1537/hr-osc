import { invoke } from '@tauri-apps/api';
import { IConfig } from './config';

const getAddr = (config: IConfig) => {
  let host = config.osc_client_host;
  if (new RegExp('(?:[0-9]{1,3}.){3}[0-9]{1,3}', 'g').test(host)) {
    host = '127.0.0.1';
  }

  return host + ':' + config.osc_client_port;
};

export const sendOscFloat = (config: IConfig, path: string, value: number) => {
  invoke('send_float', { addr: getAddr(config), path, value });
};

export const sendOscBool = (config: IConfig, path: string, value: boolean) => {
  invoke('send_bool', { addr: config.osc_client_host + ':' + config.osc_client_port, path, value });
};
