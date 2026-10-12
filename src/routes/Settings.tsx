import { CheckIcon, ChevronDownIcon } from '@heroicons/react/16/solid';
import { openUrl } from '@tauri-apps/plugin-opener';
import { ComponentType, useEffect, useRef, useState } from 'react';
import ConfigField, { Parse } from '../components/ConfigField';
import { defaultConfig, IConfig, saveConfig, services } from '../lib/config';
import { stopHttpServer } from '../lib/http_server';
import { Language, LanguageSetting, Strings, useStrings } from '../lib/i18n';
import { getAddr } from '../lib/osc';
import {
  getPulsoidToken,
  pollPulsoidToken,
  PulsoidDeviceCode,
  requestPulsoidDeviceCode,
  setPulsoidToken,
} from '../lib/pulsoid';
import { useConfig } from '../lib/states';
import useSourceAction from '../hooks/useSourceAction';
import { cn } from '../lib/utils';

const port: Parse<number> = (raw) => {
  const value = Number(raw);
  return raw.trim() !== '' && Number.isInteger(value) && value >= 1 && value <= 65535
    ? { value }
    : { error: 'port' };
};

const positive: Parse<number> = (raw) => {
  const value = Number(raw);
  return raw.trim() !== '' && Number.isFinite(value) && value > 0
    ? { value }
    : { error: 'positive' };
};

const seconds: Parse<number> = (raw) => {
  const value = Number(raw);
  return raw.trim() !== '' && Number.isInteger(value) && value >= 1
    ? { value }
    : { error: 'seconds' };
};

const required: Parse<string> = (raw) => (raw.trim() ? { value: raw.trim() } : { error: 'required' });

const OSC_PREFIX = '/avatar/parameters/';

const optional: Parse<string> = (raw) => ({ value: raw.trim() });

const latestConfig = () => useConfig.getState().config ?? defaultConfig;

const handleServiceChange = (service: IConfig['service_type']) => {
  const saving = saveConfig({ ...latestConfig(), service_type: service });
  if (services[service].kind !== 'http') {
    stopHttpServer();
  }
  return saving;
};

const useSaveFailure = () => {
  const [failed, setFailed] = useState(false);
  const track = (saving: Promise<void>) =>
    saving.then(
      () => setFailed(false),
      (err) => {
        console.error(err);
        setFailed(true);
      }
    );
  return [failed, track] as const;
};

const SaveError = ({ id }: { id: string }) => {
  const t = useStrings();
  return (
    <p id={id} className="col-start-2 mt-1 text-[10px] leading-[13px] text-rose-400">
      {t.errors.save}
    </p>
  );
};

const TokenField = ({ tokenUrl }: { tokenUrl: string }) => {
  const t = useStrings();
  const requestReconnect = useConfig((state) => state.requestReconnect);
  const [token, setToken] = useState('');
  const [failed, setFailed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const edited = useRef(false);
  const lastSave = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    getPulsoidToken().then(
      (saved) => {
        if (!edited.current) setToken(saved);
      },
      (err) => {
        console.error(err);
        setFailed(true);
      },
    );
  }, []);

  const handleChange = (next: string, delay = 500) => {
    edited.current = true;
    setToken(next);
    setFailed(false);
    setStatus('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const save = lastSave.current.then(() => setPulsoidToken(next.trim()));
      const settled = save.catch(() => undefined);
      lastSave.current = settled;
      save.then(
        () => {
          requestReconnect();
          if (lastSave.current === settled) setStatus('saved');
        },
        (err) => {
          console.error(err);
          if (lastSave.current !== settled) return;
          setFailed(true);
          setStatus('idle');
        },
      );
    }, delay);
  };

  return (
    <div className="field">
      <label htmlFor="pulsoid_token" className="field-label">
        {t.settings.token}
      </label>
      <input
        id="pulsoid_token"
        type="password"
        autoComplete="off"
        className="input"
        value={token}
        aria-invalid={failed}
        aria-describedby={failed ? 'pulsoid_token-error pulsoid_token-hint' : 'pulsoid_token-hint'}
        onChange={(e) => handleChange(e.target.value)}
      />
      <div className="col-start-2 mt-1 flex min-w-0 items-start">
        <div className="min-w-0">
          {failed && (
            <p id="pulsoid_token-error" className="text-[10px] leading-[13px] text-rose-400">
              {t.errors.save}
            </p>
          )}
          <p id="pulsoid_token-hint" className="min-w-0 text-[10px] leading-[13px] text-neutral-400">
            <button className="link" onClick={() => openUrl(tokenUrl)}>
              {t.settings.tokenHint(new URL(tokenUrl).host)}
            </button>
          </p>
        </div>
        <span aria-live="polite" className="ml-auto shrink-0 text-[10px] leading-[13px] text-neutral-400">
          {!failed && status === 'saving' && <span className="pl-2">{t.settings.saving}</span>}
          {!failed && status === 'saved' && (
            <span className="inline-flex items-center gap-0.5 pl-2">
              <CheckIcon className="size-3" aria-hidden="true" />
              {t.settings.saved}
            </span>
          )}
        </span>
      </div>
      <PulsoidLogin onToken={(next) => handleChange(next, 0)} />
    </div>
  );
};

