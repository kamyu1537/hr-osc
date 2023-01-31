import { useEffect, useState } from 'react';
import { getHttpHeartRate, getHttpHeartRateUpdateTime, startHttpServer } from '../lib/http_server';
import { connected, disconnected, getTimeoutSeconds, sendOscHeartRate, ServiceProps } from '../lib/service';
import { useConfig } from '../lib/states';

const HttpService = ({ setConnected, setHeartRate }: ServiceProps) => {
  const config = useConfig((state) => state.config);
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
    if (serverPort !== 0) {
      start = true;
      startHttpServer(config);

      interval = setInterval(() => {
        (async () => {
          const [heartRate, lastUpdate] = await Promise.all([getHttpHeartRate(), getHttpHeartRateUpdateTime()]);
          console.info({ heartRate, lastUpdate });

          if (heartRate == null || lastUpdate == null) {
            console.info('no heart rate');
            disconnected();
            setConnected(false);
            return;
          }

          const now = Date.now();
          console.info({
            now,
            lastUpdate,
            calc: now - lastUpdate,
          });

          if (now - lastUpdate > (await getTimeoutSeconds())) {
            console.info('timeout', now - lastUpdate);
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
      if (start) {
        clearInterval(interval);
      }
    };
  }, [serverPort]);

  return <></>;
};

export default HttpService;
