import { HeartIcon } from '@heroicons/react/24/solid';
import { IConfig, services } from '../lib/config';
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
        <span className={cn('truncate rounded-sm border bg-neutral-900 px-2 py-px', services[config.service_type].chip)}>
          {services[config.service_type].label}
        </span>
        <span
          aria-live="polite"
          className={cn(
            'shrink-0 inline-flex items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900 px-2 py-px',
            connected ? 'text-neutral-200' : 'text-neutral-400'
          )}
        >
          <span className={cn('size-1.5 rounded-full', connected ? 'bg-lime-500' : 'bg-neutral-600')} />
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="relative mt-3 size-30">
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
          <span className={cn('text-[20px] tabular-nums', connected ? 'text-red-400' : 'text-neutral-400')}>
            {heartRate}
          </span>
          {connected && <span className="text-[10px] tabular-nums text-neutral-500">{Math.round(percent * 100)}%</span>}
        </div>
      </div>

      <div className="mt-4 text-center text-[11px]">
        {failure ? (
          <span className="text-rose-400">{failure}</span>
        ) : (
          <>
            <span className="text-neutral-500">OSC</span>{' '}
            <span className="tabular-nums text-neutral-300">{getAddr(config)}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
