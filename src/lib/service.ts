import { getConfig } from './config';
import { sendOscBool, sendOscFloat } from './osc';

export type ServiceProps = {
  setConnected: (connected: boolean) => void;
  setHeartRate: (heartRate: number) => void;
};

let timeout: ReturnType<typeof setTimeout>;

export const connected = async (onConnected?: () => void) => {
  const config = await getConfig();

  console.info('connected');
  onConnected?.();
  clearTimeout(timeout);
  sendOscBool(config, config.osc_path_connected, true);
};

export const disconnected = async (onDisconnect?: () => void) => {
  const config = await getConfig();

  console.info('disconnected');
  onDisconnect?.();
  clearTimeout(timeout);
  sendOscBool(config, config.osc_path_connected, false);
};

export const getTimeoutSeconds = async () => {
  const config = await getConfig();
  return config.connected_timeout * 1000;
};

export const sendOscHeartRate = async (heartRate: number) => {
  const config = await getConfig();
  sendOscFloat(config, config.osc_path_percent, heartRate / config.max_heart_rate);
};
