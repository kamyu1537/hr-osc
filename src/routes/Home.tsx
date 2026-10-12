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

const RING_CIRCUMFERENCE = 2 * Math.PI * 16;

const Home = ({ config, connected, heartRate, failure }: HomeProps) => {
  const percent = config.max_heart_rate > 0 ? Math.min(1, Math.max(0, heartRate / config.max_heart_rate)) : 0;

  return (
    <div className="h-full flex flex-col items-center">
      <div className="w-full flex justify-between gap-2 text-[11px]">
        <span className="truncate rounded-sm bg-neutral-900 px-2 py-px text-neutral-400">
          {serviceLabels[config.service_type]}
        </span>
        <span
          aria-live="polite"
          className={cn('shrink-0 rounded-sm bg-neutral-900 px-2 py-px', connected ? 'text-lime-500' : 'text-neutral-400')}
        >
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="relative mt-2 size-30">
        <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="18" cy="18" r="16" fill="none" strokeWidth="2.5" className="stroke-neutral-900" />
          {connected && percent > 0 && (
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={`${percent * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
              className="stroke-red-400 transition-[stroke-dasharray] duration-500"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <HeartIcon className={cn('size-8', connected ? 'text-red-400' : 'text-neutral-500')} />
          <span className={cn('text-[20px]', connected ? 'text-red-400' : 'text-neutral-400')}>{heartRate}</span>
          {connected && <span className="text-[10px] text-neutral-400">{Math.round(percent * 100)}%</span>}
        </div>
      </div>

      <div className={cn('mt-1 text-center text-[11px]', failure ? 'text-rose-400' : 'text-neutral-400')}>
        {failure || `OSC ${getAddr(config)}`}
      </div>
    </div>
  );
};

export default Home;
