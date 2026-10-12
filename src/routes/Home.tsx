import { HeartIcon } from '@heroicons/react/24/solid';
import { IConfig, serviceLabels } from '../lib/config';
import { getAddr } from '../lib/osc';
import { cn } from '../lib/utils';

type HomeProps = {
  config: IConfig;
  connected: boolean;
  heartRate: number;
  failure: string;
};

const Home = ({ config, connected, heartRate, failure }: HomeProps) => {
  const percent = config.max_heart_rate > 0 ? Math.min(1, Math.max(0, heartRate / config.max_heart_rate)) : 0;

  return (
    <div className="h-full flex flex-col items-center">
      <div className="w-full flex justify-between gap-2 text-xs">
        <span className="text-neutral-400 truncate">{serviceLabels[config.service_type]}</span>
        <span aria-live="polite" className={cn('flex items-center gap-1 shrink-0', connected ? 'text-lime-500' : 'text-neutral-400')}>
          <span className={cn('size-1.5 rounded-full', connected ? 'bg-lime-500' : 'bg-neutral-500')} />
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="grow flex flex-col items-center justify-center">
        <div className="relative">
          {connected && <HeartIcon className="absolute inset-0 w-14 text-red-400 opacity-70 animate-ping" />}
          <HeartIcon className={cn('relative w-14', connected ? 'text-red-400' : 'text-neutral-500')} />
        </div>

        <div className={cn('mt-1 text-2xl', connected ? 'text-red-400' : 'text-neutral-400')}>{heartRate} bpm</div>
        <div className="text-xs text-neutral-400">
          {Math.round(percent * 100)}% of max {config.max_heart_rate}
        </div>
        {failure && <div className="mt-1 text-xs text-rose-400">{failure}</div>}
      </div>

      <div className="text-xs text-neutral-400">OSC → {getAddr(config)}</div>
    </div>
  );
};

export default Home;
