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

const currentConfig = () => useConfig.getState().config as IConfig;

export const connected = (onConnected?: () => void) => {
  const config = currentConfig();

  console.info('connected');
  onConnected?.();
  clearTimeout(timeout);
  sendOscBool(config, config.osc_path_connected, true);
};

export const disconnected = (onDisconnect?: () => void) => {
  const config = currentConfig();

  console.info('disconnected');
  onDisconnect?.();
  clearTimeout(timeout);
  sendOscBool(config, config.osc_path_connected, false);
};

export const getTimeoutSeconds = () => currentConfig().connected_timeout * 1000;

export const sendOscHeartRate = (heartRate: number) => {
  const config = currentConfig();
  sendOscFloat(config, config.osc_path_percent, heartRate / config.max_heart_rate);
};
