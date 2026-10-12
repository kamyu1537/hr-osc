import { fetch } from '@tauri-apps/plugin-http';
import { v4 as uuidv4 } from 'uuid';
import { Endpoint } from './service';

type GetWidgetResponse = {
  id: string;
  jsonrpc: string;
  result: {
    ramielUrl: string;
  };

  error?: {};
};

export const widgetHeartRate = (message: string) => (JSON.parse(message) as { data: { heartRate: number } }).data.heartRate;

export const getWidgetEndpoint = async (widgetId: string | undefined): Promise<Endpoint> => {
  if (!widgetId) {
    return { failure: 'noWidgetId', retry: false };
  }

  const requestId = uuidv4();

  const response = await fetch('https://api.stromno.com/v1/api/public/rpc', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: requestId,
      jsonrpc: '2.0',
      method: 'getWidget',
      params: {
        widgetId,
      },
    }),
  });

  if (response.status !== 200) {
    await response.body?.cancel();
    return { failure: 'noWebSocketUrl', retry: true };
  }

  const data = (await response.json()) as GetWidgetResponse;
  if (data.error) {
    return { failure: 'noWebSocketUrl', retry: true };
  }
  return { url: data.result.ramielUrl };
};