type LoginState =
  | { step: 'idle' }
  | { step: 'waiting'; device?: PulsoidDeviceCode }
  | { step: 'done' }
  | { step: 'failed'; reason: 'denied' | 'expired' | 'error' };

const PulsoidLogin = ({ onToken }: { onToken: (token: string) => void }) => {
  const t = useStrings();
  const [state, setState] = useState<LoginState>({ step: 'idle' });
  const controller = useRef<AbortController>(undefined);

  useEffect(() => () => controller.current?.abort(), []);

  const start = async () => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setState({ step: 'waiting' });
    try {
      const device = await requestPulsoidDeviceCode();
      current.signal.throwIfAborted();
      setState({ step: 'waiting', device });
      openUrl(device.verificationUriComplete).catch(console.error);
      const result = await pollPulsoidToken(device, current.signal);
      current.signal.throwIfAborted();
      if ('token' in result) {
        onToken(result.token);
        setState({ step: 'done' });
      } else {
        setState({ step: 'failed', reason: result.failure });
      }
    } catch (err) {
      if (current.signal.aborted) return;
      console.error(err);
      setState({ step: 'failed', reason: 'error' });
    }
  };

  const cancel = () => {
    controller.current?.abort();
    setState({ step: 'idle' });
  };

  const device = state.step === 'waiting' ? state.device : undefined;

  return (
    <div className="col-start-2 mt-1.5 flex min-w-0 flex-col items-start gap-1">
      {state.step === 'waiting' ? (
        <button className="btn" onClick={cancel}>
          {t.settings.login.cancel}
        </button>
      ) : (
        <button className="btn" onClick={start}>
          {t.settings.login.start}
        </button>
      )}
      <p aria-live="polite" className="min-w-0 text-[10px] leading-[13px]">
        {state.step === 'waiting' && (
          <span className="text-neutral-400">
            {t.settings.login.waiting}
            {device && (
              <>
                {' '}
                <button className="link" onClick={() => openUrl(device.verificationUriComplete)}>
                  {t.settings.login.reopen}
                </button>
              </>
            )}
          </span>
        )}
        {state.step === 'done' && (
          <span className="inline-flex items-center gap-0.5 text-neutral-400">
            <CheckIcon className="size-3" aria-hidden="true" />
            {t.settings.login.success}
          </span>
        )}
        {state.step === 'failed' && <span className="text-rose-400">{t.settings.login[state.reason]}</span>}
      </p>
    </div>
  );
};

