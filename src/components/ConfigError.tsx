import { ArrowPathIcon } from '@heroicons/react/16/solid';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { useStrings } from '../lib/i18n';

type ConfigErrorProps = {
  message: string;
  path: string;
  onRetry: () => void;
};

const ConfigError = ({ message, path, onRetry }: ConfigErrorProps) => {
  const t = useStrings();

  return (
    <div role="alert" className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
      <ExclamationTriangleIcon className="size-8 text-neutral-500" aria-hidden="true" />
      <h1 className="text-sm text-neutral-200">{t.configError.title}</h1>
      <p className="max-h-[52px] max-w-full overflow-y-auto text-[10px] leading-[13px] break-all text-rose-400 select-text">
        {message}
      </p>
      {path && (
        <p className="max-w-full text-[10px] leading-[13px] break-all text-neutral-400">
          <span className="text-neutral-500">{t.configError.file}</span>{' '}
          <span className="select-text">{path}</span>
        </p>
      )}
      <button className="btn mt-1" onClick={onRetry}>
        <ArrowPathIcon className="size-3" aria-hidden="true" />
        {t.configError.retry}
      </button>
    </div>
  );
};

export default ConfigError;
