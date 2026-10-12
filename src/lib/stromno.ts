import { fetch } from '@tauri-apps/plugin-http';
import { v4 as uuidv4 } from 'uuid';

type GetWidgetResponse = {
  id: string;
  jsonrpc: string;
  result: {
    ramielUrl: string;
  };

  error?: {};
};

export const getWebSocketUrl = async (widgetId: string) => {
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
    return '';
  }

  const data = (await response.json()) as GetWidgetResponse;
  if (data.error) {
    return '';
  }
  return data.result.ramielUrl;
};
