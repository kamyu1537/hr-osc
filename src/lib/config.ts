import { appConfigDir } from '@tauri-apps/api/path';
import { BaseDirectory, exists, mkdir, readFile, rename, writeFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { LanguageSetting, languageSettings } from './i18n';
import { useConfig } from './states';

export const defaultConfig: IConfig = {
  service_type: 'stromno',
  http_server_port: 8080,
  http_server_lan: false,
  stromno_widget_id: '',

  osc_path_connected: '/avatar/parameters/hr_connected',
  osc_path_percent: '/avatar/parameters/hr_percent',

  connected_timeout: 10,
  max_heart_rate: 200,

  osc_client_host: '127.0.0.1',
  osc_client_port: 9000,

  language: 'auto',
};

type Service = { label: string; chip: string } & ({ kind: 'http' } | { kind: 'widget'; widgetIdUrl: string });

export const services: Record<IConfig['service_type'], Service> = {
  pulsoid_legacy: {
    label: 'Pulsoid (Legacy)',
    chip: 'border-[#2fb6c4]/30 text-[#2fb6c4]',
    kind: 'widget',
    widgetIdUrl: 'https://pulsoid.net/ui/configuration',
  },
  stromno: {
    label: 'Stromno',
    chip: 'border-[#cab41f]/30 text-[#cab41f]',
    kind: 'widget',
    widgetIdUrl: 'https://app.stromno.com/dashboard',
  },
  http: { label: 'HTTP', chip: 'border-[#34d399]/30 text-[#34d399]', kind: 'http' },
};

export const configFilePath = async () => `${await appConfigDir()}\\data\\config.json`;

let writing = Promise.resolve();
let persisted: IConfig | null = null;
const tempPath = `data/config.json.${crypto.randomUUID()}.tmp`;

function writeConfig(config: IConfig) {
  const write = writing.then(async () => {
    await writeTextFile(tempPath, JSON.stringify(config, null, 2), { baseDir: BaseDirectory.AppConfig });
    await rename(tempPath, 'data/config.json', {
      oldPathBaseDir: BaseDirectory.AppConfig,
      newPathBaseDir: BaseDirectory.AppConfig,
    });
    persisted = config;
  });
  writing = write.catch(() => {});
  return write;
}

export async function getConfig() {
  await mkdir('data', { recursive: true, baseDir: BaseDirectory.AppConfig });
  const isExists = await exists('data/config.json', { baseDir: BaseDirectory.AppConfig });
  if (!isExists) {
    await writeConfig(defaultConfig);
  }

  let config = { ...defaultConfig };
  const read = await readFile('data/config.json', { baseDir: BaseDirectory.AppConfig });
  try {
    const parse = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(read));
    config = { ...config, http_server_lan: true, ...parse };
    if (!Object.hasOwn(services, config.service_type)) {
      config.service_type = defaultConfig.service_type;
    }
    if (!languageSettings.includes(config.language)) {
      config.language = defaultConfig.language;
    }
  } catch (err) {
    console.error(err);
    await writeFile('data/config.json.bak', read, { baseDir: BaseDirectory.AppConfig });
    await writeConfig(defaultConfig);
  }

  persisted ??= config;
  return config;
}

export async function saveConfig(config: IConfig) {
  const next = { ...config };
  useConfig.getState().setConfig(next);
  try {
    await writeConfig(next);
  } catch (err) {
    if (persisted && useConfig.getState().config === next) {
      useConfig.getState().setConfig(persisted);
    }
    throw err;
  }
}

export interface IConfig {
  service_type: 'pulsoid_legacy' | 'stromno' | 'http';
  http_server_port: number;
  http_server_lan: boolean;
  stromno_widget_id: string;

  connected_timeout: number;
  max_heart_rate: number;

  osc_path_connected: string;
  osc_path_percent: string;

  osc_client_host: string;
  osc_client_port: number;

  language: LanguageSetting;
}
