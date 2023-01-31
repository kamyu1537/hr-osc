import { relaunch } from '@tauri-apps/api/process';
import { useState } from 'react';
import useInput from '../../hooks/useInput';
import { defaultConfig, saveConfig } from '../../lib/config';
import { useConfig } from '../../lib/states';

const Http = () => {
  const config = useConfig((state) => state.config);
  const [port, setPort] = useState(config?.http_server_port || 0);

  const serverPort = useInput({ placeholder: defaultConfig.http_server_port + '', type: 'number' }, config?.http_server_port, (val) => saveConfig({ ...(config || defaultConfig), http_server_port: val }));

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm leading-3">HTTP Server Port:</div>
      {serverPort.component}

      <div className="text-sm leading-3 text-gray-500">Apply the changed port, hr-osc must be relaunched.</div>

      <button
        className="bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded-md hover:text-cyan-400 transition-colors"
        onClick={() => {
          relaunch();
        }}
      >
        Relaunch
      </button>
    </div>
  );
};

export default Http;
