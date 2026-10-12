import { invoke } from '@tauri-apps/api/core';
import { fetch } from '@tauri-apps/plugin-http';
import { Endpoint } from './service';

const PULSOID_CLIENT_ID = '24f1280b-0442-4b51-a5da-501b7812d017';
const SLOW_DOWN_MS = 5000;

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

export type PulsoidDeviceCode = {
  deviceCode: string;
  verificationUriComplete: string;
  expiresIn: number;
  interval: number;
};

export type PulsoidLogin = { token: string } | { failure: 'denied' | 'expired' };

export const requestPulsoidDeviceCode = async (): Promise<PulsoidDeviceCode> => {
  const response = await fetch('https://pulsoid.net/oauth2/device_authorization', {
    method: 'POST',
    body: new URLSearchParams({ client_id: PULSOID_CLIENT_ID, scope: 'data:heart_rate:read' }),
  });
  if (response.status !== 200) {
    await response.body?.cancel();
    throw new Error(`pulsoid device authorization ${response.status}`);
  }
  const body = (await response.json()) as {
    device_code: string;
    verification_uri_complete: string;
    expires_in: number;
    interval: number;
  };
  return {
    deviceCode: body.device_code,
    verificationUriComplete: body.verification_uri_complete,
    expiresIn: body.expires_in,
    interval: body.interval,
  };
};

const delay = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    signal.throwIfAborted();
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });

export const pollPulsoidToken = async (device: PulsoidDeviceCode, signal: AbortSignal): Promise<PulsoidLogin> => {
  const deadline = Date.now() + device.expiresIn * 1000;
  let interval = device.interval * 1000;
  for (;;) {
    await delay(interval, signal);
    if (Date.now() >= deadline) return { failure: 'expired' };

    const response = await fetch('https://pulsoid.net/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code: device.deviceCode,
        client_id: PULSOID_CLIENT_ID,
      }),
      signal,
    });
    if (response.status === 200) {
      const { access_token } = (await response.json()) as { access_token: string };
      return { token: access_token };
    }

    const { error } = (await response.json()) as { error?: string };
    switch (error) {
      case 'authorization_pending':
        break;
      case 'slow_down':
        interval += SLOW_DOWN_MS;
        break;
      case 'expired_token':
        return { failure: 'expired' };
      case 'invalid_grant':
        return { failure: 'denied' };
      default:
        throw new Error(`pulsoid token ${response.status} ${error}`);
    }
  }
};
