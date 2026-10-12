import { useEffect } from 'react';
import { connected, disconnected, Failure, getTimeoutSeconds, sendOscHeartRate } from '../lib/service';
import { useConfig } from '../lib/states';
import { getWebSocketUrl } from '../lib/stromno';

type HeartRateData = {
  data: {
    heartRate: number;
  };
};

const RETRY_BASE_MS = 1000;
const RETRY_MAX_MS = 30000;

const useWebSocket = (onReceiveHeartrate?: (heartRate: number) => void, onConnected?: () => void, onDisconnect?: () => void, onFailure?: (reason: Failure) => void) => {
  const widgetId = useConfig((state) => state.config?.stromno_widget_id);
  const serviceType = useConfig((state) => state.config?.service_type);
  const reconnectRequest = useConfig((state) => state.reconnectRequest);

  useEffect(() => {
    if (!widgetId) {
      onDisconnect?.();
      onFailure?.('noWidgetId');
      return () => onFailure?.('');
    }

    let cancelled = false;
    let socket: WebSocket | null = null;
    let disconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;

    const markDisconnected = () => {
      clearTimeout(disconnectTimer);
      disconnected(onDisconnect);
    };

    const scheduleRetry = () => {
      clearTimeout(retryTimer);
      retryTimer = setTimeout(connect, Math.min(RETRY_BASE_MS * 2 ** attempt, RETRY_MAX_MS));
      attempt++;
    };

    const failConnect = () => {
      markDisconnected();
      onFailure?.('noWebSocketUrl');
      scheduleRetry();
    };

    const onMessage = (event: MessageEvent<string>) => {
      console.info('WS: message', event.data);
      attempt = 0;
      clearTimeout(disconnectTimer);

      connected(onConnected);
      try {
        const json = JSON.parse(event.data) as HeartRateData;
        onReceiveHeartrate?.(json.data.heartRate);
        sendOscHeartRate(json.data.heartRate);
      } catch (err) {
        console.error(err);
      }

      disconnectTimer = setTimeout(markDisconnected, getTimeoutSeconds());
    };

    const onOpen = () => {
      console.info('WS: open');
    };

    const onError = (error: Event) => {
      console.error('WS: error', error);
    };

    const onClose = () => {
      console.info('WS: closed');
      socket = null;
      if (cancelled) return;
      markDisconnected();
      scheduleRetry();
    };

    const connect = async () => {
      console.info('connecting to websocket');

      const wsUrl = await getWebSocketUrl(widgetId).catch((err) => {
        console.error(err);
        return '';
      });
      if (cancelled) return;

      if (!wsUrl) {
        console.info('failed to get websocket url');
        failConnect();
        return;
      }

      try {
        socket = new WebSocket(wsUrl);
      } catch (err) {
        console.error(err);
        failConnect();
        return;
      }
      onFailure?.('');
      socket.addEventListener('open', onOpen);
      socket.addEventListener('error', onError);
      socket.addEventListener('message', onMessage);
      socket.addEventListener('close', onClose);
    };

    connect();

    return () => {
      console.info('unmount');
      cancelled = true;
      clearTimeout(retryTimer);
      clearTimeout(disconnectTimer);
      socket?.close();
      disconnected(onDisconnect);
      onFailure?.('');
    };
  }, [widgetId, serviceType, reconnectRequest]);
};

export default useWebSocket;
