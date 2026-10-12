import { invoke } from '@tauri-apps/api/core';
import { IConfig } from './config';
import { useConfig } from './states';

export const getAddr = (config: IConfig) => {
  const host = config.osc_client_host;
  return `${host.includes(':') ? `[${host}]` : host}:${config.osc_client_port}`;
};

const send = (config: IConfig, command: 'send_float' | 'send_bool', path: string, value: number | boolean) => {
  const addr = getAddr(config);
  invoke(command, { host: config.osc_client_host, port: config.osc_client_port, path, value }).then(
    () => useConfig.setState((state) => (state.oscFailure === addr ? { oscFailure: null } : state)),
    () => useConfig.setState({ oscFailure: addr })
  );
};

export const sendOscFloat = (config: IConfig, path: string, value: number) => send(config, 'send_float', path, value);

export const sendOscBool = (config: IConfig, path: string, value: boolean) => send(config, 'send_bool', path, value);
