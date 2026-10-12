import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { openUrl } from '@tauri-apps/plugin-opener';
import { ComponentType, useState } from 'react';
import ConfigField, { Parse } from '../components/ConfigField';
import { defaultConfig, IConfig, saveConfig, services } from '../lib/config';
import { stopHttpServer } from '../lib/http_server';
import { Language, LanguageSetting, Strings, useStrings } from '../lib/i18n';
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
  saveConfig({ ...latestConfig(), service_type: service });
  if (services[service].kind !== 'http') {
    stopHttpServer();
  }
};

const SourcePanel = () => {
  const t = useStrings();
  const serviceType = useConfig((state) => state.config?.service_type ?? defaultConfig.service_type);
  const httpPort = useConfig((state) => state.config?.http_server_port ?? defaultConfig.http_server_port);
  const service = services[serviceType];

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
            onChange={(e) => handleServiceChange(e.target.value as IConfig['service_type'])}
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
      </div>

      {service.kind === 'http' ? (
        <ConfigField
          key="http_server_port"
          name="http_server_port"
          label={t.settings.httpPort}
          type="number"
          parse={port}
          hint={t.settings.httpHint(`http://127.0.0.1:${httpPort}`)}
        />
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
    <button className="btn" onClick={run}>
      {label}
    </button>
  );
};

const OscPanel = () => {
  const t = useStrings();

  return (
    <>
      <ConfigField
        name="osc_client_host"
        label={t.settings.host}
        parse={required}
        hint={t.settings.defaultValue(defaultConfig.osc_client_host)}
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
          onChange={(e) => saveConfig({ ...latestConfig(), language: e.target.value as LanguageSetting })}
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
