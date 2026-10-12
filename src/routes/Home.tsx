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
        <span className="truncate rounded-sm bg-neutral-900 px-1.5 py-px text-neutral-300">
          {serviceLabels[config.service_type]}
        </span>
        <span
          aria-live="polite"
          className={cn('shrink-0 rounded-sm bg-neutral-900 px-1.5 py-px', connected ? 'text-lime-500' : 'text-neutral-400')}
        >
          {connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="relative mt-1.5 size-30">
        <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="18" cy="18" r="16" fill="none" strokeWidth="2" className="stroke-neutral-800" />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${percent * RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
            className={cn('transition-[stroke-dasharray] duration-500', percent > 0 ? 'stroke-red-400' : 'stroke-transparent')}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="relative">
            {connected && <HeartIcon className="absolute inset-0 w-7 text-red-400 opacity-70 animate-ping" />}
            <HeartIcon className={cn('relative w-7', connected ? 'text-red-400' : 'text-neutral-500')} />
          </div>
          <div className={cn('text-xl leading-tight', connected ? 'text-red-400' : 'text-neutral-400')}>
            {heartRate} <span className="text-xs">bpm</span>
          </div>
          <div className="text-[11px] text-neutral-400">{Math.round(percent * 100)}%</div>
        </div>
      </div>

      <div className="mt-auto text-center text-[11px] leading-snug">
        {failure && <div className="text-rose-400">{failure}</div>}
        <div className="text-neutral-400">
          OSC → {getAddr(config)} · max {config.max_heart_rate} bpm
        </div>
      </div>
    </div>
  );
};

export default Home;
