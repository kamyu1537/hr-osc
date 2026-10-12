import { defaultConfig, saveConfig, services } from '../lib/config';
import { startHttpServer } from '../lib/http_server';
import { useStrings } from '../lib/i18n';
import { useConfig } from '../lib/states';

const latestConfig = () => useConfig.getState().config ?? defaultConfig;

const useSourceAction = () => {
  const t = useStrings();
  const serviceType = useConfig((state) => state.config?.service_type ?? defaultConfig.service_type);

  return services[serviceType].kind === 'http'
    ? { label: t.home.restartServer, run: () => startHttpServer(latestConfig()) }
    : { label: t.home.reconnect, run: () => saveConfig({ ...latestConfig() }) };
};

export default useSourceAction;