const SourcePanel = () => {
  const t = useStrings();
  const serviceType = useConfig((state) => state.config?.service_type ?? defaultConfig.service_type);
  const httpPort = useConfig((state) => state.config?.http_server_port ?? defaultConfig.http_server_port);
  const httpLan = useConfig((state) => state.config?.http_server_lan ?? defaultConfig.http_server_lan);
  const service = services[serviceType];
  const [saveFailed, trackSave] = useSaveFailure();
  const [lanSaveFailed, trackLanSave] = useSaveFailure();

  return (
    <>
      <div className="field">
        <label htmlFor="service_type" className="field-label">
          {t.settings.source}
        </label>
        <div className="relative">
          <select
            id="service_type"
            className="input"
            value={serviceType}
            aria-invalid={saveFailed}
            aria-describedby={saveFailed ? 'service_type-error' : undefined}
            onChange={(e) => trackSave(handleServiceChange(e.target.value as IConfig['service_type']))}
          >
            {Object.entries(services).map(([value, { label }]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDownIcon
            className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
        </div>
        {saveFailed && <SaveError id="service_type-error" />}
      </div>

      {service.kind === 'http' ? (
        <>
          <ConfigField
            key="http_server_port"
            name="http_server_port"
            label={t.settings.httpPort}
            type="number"
            parse={port}
            hint={t.settings.httpHint(`http://127.0.0.1:${httpPort}`)}
          />
          <div className="field">
            <label htmlFor="http_server_lan" className="field-label">
              {t.settings.httpLan}
            </label>
            <div className="flex h-6 items-center">
              <input
                id="http_server_lan"
                type="checkbox"
                className="size-3.5 accent-neutral-200"
                checked={httpLan}
                aria-invalid={lanSaveFailed}
                aria-describedby={lanSaveFailed ? 'http_server_lan-error http_server_lan-hint' : 'http_server_lan-hint'}
                onChange={(e) => trackLanSave(saveConfig({ ...latestConfig(), http_server_lan: e.target.checked }))}
              />
            </div>
            {lanSaveFailed && <SaveError id="http_server_lan-error" />}
            <p id="http_server_lan-hint" className="col-start-2 mt-1 text-[10px] leading-[13px] text-neutral-400">
              {t.settings.httpLanHint}
            </p>
          </div>
        </>
      ) : service.kind === 'token' ? (
        <TokenField tokenUrl={service.tokenUrl} />
      ) : (
        <ConfigField
          key="stromno_widget_id"
          name="stromno_widget_id"
          label={t.settings.widgetId}
          parse={optional}
          hint={
            <button className="link" onClick={() => openUrl(service.widgetIdUrl)}>
              {t.settings.widgetHint(new URL(service.widgetIdUrl).host)}
            </button>
          }
        />
      )}

      <ConfigField
        name="connected_timeout"
        label={t.settings.timeout}
        type="number"
        parse={seconds}
        hint={t.settings.timeoutHint}
      />
    </>
  );
};

const SourceAction = () => {
  const { label, run } = useSourceAction();

  return (
    <div className="flex items-center gap-2">
      <button className="btn" onClick={run}>
        {label}
      </button>
    </div>
  );
};

const OscPanel = () => {
  const t = useStrings();
  const oscFailed = useConfig((state) => state.config != null && state.oscFailure === getAddr(state.config));

  return (
    <>
      <ConfigField
        name="osc_client_host"
        label={t.settings.host}
        parse={required}
        hint={t.settings.defaultValue(defaultConfig.osc_client_host)}
        failure={oscFailed ? 'oscHost' : undefined}
      />
      <ConfigField
        name="osc_client_port"
        label={t.settings.port}
        type="number"
        parse={port}
        hint={t.settings.defaultValue(defaultConfig.osc_client_port)}
      />
    </>
  );
};

const ParametersPanel = () => {
  const t = useStrings();

  return (
    <>
      <ConfigField
        name="osc_path_connected"
        label={t.settings.connectedParameter}
        prefix={OSC_PREFIX}
        parse={required}
        hint={t.settings.defaultValue(defaultConfig.osc_path_connected.slice(OSC_PREFIX.length))}
      />
      <ConfigField
        name="osc_path_percent"
        label={t.settings.percentParameter}
        prefix={OSC_PREFIX}
        parse={required}
        hint={t.settings.defaultValue(defaultConfig.osc_path_percent.slice(OSC_PREFIX.length))}
      />
      <ConfigField
        name="max_heart_rate"
        label={t.settings.maxHeartRate}
        type="number"
        parse={positive}
        hint={t.settings.maxHeartRateHint}
      />
    </>
  );
};

const languageLabels: Record<Language, string> = { ko: '한국어', en: 'English', ja: '日本語' };

const GeneralPanel = () => {
  const t = useStrings();
  const language = useConfig((state) => state.config?.language ?? defaultConfig.language);
  const [saveFailed, trackSave] = useSaveFailure();

  return (
    <div className="field">
      <label htmlFor="language" className="field-label">
        {t.settings.language}
      </label>
      <div className="relative">
        <select
          id="language"
          className="input"
          value={language}
          aria-invalid={saveFailed}
          aria-describedby={saveFailed ? 'language-error' : undefined}
          onChange={(e) => trackSave(saveConfig({ ...latestConfig(), language: e.target.value as LanguageSetting }))}
        >
          <option value="auto">{t.settings.auto}</option>
          {Object.entries(languageLabels).map(([value, label]) => (
            <option key={value} value={value} lang={value}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          className="pointer-events-none absolute top-1/2 right-1.5 size-3.5 -translate-y-1/2 text-neutral-400"
          aria-hidden="true"
        />
      </div>
      {saveFailed && <SaveError id="language-error" />}
    </div>
  );
};

const panels: { id: keyof Strings['settings']['tabs']; Panel: ComponentType; Action?: ComponentType }[] = [
  { id: 'source', Panel: SourcePanel, Action: SourceAction },
  { id: 'osc', Panel: OscPanel },
  { id: 'parameters', Panel: ParametersPanel },
  { id: 'general', Panel: GeneralPanel },
];

const Settings = () => {
  const t = useStrings();
  const [selected, setSelected] = useState(panels[0].id);
  const { id, Panel, Action } = panels.find((panel) => panel.id === selected) ?? panels[0];

  return (
    <div className="h-full flex flex-col">
      <ul className="mb-2 flex gap-3 border-b border-neutral-900 pb-1.5 text-xs">
        {panels.map((panel) => (
          <li key={panel.id}>
            <button
              aria-current={panel.id === selected ? 'true' : undefined}
              onClick={() => setSelected(panel.id)}
              className={cn(
                'underline-offset-4 transition-colors',
                panel.id === selected ? 'text-white underline decoration-1' : 'text-neutral-400 hover:text-white'
              )}
            >
              {t.settings.tabs[panel.id]}
            </button>
          </li>
        ))}
      </ul>

      <section aria-labelledby={`${id}-heading`} className="min-h-0 grow overflow-y-auto flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 id={`${id}-heading`} className="text-[13px]">
            {t.settings.titles[id]}
          </h2>
          {Action && <Action />}
        </div>
        <Panel />
      </section>
    </div>
  );
};

export default Settings;
