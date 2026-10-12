import { describe, expect, it } from 'vitest';
import { defaultConfig } from './config';
import { getAddr } from './osc';

describe('getAddr', () => {
  it('joins an IPv4 host and port', () => {
    expect(getAddr({ ...defaultConfig, osc_client_host: '127.0.0.1', osc_client_port: 9000 })).toBe('127.0.0.1:9000');
  });

  it('joins a hostname and port', () => {
    expect(getAddr({ ...defaultConfig, osc_client_host: 'localhost', osc_client_port: 9001 })).toBe('localhost:9001');
  });

  it('wraps an IPv6 host in brackets', () => {
    expect(getAddr({ ...defaultConfig, osc_client_host: '::1', osc_client_port: 9000 })).toBe('[::1]:9000');
  });
});
