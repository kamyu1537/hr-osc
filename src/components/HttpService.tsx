import { useEffect } from 'react';
import { getHttpHeartRate, getHttpHeartRateUpdateTime, startHttpServer } from '../lib/http_server';
import { connected, disconnected, getTimeoutSeconds, sendOscHeartRate, ServiceProps } from '../lib/service';
import { useConfig } from '../lib/states';

const HttpService = ({ setConnected, setHeartRate, setFailure }: ServiceProps) => {
  const config = useConfig((state) => state.config);
  const reconnectRequest = useConfig((state) => state.reconnectRequest);

  useEffect(() => {
    if (config == null) return;

    let interval: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;
    disconnected();
    setConnected(false);
    setFailure('');

    if (config.http_server_port !== 0) {
      startHttpServer(config).then(() => {
        if (cancelled) return;

        interval = setInterval(async () => {
          const [heartRate, lastUpdate] = await Promise.all([getHttpHeartRate(), getHttpHeartRateUpdateTime()]);
          if (cancelled) return;

          if (heartRate == null || lastUpdate == null || lastUpdate === 0 || Date.now() - lastUpdate > getTimeoutSeconds()) {
            disconnected();
            setConnected(false);
            return;
          }

          connected();
          setConnected(true);
          setHeartRate(heartRate);
          sendOscHeartRate(heartRate);
        }, 1000);
      }, () => {
        if (!cancelled) setFailure('httpPort');
      });
    }

    return () => {
      cancelled = true;
      setFailure('');
      clearInterval(interval);
    };
  }, [config?.http_server_port, config?.http_server_lan, reconnectRequest]);

  return <></>;
};

export default HttpService;
