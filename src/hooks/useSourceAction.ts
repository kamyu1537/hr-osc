import { useState } from 'react';
import { defaultConfig, saveConfig, services } from '../lib/config';
import { startHttpServer } from '../lib/http_server';
import { useStrings } from '../lib/i18n';
import { useConfig } from '../lib/states';

const latestConfig = () => useConfig.getState().config ?? defaultConfig;

const useSourceAction = () => {
  const t = useStrings();
  const serviceType = useConfig((state) => state.config?.service_type ?? defaultConfig.service_type);
  const [saveFailed, setSaveFailed] = useState(false);

  const reconnect = () =>
    saveConfig({ ...latestConfig() }).then(
      () => setSaveFailed(false),
      (err) => {
        console.error(err);
        setSaveFailed(true);
      }
    );

  return services[serviceType].kind === 'http'
    ? { label: t.home.restartServer, run: () => startHttpServer(latestConfig()), saveFailed: false }
    : { label: t.home.reconnect, run: reconnect, saveFailed };
};

export default useSourceAction;
