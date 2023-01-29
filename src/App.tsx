import { useEffect, useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HttpService from './components/HttpService';
import Loading from './components/Loading';
import NavBar from './components/NavBar';
import WebSocketService from './components/WebSocketService';
import useUpdate from './hooks/useUpdate';
import { getConfig } from './lib/config';
import { useConfig } from './lib/states';
import About from './routes/About';
import Home from './routes/Home';
import Settings from './routes/Settings';

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
      {config?.service_type === 'http' && <HttpService setConnected={setConnected} setHeartRate={setHeartRate} />}
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
