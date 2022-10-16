import { BaseDirectory, exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { createContext } from 'react';

export const defaultConfig: IConfig = {
  stromno_widget_id: '',
  stromno_timeout: 10,

  max_heart_rate: 200,

  osc_path_connected: '/avatar/parameters/hr_connected',
  osc_path_percent: '/avatar/parameters/hr_percent',

  osc_client_host: '127.0.0.1',
  osc_client_port: 9000,
};

async function writeDefaultConfig() {
  await writeTextFile(
    {
      path: 'config.json',
      contents: JSON.stringify(defaultConfig, null, 2),
    },
    { dir: BaseDirectory.App }
  );
}

export async function getConfig() {
  const isExists = (await exists('config.json', { dir: BaseDirectory.App })) as unknown as boolean;
  if (!isExists) {
    await writeDefaultConfig();
  }

  let config = { ...defaultConfig };
  const read = await readTextFile('config.json', { dir: BaseDirectory.App });
  try {
    const parse = JSON.parse(read);
    config = { ...config, ...parse };
  } catch (err) {
    console.error(err);
    await writeDefaultConfig();
  }

  return config;
}

export let updateConfig: ((conf: IConfig) => void)[] = [];
const update = (config: IConfig) => {
  updateConfig.forEach((hook) => hook(config));
};

export const clear = () => {
  updateConfig = [];
};

export async function saveConfig(config: IConfig) {
  await writeTextFile(
    {
      path: 'config.json',
      contents: JSON.stringify(config, null, 2),
    },
    { dir: BaseDirectory.App }
  );

  let newConfig = { ...defaultConfig };
  const read = await readTextFile('config.json', { dir: BaseDirectory.App });
  try {
    const parse = JSON.parse(read);
    newConfig = { ...newConfig, ...parse };
  } catch (err) {
    console.error(err);
    await writeDefaultConfig();
  }

  update(newConfig);
}

export interface IConfig {
  stromno_widget_id: string;
  stromno_timeout: number;

  max_heart_rate: number;

  osc_path_connected: string;
  osc_path_percent: string;

  osc_client_host: string;
  osc_client_port: number;
}

export const ConfigContext = createContext<IConfig | null>(null);
