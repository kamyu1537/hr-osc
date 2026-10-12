import { defaultConfig, saveConfig, services } from '../lib/config';
import { startHttpServer } from '../lib/http_server';
import { useConfig } from '../lib/states';

const latestConfig = () => useConfig.getState().config ?? defaultConfig;

const useSourceAction = () => {
  const serviceType = useConfig((state) => state.config?.service_type ?? defaultConfig.service_type);

  return services[serviceType].kind === 'http'
    ? { label: 'Restart server', run: () => startHttpServer(latestConfig()) }
    : { label: 'Reconnect', run: () => saveConfig({ ...latestConfig() }) };
};

export default useSourceAction;
