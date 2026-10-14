import { invoke } from '@tauri-apps/api/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultConfig } from './config';
import { connected, disconnected, heartRatePercent } from './service';
import { useConfig } from './states';

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn().mockResolvedValue(undefined) }));

describe('connection state', () => {
  beforeEach(() => {
    useConfig.setState({ config: { ...defaultConfig }, oscFailure: null });
    connected();
    vi.mocked(invoke).mockClear();
  });

  it('sends false after returning to a previously connected destination', () => {
    connected();
    useConfig.getState().setConfig({ ...defaultConfig, osc_client_port: 9001 });
    disconnected();
    useConfig.getState().setConfig({ ...defaultConfig });
    disconnected();

    expect(vi.mocked(invoke).mock.calls).toEqual([
      ['send_bool', { host: '127.0.0.1', port: 9000, path: '/avatar/parameters/hr_connected', value: true }],
      ['send_bool', { host: '127.0.0.1', port: 9001, path: '/avatar/parameters/hr_connected', value: false }],
      ['send_bool', { host: '127.0.0.1', port: 9000, path: '/avatar/parameters/hr_connected', value: false }],
    ]);
  });

  it('sends false to a changed connection path', () => {
    disconnected();
    useConfig.getState().setConfig({ ...defaultConfig, osc_path_connected: '/avatar/parameters/connected' });
    disconnected();

    expect(vi.mocked(invoke).mock.calls).toEqual([
      ['send_bool', { host: '127.0.0.1', port: 9000, path: '/avatar/parameters/hr_connected', value: false }],
      ['send_bool', { host: '127.0.0.1', port: 9000, path: '/avatar/parameters/connected', value: false }],
    ]);
  });

  it('sends false to a changed host', () => {
    disconnected();
    useConfig.getState().setConfig({ ...defaultConfig, osc_client_host: 'localhost' });
    disconnected();

    expect(vi.mocked(invoke).mock.calls).toEqual([
      ['send_bool', { host: '127.0.0.1', port: 9000, path: '/avatar/parameters/hr_connected', value: false }],
      ['send_bool', { host: 'localhost', port: 9000, path: '/avatar/parameters/hr_connected', value: false }],
    ]);
  });

  it('sends false only once for an unchanged destination and path', () => {
    disconnected();
    disconnected();

    expect(vi.mocked(invoke).mock.calls).toEqual([
      ['send_bool', { host: '127.0.0.1', port: 9000, path: '/avatar/parameters/hr_connected', value: false }],
    ]);
  });

  it('sends true for every heartbeat', () => {
    connected();
    connected();

    expect(vi.mocked(invoke).mock.calls).toEqual([
      ['send_bool', { host: '127.0.0.1', port: 9000, path: '/avatar/parameters/hr_connected', value: true }],
      ['send_bool', { host: '127.0.0.1', port: 9000, path: '/avatar/parameters/hr_connected', value: true }],
    ]);
  });
});

describe('heartRatePercent', () => {
  it('divides heart rate by max heart rate', () => {
    expect(heartRatePercent(100, 200)).toBe(0.5);
  });

  it('clamps heart rate above max to 1', () => {
    expect(heartRatePercent(250, 200)).toBe(1);
  });

  it('clamps negative heart rate to 0', () => {
    expect(heartRatePercent(-10, 200)).toBe(0);
  });

  it('returns 0 when max heart rate is 0', () => {
    expect(heartRatePercent(100, 0)).toBe(0);
  });
});
