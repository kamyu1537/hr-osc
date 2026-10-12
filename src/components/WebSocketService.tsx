import useWebSocket from '../hooks/useWebSocket';
import { ServiceProps } from '../lib/service';

const WebSocketService = ({ setConnected, setHeartRate, setFailure }: ServiceProps) => {
  useWebSocket(
    (heartRate) => setHeartRate(heartRate),
    () => setConnected(true),
    () => setConnected(false),
    setFailure
  );
  return <></>;
};

export default WebSocketService;
