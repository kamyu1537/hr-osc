import { BaseDirectory, exists, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { LanguageSetting, languageSettings } from './i18n';
import { useConfig } from './states';

export const defaultConfig: IConfig = {
  service_type: 'stromno',
  http_server_port: 8080,
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

async function writeDefaultConfig() {
  await writeTextFile('data/config.json', JSON.stringify(defaultConfig, null, 2), { baseDir: BaseDirectory.AppConfig });
}

export async function getConfig() {
  await mkdir('data', { recursive: true, baseDir: BaseDirectory.AppConfig });
  const isExists = await exists('data/config.json', { baseDir: BaseDirectory.AppConfig });
  if (!isExists) {
    await writeDefaultConfig();
  }

  let config = { ...defaultConfig };
  const read = await readTextFile('data/config.json', { baseDir: BaseDirectory.AppConfig });
  try {
    const parse = JSON.parse(read);
    config = { ...config, ...parse };
    if (!Object.hasOwn(services, config.service_type)) {
      config.service_type = defaultConfig.service_type;
    }
    if (!languageSettings.includes(config.language)) {
      config.language = defaultConfig.language;
    }
  } catch (err) {
    console.error(err);
    await writeDefaultConfig();
  }

  return config;
}

export async function saveConfig(config: IConfig) {
  const previous = useConfig.getState().config;
  const next = { ...config };
  useConfig.getState().setConfig(next);
  try {
    await writeTextFile('data/config.json', JSON.stringify(next, null, 2), { baseDir: BaseDirectory.AppConfig });
  } catch (err) {
    if (previous && useConfig.getState().config === next) {
      useConfig.getState().setConfig(previous);
    }
    throw err;
  }
}

export interface IConfig {
  service_type: 'pulsoid_legacy' | 'stromno' | 'http';
  http_server_port: number;
  stromno_widget_id: string;

  connected_timeout: number;
  max_heart_rate: number;

  osc_path_connected: string;
  osc_path_percent: string;

  osc_client_host: string;
  osc_client_port: number;

  language: LanguageSetting;
}
