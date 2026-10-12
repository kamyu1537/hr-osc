import { useEffect, useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
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
  const [failure, setFailure] = useState('');
  const { config, setConfig } = useConfig();

  useEffect(() => {
    (async () => {
      setConfig(await getConfig());
      await checkUpdate();
      setLoaded(true);
    })();
  }, []);

  if (!loaded || config == null) {
    return <Loading />;
  }

  return (
    <MemoryRouter>
      {update && Update}
      {config.service_type === 'http' && (
        <HttpService setConnected={setConnected} setHeartRate={setHeartRate} setFailure={setFailure} />
      )}
      {config.service_type === 'stromno' && (
        <WebSocketService setConnected={setConnected} setHeartRate={setHeartRate} setFailure={setFailure} />
      )}

      <main className="min-h-0 grow p-2">
        <Routes>
          <Route path="/" element={<Home config={config} connected={connected} heartRate={heartRate} failure={failure} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <NavBar />
    </MemoryRouter>
  );
};

export default App;
