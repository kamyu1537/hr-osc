import { useContext, useEffect } from 'react';
import { ConfigContext } from '../lib/config';
import { sendOscBool, sendOscFloat } from '../lib/osc';
import { getWebSocketUrl } from '../lib/stromno';

type HeartRateData = {
  data: {
    heartRate: number;
  };
};

let timeout: ReturnType<typeof setTimeout>;
let socket: WebSocket | null = null;

const useWebSocket = (onMessage?: (heartRate: number) => void, onConnected?: () => void, onDisconnect?: () => void) => {
  const config = useContext(ConfigContext);

  useEffect(() => {
    if (!config?.stromno_widget_id) {
      if (socket) socket.close();
      return;
    }

    (async () => {
      const wsUrl = await getWebSocketUrl(config.stromno_widget_id);
      if (socket) socket.close();

      socket = new WebSocket(wsUrl);

      const connected = () => {
        onConnected?.();
        clearTimeout(timeout);
        sendOscBool(config, config.osc_path_connected, true);
      };

      const disconnected = () => {
        onDisconnect?.();
        clearTimeout(timeout);
        sendOscBool(config, config.osc_path_connected, false);
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        if (config == null) return;
        console.info('WS: message', event.data);

        connected();
        try {
          const json = JSON.parse(event.data) as HeartRateData;
          onMessage?.(json.data.heartRate);
          sendOscFloat(config, config.osc_path_percent, Math.floor((json.data.heartRate / 200) * 100) * 0.01);
        } catch (err) {
          console.error(err);
        }

        timeout = setTimeout(() => {
          disconnected();
        }, config.stromno_timeout * 1000);
      };

      socket.onopen = () => {
        console.info('WS: open');
      };

      socket.onerror = (error: Event) => {
        console.error('WS: error', error);
      };

      socket.onclose = () => {
        console.info('WS: closed');
        disconnected();
      };
    })();

    return () => {
      console.info('unmount');
      if (socket) socket.close();
      socket = null;
    };
  }, [config]);
};

export default useWebSocket;
