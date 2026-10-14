import { IConfig } from './config';
import { Strings } from './i18n';
import { sendOscBool, sendOscFloat } from './osc';
import { useConfig } from './states';

export type Failure = keyof Strings['failures'] | '';

export type Endpoint = { url: string } | { failure: Exclude<Failure, ''>; retry: boolean };

export type ServiceProps = {
  setConnected: (connected: boolean) => void;
  setHeartRate: (heartRate: number) => void;
  setFailure: (reason: Failure) => void;
};

let timeout: ReturnType<typeof setTimeout> | undefined;
let lastConnected: { host: string; port: number; path: string; value: boolean } | undefined;

const currentConfig = () => useConfig.getState().config as IConfig;

const sendConnected = (value: boolean) => {
  const config = currentConfig();
  const { osc_client_host: host, osc_client_port: port, osc_path_connected: path } = config;
  if (
    !value &&
    lastConnected?.value === false &&
    lastConnected.host === host &&
    lastConnected.port === port &&
    lastConnected.path === path
  ) {
    return;
  }

  lastConnected = { host, port, path, value };
  sendOscBool(config, path, value);
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

export const heartRatePercent = (heartRate: number, maxHeartRate: number) =>
  maxHeartRate > 0 ? Math.min(1, Math.max(0, heartRate / maxHeartRate)) : 0;

export const sendOscHeartRate = (heartRate: number) => {
  const config = currentConfig();
  sendOscFloat(config, config.osc_path_percent, heartRatePercent(heartRate, config.max_heart_rate));
};
