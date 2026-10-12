import { useRef, useState } from 'react';
import { defaultConfig, IConfig, saveConfig } from '../lib/config';
import { useConfig } from '../lib/states';

type FieldKey = Exclude<keyof IConfig, 'service_type'>;

export type Parse<T> = (raw: string) => { value: T } | { error: string };

type ConfigFieldProps<K extends FieldKey> = {
  name: K;
  label: string;
  parse: Parse<IConfig[K]>;
  type?: 'text' | 'number';
  hint?: string;
  prefix?: string;
};

const ConfigField = <K extends FieldKey>({ name, label, parse, type = 'text', hint, prefix }: ConfigFieldProps<K>) => {
  const [raw, setRaw] = useState(() => {
    const stored = String(useConfig.getState().config?.[name] ?? '');
    if (!prefix) return stored;
    return stored.startsWith(prefix) ? stored.slice(prefix.length) : stored.slice(stored.lastIndexOf('/') + 1);
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
    <div>
      <div className="mb-0.5 flex justify-between text-[11px] leading-[14px]">
        <label htmlFor={name} className="text-neutral-300">
          {label}
        </label>
        <span aria-live="polite" className="text-[10px] text-neutral-400">
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : ''}
        </span>
      </div>
      <input
        id={name}
        type={type}
        className="input"
        value={raw}
        aria-invalid={error !== ''}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        onChange={(e) => handleChange(e.target.value)}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-[11px] leading-[13px] text-rose-400">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="mt-1 truncate text-[10px] leading-[13px] text-neutral-400">
            {hint}
          </p>
        )
      )}
    </div>
  );
};

export default ConfigField;
