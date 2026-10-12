import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPulsoidEndpoint, pulsoidHeartRate } from './pulsoid';

const token = vi.hoisted(() => ({ value: '' }));
const validate = vi.hoisted(() => ({ status: 200, body: {} as unknown }));
const fetchMock = vi.hoisted(() => vi.fn());

vi.mock('@tauri-apps/api/core', () => ({ invoke: async () => token.value }));
vi.mock('@tauri-apps/plugin-http', () => ({ fetch: fetchMock }));

describe('getPulsoidEndpoint', () => {
  beforeEach(() => {
    token.value = 'a b';
    validate.status = 200;
    validate.body = { scopes: ['data:heart_rate:read'] };
    fetchMock.mockReset();
    fetchMock.mockImplementation(async () => new Response(JSON.stringify(validate.body), { status: validate.status }));
  });

  it('connects to the real-time endpoint with the token', async () => {
    expect(await getPulsoidEndpoint()).toEqual({
      url: 'wss://dev.pulsoid.net/api/v1/data/real_time?access_token=a%20b',
    });
    expect(fetchMock).toHaveBeenCalledWith('https://dev.pulsoid.net/api/v1/token/validate', {
      headers: { Authorization: 'Bearer a b' },
    });
  });

  it('stops without a token', async () => {
    token.value = '';
    expect(await getPulsoidEndpoint()).toEqual({ failure: 'noPulsoidToken', retry: false });
  });

  it('stops when the token is rejected', async () => {
    validate.status = 401;
    validate.body = { error_code: 7006, error_message: 'token expired' };
    expect(await getPulsoidEndpoint()).toEqual({ failure: 'pulsoidToken', retry: false });
  });

  it('stops when the token lacks the heart rate scope', async () => {
    validate.body = { scopes: ['profile:read'] };
    expect(await getPulsoidEndpoint()).toEqual({ failure: 'pulsoidToken', retry: false });
  });

  it('retries when validation fails on the server', async () => {
    validate.status = 500;
    expect(await getPulsoidEndpoint()).toEqual({ failure: 'noWebSocketUrl', retry: true });
  });
});

describe('pulsoidHeartRate', () => {
  it('reads data.heart_rate', () => {
    expect(pulsoidHeartRate('{"measured_at":1625310655000,"data":{"heart_rate":72}}')).toBe(72);
  });
});
