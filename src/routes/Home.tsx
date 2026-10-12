import { HeartIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/16/solid';
import { useLayoutEffect, useRef } from 'react';
import useSourceAction from '../hooks/useSourceAction';
import { IConfig, services } from '../lib/config';
import { useStrings } from '../lib/i18n';
import { getAddr } from '../lib/osc';
import { Failure, heartRatePercent } from '../lib/service';
import { useConfig } from '../lib/states';
import { cn } from '../lib/utils';

type HomeProps = {
  config: IConfig;
  connected: boolean;
  heartRate: number;
  failure: Failure;
};

const RING_CIRCUMFERENCE = 2 * Math.PI * 16;

const Heartbeat = ({ bpm }: { bpm: number }) => {
  const ref = useRef<SVGSVGElement>(null);
  const previousMs = useRef(60000 / bpm);
  const ms = 60000 / bpm;

  useLayoutEffect(() => {
    const [beat] = ref.current?.getAnimations() ?? [];
    if (beat?.currentTime != null) {
      beat.currentTime = ((Number(beat.currentTime) % previousMs.current) * ms) / previousMs.current;
    }
    previousMs.current = ms;
  }, [ms]);

  return (
    <HeartIcon
      ref={ref}
      style={{ animationDuration: `${ms}ms` }}
      className="size-8 text-red-400 animate-heartbeat"
    />
  );
};

const Home = ({ config, connected, heartRate, failure }: HomeProps) => {
  const t = useStrings();
  const recovery = useSourceAction();
  const percent = heartRatePercent(heartRate, config.max_heart_rate);
  const addr = getAddr(config);
  const oscFailed = useConfig((state) => state.oscFailure) === addr;

  return (
    <div className="h-full flex flex-col items-center">
      <div className="w-full flex justify-between gap-2 text-[11px]">
        <span className={cn('truncate rounded-sm border bg-neutral-900 px-2 py-px', services[config.service_type].chip)}>
          {services[config.service_type].label}
        </span>
        <div className="flex shrink-0 gap-1.5">
          {!connected && (
            <button
              onClick={recovery.run}
              className="inline-flex items-center gap-1 rounded-sm border border-neutral-400/30 bg-neutral-900 px-2 py-px text-neutral-300 transition-colors hover:border-neutral-400/60 hover:text-white"
            >
              <ArrowPathIcon className="size-3" aria-hidden="true" />
              {recovery.label}
            </button>
          )}
          <span
            aria-live="polite"
            className={cn(
              'rounded-sm border bg-neutral-900 px-2 py-px',
              connected ? 'border-lime-500/30 text-lime-500' : 'border-neutral-400/30 text-neutral-400'
            )}
          >
            {connected ? t.home.connected : t.home.disconnected}
          </span>
        </div>
      </div>

      <div className="relative mt-auto size-30">
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
          {connected && heartRate > 0 ? (
            <Heartbeat bpm={heartRate} />
          ) : (
            <HeartIcon className={cn('size-8', connected ? 'text-red-400' : 'text-neutral-500')} />
          )}
          <span className={cn('text-[20px] tabular-nums', connected ? 'text-red-400' : 'text-neutral-400')}>
            {connected ? heartRate : '-'}
          </span>
          {connected && <span className="text-[10px] tabular-nums text-neutral-500">{Math.round(percent * 100)}%</span>}
        </div>
      </div>

      <div className="mt-4 mb-auto text-center text-[11px]">
        {failure ? (
          <span className="text-rose-400">
            {failure === 'httpPort' ? t.failures.httpPort(config.http_server_port) : t.failures[failure]}
          </span>
        ) : (
          <>
            <span className={oscFailed ? 'text-rose-400' : 'text-neutral-500'}>{oscFailed ? t.home.oscFailed : 'OSC'}</span>{' '}
            <span className={cn('tabular-nums', oscFailed ? 'text-rose-400' : 'text-neutral-300')}>{addr}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
