import { BaseDirectory, createDir, exists, readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { useConfig } from './states';

export const defaultConfig: IConfig = {
  server_type: 'stromno',
  http_server_port: 8080,
  stromno_widget_id: '',

  osc_path_connected: '/avatar/parameters/hr_connected',
  osc_path_percent: '/avatar/parameters/hr_percent',

  connected_timeout: 10,
  max_heart_rate: 200,

  osc_client_host: '127.0.0.1',
  osc_client_port: 9000,
};

async function writeDefaultConfig() {
  await writeTextFile(
    {
      path: 'data/config.json',
      contents: JSON.stringify(defaultConfig, null, 2),
    },
    { dir: BaseDirectory.App }
  );
}

export async function getConfig() {
  createDir('data', { recursive: true, dir: BaseDirectory.App });
  const isExists = (await exists('data/config.json', { dir: BaseDirectory.App })) as unknown as boolean;
  if (!isExists) {
    await writeDefaultConfig();
  }

  let config = { ...defaultConfig };
  const read = await readTextFile('data/config.json', { dir: BaseDirectory.App });
  try {
    const parse = JSON.parse(read);
    config = { ...config, ...parse };
  } catch (err) {
    console.error(err);
    await writeDefaultConfig();
  }

  return config;
}

export async function saveConfig(config: IConfig) {
  await writeTextFile(
    {
      path: 'data/config.json',
      contents: JSON.stringify(config, null, 2),
    },
    { dir: BaseDirectory.App }
  );

  let newConfig = { ...defaultConfig };
  const read = await readTextFile('data/config.json', { dir: BaseDirectory.App });
  try {
    const parse = JSON.parse(read);
    newConfig = { ...newConfig, ...parse };
  } catch (err) {
    console.error(err);
    await writeDefaultConfig();
  }

  useConfig.getState().setConfig({ ...newConfig });
}

export interface IConfig {
  server_type: 'http' | 'stromno';
  http_server_port: number;
  stromno_widget_id: string;

  connected_timeout: number;
  max_heart_rate: number;

  osc_path_connected: string;
  osc_path_percent: string;

  osc_client_host: string;
  osc_client_port: number;
}
