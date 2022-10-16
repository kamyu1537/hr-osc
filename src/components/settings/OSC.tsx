import { useContext } from 'react';
import useInput from '../../hooks/useInput';
import { ConfigContext, defaultConfig, saveConfig } from '../../lib/config';

const OSC = () => {
  const config = useContext(ConfigContext);
  const host = useInput(
    { placeholder: defaultConfig.osc_client_host + '', type: 'text' },
    config?.osc_client_host,
    (val) => saveConfig({ ...(config || defaultConfig), osc_client_host: val })
  );
  const port = useInput(
    { placeholder: defaultConfig.osc_client_port + '', type: 'number' },
    config?.osc_client_port,
    (val) => saveConfig({ ...(config || defaultConfig), osc_client_port: val })
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm leading-3">OSC Host:</div>
      {host.component}

      <div className="text-sm leading-3">OSC Port:</div>
      {port.component}
    </div>
  );
};

export default OSC;
