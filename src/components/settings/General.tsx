import useInput from '../../hooks/useInput';
import { defaultConfig, saveConfig } from '../../lib/config';
import { useConfig } from '../../lib/states';

const General = () => {
  const config = useConfig((state) => state.config);

  const connectedTimeout = useInput(
    { placeholder: defaultConfig.connected_timeout + '', type: 'number' },
    config?.connected_timeout,
    (val) => saveConfig({ ...(config || defaultConfig), connected_timeout: val })
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm leading-3">Service Type:</div>

      <div className="text-sm leading-3">Connected Timeout:</div>
      {connectedTimeout.component}
    </div>
  );
};

export default General;
