import { HeartIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { cn } from '../lib/utils';

const Home = ({ connected, heartRate }: { connected: boolean; heartRate: number }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="grow"></div>

      {connected && (
        <div className="absolute animate-ping mb-[105px]">
          <HeartIcon className="w-14 text-red-400 opacity-70" />
        </div>
      )}
      <HeartIcon className={cn('w-14', connected ? 'text-red-400' : 'text-gray-500')} />

      <div className="mt-3 text-center">
        <h1 className={cn('text-xl', connected ? 'text-red-400' : 'text-gray-500')}>{heartRate} bpm</h1>
        <div className="text-sm text-gray-600">({(heartRate / 200).toFixed(2)})</div>
      </div>

      <div className="grow"></div>
      <div className="text-center text-sm mb-2">
        Connection Status
        <div className={`text-xs ${connected ? 'text-lime-500' : 'text-gray-600'}`}>
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
    </div>
  );
};

export default Home;
