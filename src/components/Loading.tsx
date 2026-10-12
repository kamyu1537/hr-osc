import { HeartIcon } from '@heroicons/react/24/solid';

const Loading = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-neutral-400">
      <HeartIcon className="w-8 text-neutral-500 animate-pulse" />
      <div className="text-sm">Loading...</div>
    </div>
  );
};

export default Loading;
