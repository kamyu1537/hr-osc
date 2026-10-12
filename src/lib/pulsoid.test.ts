import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPulsoidEndpoint, pollPulsoidToken, pulsoidHeartRate, requestPulsoidDeviceCode } from './pulsoid';

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

const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });

const device = {
  deviceCode: 'dev-1',
  verificationUriComplete: 'https://pulsoid.net/oauth2/device_authorization_consent?user_code=73af568f-313c-49c2-8a45-b1c4aa554d10',
  expiresIn: 900,
  interval: 3,
};

const sentBody = (call: number) => String((fetchMock.mock.calls[call][1] as RequestInit).body);

describe('requestPulsoidDeviceCode', () => {
  beforeEach(() => fetchMock.mockReset());

  it('posts the client id and heart rate scope and reads the device code', async () => {
    fetchMock.mockResolvedValueOnce(
      json(200, {
        device_code: 'dev-1',
        user_code: '73af568f-313c-49c2-8a45-b1c4aa554d10',
        verification_uri: 'https://pulsoid.net/oauth2/device_authorization_consent',
        verification_uri_complete: 'https://pulsoid.net/oauth2/device_authorization_consent?user_code=73af568f-313c-49c2-8a45-b1c4aa554d10',
        expires_in: 900,
        interval: 3,
      }),
    );
    expect(await requestPulsoidDeviceCode()).toEqual(device);
    expect(fetchMock.mock.calls[0][0]).toBe('https://pulsoid.net/oauth2/device_authorization');
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('POST');
    expect(sentBody(0)).toBe('client_id=24f1280b-0442-4b51-a5da-501b7812d017&scope=data%3Aheart_rate%3Aread');
  });

  it('throws when the server refuses the client', async () => {
    fetchMock.mockResolvedValueOnce(json(400, { error: 'invalid_client' }));
    await expect(requestPulsoidDeviceCode()).rejects.toThrow('pulsoid device authorization 400');
  });
});

describe('pollPulsoidToken', () => {
  const pending = () => json(400, { error: 'authorization_pending', error_description: 'pending' });

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
  });

  afterEach(() => vi.useRealTimers());

  it('returns the access token once granted', async () => {
    fetchMock.mockResolvedValueOnce(json(200, { access_token: 'tok-1', expires_in: 1261440000, token_type: 'bearer' }));
    const result = pollPulsoidToken(device, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(3000);
    expect(await result).toEqual({ token: 'tok-1' });
    expect(fetchMock.mock.calls[0][0]).toBe('https://pulsoid.net/oauth2/token');
    expect(sentBody(0)).toBe(
      'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Adevice_code&device_code=dev-1&client_id=24f1280b-0442-4b51-a5da-501b7812d017',
    );
  });

  it('keeps polling while authorization is pending', async () => {
    fetchMock
      .mockResolvedValueOnce(pending())
      .mockResolvedValueOnce(pending())
      .mockResolvedValueOnce(json(200, { access_token: 'tok-2' }));
    const result = pollPulsoidToken(device, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(9000);
    expect(await result).toEqual({ token: 'tok-2' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('waits the interval before every request', async () => {
    fetchMock.mockImplementation(async () => pending());
    pollPulsoidToken(device, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(2999);
    expect(fetchMock).toHaveBeenCalledTimes(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(2999);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('adds 5 seconds to the interval on slow_down', async () => {
    fetchMock.mockResolvedValueOnce(json(400, { error: 'slow_down' })).mockImplementation(async () => pending());
    pollPulsoidToken(device, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(3000);
    await vi.advanceTimersByTimeAsync(7999);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('stops when the user denies access', async () => {
    fetchMock.mockResolvedValueOnce(json(400, { error: 'invalid_grant', error_description: "user didn't grant access" }));
    const result = pollPulsoidToken(device, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(3000);
    expect(await result).toEqual({ failure: 'denied' });
  });

  it('stops when the device code expired on the server', async () => {
    fetchMock.mockResolvedValueOnce(json(400, { error: 'expired_token' }));
    const result = pollPulsoidToken(device, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(3000);
    expect(await result).toEqual({ failure: 'expired' });
  });

  it('stops at expires_in without asking again', async () => {
    fetchMock.mockImplementation(async () => pending());
    const result = pollPulsoidToken({ ...device, expiresIn: 7 }, new AbortController().signal);
    await vi.advanceTimersByTimeAsync(9000);
    expect(await result).toEqual({ failure: 'expired' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('stops polling when aborted', async () => {
    fetchMock.mockImplementation(async () => pending());
    const controller = new AbortController();
    const result = pollPulsoidToken(device, controller.signal);
    const rejected = expect(result).rejects.toThrow('cancelled');
    await vi.advanceTimersByTimeAsync(3000);
    controller.abort(new Error('cancelled'));
    await rejected;
    await vi.advanceTimersByTimeAsync(30000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
