<script>
  import produce                                              from 'immer';
  import { configStore, receiveDataStore, websocketUrlStore } from '../utils/stores';

  let once;

  let ws;
  let config;
  let timeout;
  let lastAddress;
  let receive = { connected: false, heartRate: 0 };

  const startTimer = () => {
    if (!receive) return;
    if (!config) return;

    timeout = setTimeout(() => {
      console.info('timeout');
      receiveDataStore.set(produce(receive, draft => {
        draft.connected = false;
        draft.heartRate = 0;
      }));
    }, (config.timeout || 10) * 1000);
  };

  const connect = (address) => {
    if (!address) return;
    if (ws) {
      console.info('close');
      ws.close();
      ws = null;
    }

    ws = new WebSocket(address);
    ws.onopen = () => {
      console.info('opened');
    };
    ws.onmessage = (event) => {
      console.info(event.data);
      try {
        const receiveData = JSON.parse(event.data);
        if (receiveData) {
          const data = receiveData.data;
          let heartRate = data.heartRate || 0;

          receiveDataStore.set(produce(receive, draft => {
            draft.connected = true;
            draft.heartRate = heartRate;
          }));
        }
        if (timeout) clearTimeout(timeout);
        startTimer();
      } catch (e) {
        console.error(e);
      }
    };
    ws.onerror = (event) => {
      console.error(event);
    };
    ws.onclose = () => {
      console.info('closed');
      setTimeout(() => connect(address), 0);
    };
  };

  const onWebsocketUrlChange = (newAddress) => {
    if (lastAddress === newAddress) return;
    lastAddress = newAddress;
    connect(newAddress);
  };

  configStore.subscribe(value => {
    config = value;

    if (!once) {
      receiveDataStore.subscribe(value => {
        window.go.main.App.SendOSCBool(config.osc_path_connected, value.connected).then();
        window.go.main.App.SendOSCFloat(config.osc_path_percent, value.heartRate / (config.max_heart_rate || 200)).then();
      });

      websocketUrlStore.subscribe(url => {
        onWebsocketUrlChange(url);
      });

      once = true;
    }
  });
</script>
