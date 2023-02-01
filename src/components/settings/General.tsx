import useInput from '../../hooks/useInput';
import useSelect from '../../hooks/useSelect';
import { defaultConfig, saveConfig } from '../../lib/config';
import { useConfig } from '../../lib/states';
import { stopHttpServer } from "../../lib/http_server";

const General = () => {
  const config = useConfig((state) => state.config);

  const serviceType = useSelect(
    { placeholder: defaultConfig.service_type + '' },
    [
      { value: 'stromno', label: 'Pulsoid / Stromno' },
      { value: 'http', label: 'HTTP' },
    ],
    config?.service_type,
    (val) => {
        saveConfig({...(config || defaultConfig), service_type: val as 'stromno' | 'http'})
        if (val !== 'http') {
            stopHttpServer();
        }
    }
  );

  const connectedTimeout = useInput(
    { placeholder: defaultConfig.connected_timeout + '', type: 'number' },
    config?.connected_timeout,
    (val) => saveConfig({ ...(config || defaultConfig), connected_timeout: val })
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm leading-3">Service Type:</div>
      {serviceType.component}

      <div className="text-sm leading-3">Connected Timeout:</div>
      {connectedTimeout.component}
    </div>
  );
};

export default General;
