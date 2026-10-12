import { useEffect, useState } from 'react';
import { getHttpHeartRate, getHttpHeartRateUpdateTime, startHttpServer } from '../lib/http_server';
import { connected, disconnected, getTimeoutSeconds, sendOscHeartRate, ServiceProps } from '../lib/service';
import { useConfig } from '../lib/states';

const HttpService = ({ setConnected, setHeartRate, setFailure }: ServiceProps) => {
  const config = useConfig((state) => state.config);
  const reconnectRequest = useConfig((state) => state.reconnectRequest);
  const [serverPort, setServerPort] = useState(config?.http_server_port || 0);

  useEffect(() => {
    if (config == null) return;

    const port = config.http_server_port || 0;
    if (serverPort === port) return;

    setServerPort(port);
  }, [config]);

  useEffect(() => {
    if (config == null) return;

    let interval: ReturnType<typeof setInterval>;
    let start = false;
    let cancelled = false;
    if (serverPort !== 0) {
      start = true;
      startHttpServer(config).catch(() => {
        if (!cancelled) setFailure('httpPort');
      });

      interval = setInterval(() => {
        (async () => {
          const [heartRate, lastUpdate] = await Promise.all([getHttpHeartRate(), getHttpHeartRateUpdateTime()]);

          if (heartRate == null || lastUpdate == null) {
            disconnected();
            setConnected(false);
            return;
          }

          const now = Date.now();
          if (now - lastUpdate > getTimeoutSeconds()) {
            disconnected();
            setConnected(false);
            return;
          }

          connected();
          setConnected(true);
          setHeartRate(heartRate);
          sendOscHeartRate(heartRate);
        })();
      }, 1000);
    }

    return () => {
      cancelled = true;
      setFailure('');
      if (start) {
        clearInterval(interval);
      }
    };
  }, [serverPort, config?.http_server_lan, reconnectRequest]);

  return <></>;
};

export default HttpService;
