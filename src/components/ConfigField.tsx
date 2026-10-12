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
};

const ConfigField = <K extends FieldKey>({ name, label, parse, type = 'text', hint }: ConfigFieldProps<K>) => {
  const [raw, setRaw] = useState(() => String(useConfig.getState().config?.[name] ?? ''));
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
        await saveConfig({ ...(useConfig.getState().config ?? defaultConfig), [name]: result.value });
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
      <div className="mb-0.5 flex justify-between text-xs">
        <label htmlFor={name} className="text-neutral-300">
          {label}
        </label>
        <span aria-live="polite" className="text-neutral-400">
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
        <p id={errorId} className="mt-0.5 text-xs text-rose-400">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="mt-0.5 text-[11px] text-neutral-400">
            {hint}
          </p>
        )
      )}
    </div>
  );
};

export default ConfigField;
