import { useEffect } from 'react';
import { connected, disconnected, getTimeoutSeconds, sendOscHeartRate } from '../lib/service';
import { useConfig } from '../lib/states';
import { getWebSocketUrl } from '../lib/stromno';

type HeartRateData = {
  data: {
    heartRate: number;
  };
};

let timeout: ReturnType<typeof setTimeout>;
let socket: WebSocket | null = null;

const useWebSocket = (onMessage?: (heartRate: number) => void, onConnected?: () => void, onDisconnect?: () => void) => {
  const config = useConfig((state) => state.config);

  useEffect(() => {
    if (!config?.stromno_widget_id) {
      if (socket) socket.close();
      return;
    }

    (async () => {
      console.info('connecting to websocket');

      const wsUrl = await getWebSocketUrl(config.stromno_widget_id);
      if (!wsUrl) {
        if (socket) socket.close();

        console.info('failed to get websocket url');
        return;
      }

      if (socket) socket.close();

      socket = new WebSocket(wsUrl);

      socket.onmessage = async (event: MessageEvent<string>) => {
        if (config == null) return;
        console.info('WS: message', event.data);

        connected(onConnected);
        try {
          const json = JSON.parse(event.data) as HeartRateData;
          onMessage?.(json.data.heartRate);
          sendOscHeartRate(json.data.heartRate);
        } catch (err) {
          console.error(err);
        }

        timeout = setTimeout(() => {
          disconnected(onDisconnect);
        }, await getTimeoutSeconds());
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
