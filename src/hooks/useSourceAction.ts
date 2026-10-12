import { defaultConfig, services } from '../lib/config';
import { useStrings } from '../lib/i18n';
import { useConfig } from '../lib/states';

const useSourceAction = () => {
  const t = useStrings();
  const serviceType = useConfig((state) => state.config?.service_type ?? defaultConfig.service_type);
  const requestReconnect = useConfig((state) => state.requestReconnect);

  return {
    label: services[serviceType].kind === 'http' ? t.home.restartServer : t.home.reconnect,
    run: requestReconnect,
  };
};

export default useSourceAction;
