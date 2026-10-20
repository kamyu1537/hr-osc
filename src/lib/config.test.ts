import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const files = vi.hoisted(() => new Map<string, Uint8Array>());
const writeFile = vi.hoisted(() => vi.fn(async (path: string, data: Uint8Array) => {
  files.set(path, data);
}));

vi.mock('@tauri-apps/plugin-fs', () => ({
  BaseDirectory: { AppConfig: 1 },
  mkdir: async () => {},
  exists: async (path: string) => files.has(path),
  readFile: async (path: string) => {
    const data = files.get(path);
    if (!data) throw new Error(`missing file: ${path}`);
    return data;
  },
  writeFile,
  writeTextFile: async (path: string, data: string) => {
    files.set(path, new TextEncoder().encode(data));
  },
  rename: async (oldPath: string, newPath: string) => {
    const data = files.get(oldPath);
    if (!data) throw new Error(`missing file: ${oldPath}`);
    files.set(newPath, data);
    files.delete(oldPath);
  },
}));

let configModule: typeof import('./config');

beforeEach(async () => {
  vi.resetModules();
  files.clear();
  writeFile.mockClear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  configModule = await import('./config');
});

afterEach(() => vi.restoreAllMocks());

describe('getConfig', () => {
  it.each([
    ['null root', 'null'],
    ['string root', '"config"'],
    ['number root', '42'],
    ['boolean root', 'true'],
    ['array root', '[]'],
    ['null host', '{"osc_client_host":null}'],
    ['number host', '{"osc_client_host":123}'],
    ['string port', '{"osc_client_port":"9000"}'],
    ['number LAN setting', '{"http_server_lan":1}'],
    ['array widget ID', '{"stromno_widget_id":[]}'],
    ['object OSC path', '{"osc_path_connected":{}}'],
    ['null service', '{"service_type":null}'],
    ['boolean language', '{"language":false}'],
    ['overflowing number', '{"max_heart_rate":1e400}'],
    ['malformed JSON', '{"osc_client_host":'],
  ])('backs up %s and recovers defaults', async (_name, input) => {
    const bytes = new TextEncoder().encode(input);
    files.set('data/config.json', bytes);

    const config = await configModule.getConfig();

    expect(config).toEqual(configModule.defaultConfig);
    expect(files.get('data/config.json.bak')).toEqual(bytes);
    expect(JSON.parse(new TextDecoder().decode(files.get('data/config.json')))).toEqual(configModule.defaultConfig);
  });

  it('preserves undecodable bytes in the backup', async () => {
    const bytes = new Uint8Array([0xff, 0xfe, 0x80]);
    files.set('data/config.json', bytes);

    expect(await configModule.getConfig()).toEqual(configModule.defaultConfig);
    expect(files.get('data/config.json.bak')).toEqual(bytes);
  });

  it('merges a partial old config and preserves unknown fields', async () => {
    files.set('data/config.json', new TextEncoder().encode('{"osc_client_host":"localhost","future_field":{"enabled":true}}'));

    expect(await configModule.getConfig()).toEqual({
      ...configModule.defaultConfig,
      osc_client_host: 'localhost',
      future_field: { enabled: true },
    });
    expect(files.has('data/config.json.bak')).toBe(false);
  });

  it('retains an explicit LAN setting', async () => {
    files.set('data/config.json', new TextEncoder().encode('{"http_server_lan":true}'));

    expect((await configModule.getConfig()).http_server_lan).toBe(true);
  });

  it('uses LAN-disabled defaults for a new installation', async () => {
    expect(await configModule.getConfig()).toEqual(configModule.defaultConfig);
    expect(JSON.parse(new TextDecoder().decode(files.get('data/config.json'))).http_server_lan).toBe(false);
    expect(files.has('data/config.json.bak')).toBe(false);
  });

  it('falls back for unknown service and language strings', async () => {
    files.set('data/config.json', new TextEncoder().encode('{"service_type":"future-source","language":"future-language"}'));

    expect(await configModule.getConfig()).toEqual(configModule.defaultConfig);
    expect(files.has('data/config.json.bak')).toBe(false);
  });

  it('keeps the original config when backup fails', async () => {
    const bytes = new TextEncoder().encode('{"osc_client_host":null}');
    files.set('data/config.json', bytes);
    writeFile.mockRejectedValueOnce(new Error('backup failed'));

    await expect(configModule.getConfig()).rejects.toThrow('backup failed');
    expect(files.get('data/config.json')).toEqual(bytes);
  });
});
