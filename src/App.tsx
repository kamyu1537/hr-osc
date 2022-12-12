import { useEffect, useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Loading from './components/Loading';
import NavBar from './components/NavBar';
import useUpdate from './hooks/useUpdate';
import useWebSocket from './hooks/useWebSocket';
import { getConfig } from './lib/config';
import About from './routes/About';
import Home from './routes/Home';
import Settings from './routes/Settings';
import { useConfig } from './lib/states';

type WSProps = {
  setConnected: (connected: boolean) => void;
  setHeartRate: (heartRate: number) => void;
};
const WS = ({ setConnected, setHeartRate }: WSProps) => {
  useWebSocket(
    (heartRate) => setHeartRate(heartRate),
    () => setConnected(true),
    () => setConnected(false),
  );
  return <></>;
};

const App = () => {
  const [loaded, setLoaded] = useState(false);
  const [update, checkUpdate, Update] = useUpdate();
  const [connected, setConnected] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const setConfig = useConfig((state) => state.setConfig);

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
      <WS setConnected={setConnected} setHeartRate={setHeartRate} />

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
