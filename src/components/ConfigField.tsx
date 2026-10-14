import { CheckIcon } from '@heroicons/react/16/solid';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { defaultConfig, IConfig, saveConfig } from '../lib/config';
import { Strings, useStrings } from '../lib/i18n';
import { useConfig } from '../lib/states';

type FieldKey = Exclude<keyof IConfig, 'service_type' | 'language'>;

type ErrorKey = keyof Strings['errors'];

type FieldState =
  | { status: 'idle' | 'saved' | 'failed' }
  | { status: 'saving'; raw: string }
  | { status: 'invalid'; raw: string; error: ErrorKey };

export type Parse<T> = (raw: string) => { value: T } | { error: ErrorKey };

type ConfigFieldProps<K extends FieldKey> = {
  name: K;
  label: string;
  parse: Parse<IConfig[K]>;
  type?: 'text' | 'number';
  hint?: ReactNode;
  prefix?: string;
  failure?: ErrorKey;
};

const ConfigField = <K extends FieldKey>({ name, label, parse, type = 'text', hint, prefix, failure }: ConfigFieldProps<K>) => {
  const stored = String(useConfig((state) => state.config?.[name] ?? ''));
  const [field, setField] = useState<FieldState>({ status: 'idle' });
  const t = useStrings();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const revision = useRef(0);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const handleChange = (next: string) => {
    const currentRevision = ++revision.current;
    clearTimeout(timer.current);

    const result = parse(next);
    if ('error' in result) {
      setField({ status: 'invalid', raw: next, error: result.error });
      return;
    }

    setField({ status: 'saving', raw: next });
    timer.current = setTimeout(async () => {
      try {
        await saveConfig({ ...(useConfig.getState().config ?? defaultConfig), [name]: prefix ? prefix + result.value : result.value });
        if (mounted.current && revision.current === currentRevision) {
          setField({ status: 'saved' });
        }
      } catch (err) {
        console.error(err);
        if (mounted.current && revision.current === currentRevision) {
          setField({ status: 'failed' });
        }
      }
    }, 500);
  };

  const storedRaw = prefix && stored.startsWith(prefix) ? stored.slice(prefix.length) : stored;
  const raw = 'raw' in field ? field.raw : storedRaw;
  const error = field.status === 'invalid' ? field.error : field.status === 'failed' ? 'save' : '';
  const shownError = error || failure;
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
        aria-invalid={!!shownError}
        aria-describedby={[shownError && errorId, hint && hintId].filter(Boolean).join(' ') || undefined}
        onChange={(e) => handleChange(e.target.value)}
      />
      {(shownError || hint || field.status === 'saving' || field.status === 'saved') && (
        <div className="col-start-2 mt-1 flex min-w-0 items-start">
          <div className="min-w-0">
            {shownError && (
              <p id={errorId} className="text-[10px] leading-[13px] text-rose-400">
                {t.errors[shownError]}
              </p>
            )}
            {hint && (
              <p id={hintId} className="min-w-0 text-[10px] leading-[13px] text-neutral-400">
                {hint}
              </p>
            )}
          </div>
          <span aria-live="polite" className="ml-auto shrink-0 text-[10px] leading-[13px] text-neutral-400">
            {field.status === 'saving' && <span className="pl-2">{t.settings.saving}</span>}
            {field.status === 'saved' && (
              <span className="inline-flex items-center gap-0.5 pl-2">
                <CheckIcon className="size-3" aria-hidden="true" />
                {t.settings.saved}
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default ConfigField;
