import { useEffect, useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Loading from './components/Loading';
import NavBar from './components/NavBar';
import useUpdate from './hooks/useUpdate';
import useWebSocket from './hooks/useWebSocket';
import { getConfig } from './lib/config';
import { startHttpServer, stopHttpServer } from './lib/http_server';
import { useConfig } from './lib/states';
import About from './routes/About';
import Home from './routes/Home';
import Settings from './routes/Settings';

type WSProps = {
  setConnected: (connected: boolean) => void;
  setHeartRate: (heartRate: number) => void;
};

const WebSocketService = ({ setConnected, setHeartRate }: WSProps) => {
  useWebSocket(
    (heartRate) => setHeartRate(heartRate),
    () => setConnected(true),
    () => setConnected(false)
  );
  return <></>;
};

const HttpService = () => {
  const config = useConfig((state) => state.config);
  const [serverPort, setServerPort] = useState(config?.http_server_port || 0);

  useEffect(() => {
    if (config == null) return;

    const port = config.http_server_port || 0;
    if (serverPort === port) return;

    setServerPort(port);
  }, [config]);

  useEffect(() => {
    if (serverPort !== 0 && config != null) {
      startHttpServer(config);
    }

    return () => {
      stopHttpServer();
    };
  }, [serverPort]);

  return <></>;
};

const App = () => {
  const [loaded, setLoaded] = useState(false);
  const [update, checkUpdate, Update] = useUpdate();
  const [connected, setConnected] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const { config, setConfig } = useConfig();

  useEffect(() => {
    (async () => {
      setConfig(await getConfig());
      await checkUpdate();
      setLoaded(true);
    })();
  }, []);

  if (!loaded) {
    return <Loading />;
  }

  if (update) {
    return <>{Update}</>;
  }

  return (
    <MemoryRouter>
      <NavBar />
      {config?.service_type === 'http' && <HttpService />}
      {config?.service_type === 'stromno' && (
        <WebSocketService setConnected={setConnected} setHeartRate={setHeartRate} />
      )}

      <main className="h-[calc(100%_-_2em)]">
        <Routes>
          <Route path="/" element={<Home connected={connected} heartRate={heartRate} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
    </MemoryRouter>
  );
};

export default App;
