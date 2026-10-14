import { useEffect, useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import ConfigError from './components/ConfigError';
import HttpService from './components/HttpService';
import Loading from './components/Loading';
import NavBar from './components/NavBar';
import WebSocketService from './components/WebSocketService';
import useUpdate from './hooks/useUpdate';
import { configFilePath, getConfig, services } from './lib/config';
import { useLanguage } from './lib/i18n';
import { disconnected, Failure } from './lib/service';
import { useConfig } from './lib/states';
import About from './routes/About';
import Home from './routes/Home';
import Settings from './routes/Settings';

const App = () => {
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState<{ message: string; path: string } | null>(null);
  const [update, checkUpdate, Update] = useUpdate();
  const [connected, setConnected] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [failure, setFailure] = useState<Failure>('');
  const { config, setConfig } = useConfig();
  const language = useLanguage();

  const load = async () => {
    setLoadError(null);
    try {
      setConfig(await getConfig());
      setLoadError(null);
    } catch (err) {
      console.error(err);
      setLoadError({ message: String(err), path: await configFilePath().catch(() => '') });
      return;
    }
    setLoaded(true);
    checkUpdate();
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (config && !connected) disconnected();
  }, [connected, config?.osc_client_host, config?.osc_client_port, config?.osc_path_connected]);

  if (loadError) {
    return <ConfigError {...loadError} onRetry={load} />;
  }

  if (!loaded || config == null) {
    return <Loading />;
  }

  return (
    <MemoryRouter>
      {update && Update}
      {services[config.service_type].kind === 'http' ? (
        <HttpService setConnected={setConnected} setHeartRate={setHeartRate} setFailure={setFailure} />
      ) : (
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
