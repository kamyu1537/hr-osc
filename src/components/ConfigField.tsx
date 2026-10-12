import { CheckIcon } from '@heroicons/react/16/solid';
import { ReactNode, useRef, useState } from 'react';
import { defaultConfig, IConfig, saveConfig } from '../lib/config';
import { useConfig } from '../lib/states';

type FieldKey = Exclude<keyof IConfig, 'service_type'>;

export type Parse<T> = (raw: string) => { value: T } | { error: string };

type ConfigFieldProps<K extends FieldKey> = {
  name: K;
  label: string;
  parse: Parse<IConfig[K]>;
  type?: 'text' | 'number';
  hint?: ReactNode;
  prefix?: string;
};

const ConfigField = <K extends FieldKey>({ name, label, parse, type = 'text', hint, prefix }: ConfigFieldProps<K>) => {
  const [raw, setRaw] = useState(() => {
    const stored = String(useConfig.getState().config?.[name] ?? '');
    return prefix && stored.startsWith(prefix) ? stored.slice(prefix.length) : stored;
  });
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = (next: string) => {
    setRaw(next);
    clearTimeout(timer.current);

    const result = parse(next);
    if ('error' in result) {
      setError(result.error);
      setStatus('idle');
      return;
    }

    setError('');
    setStatus('saving');
    timer.current = setTimeout(async () => {
      try {
        await saveConfig({ ...(useConfig.getState().config ?? defaultConfig), [name]: prefix ? prefix + result.value : result.value });
        setStatus('saved');
      } catch (err) {
        console.error(err);
        setError('Could not save');
        setStatus('idle');
      }
    }, 500);
  };

  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;

  return (
    <div className="field">
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      <input
        id={name}
        type={type}
        className="input"
        value={raw}
        aria-invalid={error !== ''}
        aria-describedby={[error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined}
        onChange={(e) => handleChange(e.target.value)}
      />
      {(error || hint || status !== 'idle') && (
        <div className="col-start-2 mt-1 flex min-w-0 items-start">
          <div className="min-w-0">
            {error && (
              <p id={errorId} className="text-[10px] leading-[13px] text-rose-400">
                {error}
              </p>
            )}
            {hint && (
              <p id={hintId} className="min-w-0 text-[10px] leading-[13px] text-neutral-400">
                {hint}
              </p>
            )}
          </div>
          <span aria-live="polite" className="ml-auto shrink-0 text-[10px] leading-[13px] text-neutral-400">
            {!error && status === 'saving' && <span className="pl-2">Saving...</span>}
            {!error && status === 'saved' && (
              <span className="inline-flex items-center gap-0.5 pl-2">
                <CheckIcon className="size-3" aria-hidden="true" />
                Saved
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default ConfigField;
