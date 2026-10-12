import { invoke } from '@tauri-apps/api/core';
import { fetch } from '@tauri-apps/plugin-http';
import { Endpoint } from './service';

export const getPulsoidToken = () => invoke<string>('get_pulsoid_token');

export const setPulsoidToken = (token: string) => invoke<void>('set_pulsoid_token', { token });

export const pulsoidHeartRate = (message: string) => (JSON.parse(message) as { data: { heart_rate: number } }).data.heart_rate;

export const getPulsoidEndpoint = async (): Promise<Endpoint> => {
  const token = await getPulsoidToken();
  if (!token) {
    return { failure: 'noPulsoidToken', retry: false };
  }

  const response = await fetch('https://dev.pulsoid.net/api/v1/token/validate', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status !== 200) {
    await response.body?.cancel();
    return response.status === 401 || response.status === 403
      ? { failure: 'pulsoidToken', retry: false }
      : { failure: 'noWebSocketUrl', retry: true };
  }

  const { scopes } = (await response.json()) as { scopes: string[] };
  if (!scopes.includes('data:heart_rate:read')) {
    return { failure: 'pulsoidToken', retry: false };
  }
  return { url: `wss://dev.pulsoid.net/api/v1/data/real_time?access_token=${encodeURIComponent(token)}` };
};
