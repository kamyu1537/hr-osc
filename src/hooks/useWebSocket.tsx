import { useEffect } from 'react';
import { connected, disconnected, Failure, getTimeoutSeconds, sendOscHeartRate } from '../lib/service';
import { useConfig } from '../lib/states';
import { getWebSocketUrl } from '../lib/stromno';

type HeartRateData = {
  data: {
    heartRate: number;
  };
};

let timeout: ReturnType<typeof setTimeout>;
let socket: WebSocket | null = null;

const useWebSocket = (onReceiveHeartrate?: (heartRate: number) => void, onConnected?: () => void, onDisconnect?: () => void, onFailure?: (reason: Failure) => void) => {
  const config = useConfig((state) => state.config);

  useEffect(() => {
    if (!config?.stromno_widget_id) {
      if (socket) socket.close();
      clearTimeout(timeout);
      onDisconnect?.();
      onFailure?.('noWidgetId');
      return () => onFailure?.('');
    }

    let active = true;
    (async () => {
      console.info('connecting to websocket');

      const wsUrl = await getWebSocketUrl(config.stromno_widget_id).catch((err) => {
        console.error(err);
        return '';
      });
      if (!wsUrl) {
        if (socket) socket.close();

        console.info('failed to get websocket url');
        if (active) {
          clearTimeout(timeout);
          onDisconnect?.();
          onFailure?.('noWebSocketUrl');
        }
        return;
      }

      if (socket) socket.close();

      socket = new WebSocket(wsUrl);

      const onMessage = async (event: MessageEvent<string>) => {
        if (config == null) return;
        console.info('WS: message', event.data);
        if (timeout != null) {
          clearTimeout(timeout);
        }

        await connected(onConnected);
        try {
          const json = JSON.parse(event.data) as HeartRateData;
          onReceiveHeartrate?.(json.data.heartRate);
          await sendOscHeartRate(json.data.heartRate);
        } catch (err) {
          console.error(err);
        }

        timeout = setTimeout(() => {
          disconnected(onDisconnect);
        }, await getTimeoutSeconds());
      };

      const onOpen = () => {
        console.info('WS: open');
      };

      const onError = (error: Event) => {
        console.error('WS: error', error);
      };

      const onClose = () => {
        console.info('WS: closed');
        disconnected();

        socket?.removeEventListener('open', onOpen);
        socket?.removeEventListener('error', onError);
        socket?.removeEventListener('message', onMessage);
        socket?.removeEventListener('close', onClose);
      };

      socket?.addEventListener('open', onOpen);
      socket?.addEventListener('error', onError);
      socket?.addEventListener('message', onMessage);
      socket?.addEventListener('close', onClose);
    })();

    return () => {
      console.info('unmount');
      active = false;
      onFailure?.('');
      if (socket) socket.close();
      socket = null;
    };
  }, [config]);
};

export default useWebSocket;
