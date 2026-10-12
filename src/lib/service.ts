import { IConfig } from './config';
import { Strings } from './i18n';
import { sendOscBool, sendOscFloat } from './osc';
import { useConfig } from './states';

export type Failure = keyof Strings['failures'] | '';

export type ServiceProps = {
  setConnected: (connected: boolean) => void;
  setHeartRate: (heartRate: number) => void;
  setFailure: (reason: Failure) => void;
};

let timeout: ReturnType<typeof setTimeout> | undefined;
let lastConnected: boolean | undefined;

const currentConfig = () => useConfig.getState().config as IConfig;

const sendConnected = (value: boolean) => {
  if (lastConnected === value) return;

  lastConnected = value;
  const config = currentConfig();
  sendOscBool(config, config.osc_path_connected, value);
};

export const connected = (onConnected?: () => void) => {
  onConnected?.();
  clearTimeout(timeout);
  sendConnected(true);
};

export const disconnected = (onDisconnect?: () => void) => {
  onDisconnect?.();
  clearTimeout(timeout);
  sendConnected(false);
};

export const getTimeoutSeconds = () => currentConfig().connected_timeout * 1000;

export const sendOscHeartRate = (heartRate: number) => {
  const config = currentConfig();
  sendOscFloat(config, config.osc_path_percent, heartRate / config.max_heart_rate);
};
