import useInput from '../../hooks/useInput';
import { defaultConfig, saveConfig } from '../../lib/config';
import { startHttpServer } from '../../lib/http_server';
import { useConfig } from '../../lib/states';

const Http = () => {
  const config = useConfig((state) => state.config);

  const serverPort = useInput(
    { placeholder: defaultConfig.http_server_port + '', type: 'number' },
    config?.http_server_port,
    (val) => saveConfig({ ...(config || defaultConfig), http_server_port: val })
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm leading-3">HTTP Server Port:</div>
      {serverPort.component}

      <button
        className="bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded-md hover:text-cyan-400 transition-colors"
        onClick={() => {
          console.info('http server start');
          startHttpServer(config || defaultConfig);
        }}
      >
        Start Server
      </button>
    </div>
  );
};

export default Http;
