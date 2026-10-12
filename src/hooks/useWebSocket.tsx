import { useEffect } from 'react';
import { getPulsoidEndpoint, pulsoidHeartRate } from '../lib/pulsoid';
import { connected, disconnected, Endpoint, Failure, getTimeoutSeconds, sendOscHeartRate } from '../lib/service';
import { useConfig } from '../lib/states';
import { getWidgetEndpoint, widgetHeartRate } from '../lib/stromno';

const RETRY_BASE_MS = 1000;
const RETRY_MAX_MS = 30000;

const useWebSocket = (onReceiveHeartrate?: (heartRate: number) => void, onConnected?: () => void, onDisconnect?: () => void, onFailure?: (reason: Failure) => void) => {
  const widgetId = useConfig((state) => state.config?.stromno_widget_id);
  const serviceType = useConfig((state) => state.config?.service_type);
  const reconnectRequest = useConfig((state) => state.reconnectRequest);

  useEffect(() => {
    const source =
      serviceType === 'pulsoid'
        ? { getEndpoint: getPulsoidEndpoint, heartRate: pulsoidHeartRate }
        : { getEndpoint: () => getWidgetEndpoint(widgetId), heartRate: widgetHeartRate };

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

    const fail = (failure: Exclude<Failure, ''>, retry: boolean) => {
      markDisconnected();
      onFailure?.(failure);
      if (retry) scheduleRetry();
    };

    const dropSocket = () => {
      if (!socket) return;
      socket.removeEventListener('open', onOpen);
      socket.removeEventListener('error', onError);
      socket.removeEventListener('message', onMessage);
      socket.removeEventListener('close', onClose);
      socket.close();
      socket = null;
    };

    const onSilent = () => {
      dropSocket();
      markDisconnected();
      scheduleRetry();
    };

    const onMessage = (event: MessageEvent<string>) => {
      console.info('WS: message', event.data);
      attempt = 0;
      clearTimeout(disconnectTimer);

      connected(onConnected);
      try {
        const heartRate = source.heartRate(event.data);
        onReceiveHeartrate?.(heartRate);
        sendOscHeartRate(heartRate);
      } catch (err) {
        console.error(err);
      }

      disconnectTimer = setTimeout(onSilent, getTimeoutSeconds());
    };

    const onOpen = () => {
      console.info('WS: open');
    };

    const onError = () => {
      console.error('WS: error');
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

      const endpoint = await source.getEndpoint().catch((err): Endpoint => {
        console.error(err);
        return { failure: 'noWebSocketUrl', retry: true };
      });
      if (cancelled) return;

      if ('failure' in endpoint) {
        console.info('failed to get websocket url');
        fail(endpoint.failure, endpoint.retry);
        return;
      }

      try {
        socket = new WebSocket(endpoint.url);
      } catch (err) {
        console.error(err);
        fail('noWebSocketUrl', true);
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
