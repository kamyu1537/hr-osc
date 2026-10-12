import { useState } from 'react';
import ConfigField, { Parse } from '../components/ConfigField';
import { defaultConfig, IConfig, saveConfig, serviceLabels } from '../lib/config';
import { startHttpServer, stopHttpServer } from '../lib/http_server';
import { useConfig } from '../lib/states';
import { cn } from '../lib/utils';

const port: Parse<number> = (raw) => {
  const value = Number(raw);
  return raw.trim() !== '' && Number.isInteger(value) && value >= 1 && value <= 65535
    ? { value }
    : { error: 'Enter a port from 1 to 65535' };
};

const positive: Parse<number> = (raw) => {
  const value = Number(raw);
  return raw.trim() !== '' && Number.isFinite(value) && value > 0
    ? { value }
    : { error: 'Enter a number greater than 0' };
};

const required: Parse<string> = (raw) => (raw.trim() ? { value: raw.trim() } : { error: 'Required' });

const optional: Parse<string> = (raw) => ({ value: raw.trim() });

const latestConfig = () => useConfig.getState().config ?? defaultConfig;

const handleServiceChange = (service: IConfig['service_type']) => {
  saveConfig({ ...latestConfig(), service_type: service });
  if (service !== 'http') {
    stopHttpServer();
  }
};

const SourcePanel = () => {
  const serviceType = useConfig((state) => state.config?.service_type ?? defaultConfig.service_type);
  const httpPort = useConfig((state) => state.config?.http_server_port ?? defaultConfig.http_server_port);

  return (
    <>
      <div>
        <label htmlFor="service_type" className="mb-0.5 block text-xs text-neutral-300">
          Source
        </label>
        <select
          id="service_type"
          className="input"
          value={serviceType}
          onChange={(e) => handleServiceChange(e.target.value as IConfig['service_type'])}
        >
          {Object.entries(serviceLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {serviceType === 'http' ? (
        <>
          <ConfigField
            name="http_server_port"
            label="HTTP server port"
            type="number"
            parse={port}
            hint={`POST bpm as text to http://127.0.0.1:${httpPort}`}
          />
          <button className="btn self-start" onClick={() => startHttpServer(latestConfig())}>
            Restart server
          </button>
        </>
      ) : (
        <>
          <ConfigField name="stromno_widget_id" label="Widget ID" parse={optional} />
          <button className="btn self-start" onClick={() => saveConfig({ ...latestConfig() })}>
            Reconnect
          </button>
        </>
      )}

      <ConfigField
        name="connected_timeout"
        label="Connected timeout (seconds)"
        type="number"
        parse={positive}
        hint="Disconnected after this long without data"
      />
    </>
  );
};

const OscPanel = () => (
  <>
    <ConfigField name="osc_client_host" label="Host" parse={required} hint={`Default: ${defaultConfig.osc_client_host}`} />
    <ConfigField
      name="osc_client_port"
      label="Port"
      type="number"
      parse={port}
      hint={`Default: ${defaultConfig.osc_client_port}`}
    />
  </>
);

const ParametersPanel = () => (
  <>
    <ConfigField
      name="osc_path_connected"
      label="Connected path"
      parse={required}
      hint={`Default: ${defaultConfig.osc_path_connected}`}
    />
    <ConfigField
      name="osc_path_percent"
      label="Percent path"
      parse={required}
      hint={`Default: ${defaultConfig.osc_path_percent}`}
    />
    <ConfigField
      name="max_heart_rate"
      label="Max heart rate"
      type="number"
      parse={positive}
      hint="Percent = bpm / max heart rate"
    />
  </>
);

const panels = [
  { id: 'source', tab: 'Source', title: 'Heart rate source', Panel: SourcePanel },
  { id: 'osc', tab: 'OSC', title: 'OSC output', Panel: OscPanel },
  { id: 'parameters', tab: 'Params', title: 'Parameters', Panel: ParametersPanel },
];

const Settings = () => {
  const [selected, setSelected] = useState(panels[0].id);
  const { id, title, Panel } = panels.find((panel) => panel.id === selected) ?? panels[0];

  return (
    <div className="h-full flex gap-2 pt-1">
      <ul className="w-16 shrink-0 border-r border-neutral-800 pr-2 flex flex-col gap-0.5 text-sm">
        {panels.map((panel) => (
          <li key={panel.id}>
            <button
              aria-current={panel.id === selected ? 'true' : undefined}
              onClick={() => setSelected(panel.id)}
              className={cn(
                'w-full rounded-sm px-1.5 py-0.5 text-left transition-colors',
                panel.id === selected ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              )}
            >
              {panel.tab}
            </button>
          </li>
        ))}
      </ul>

      <section aria-labelledby={`${id}-heading`} className="min-w-0 grow overflow-y-auto pr-1 pb-1 flex flex-col gap-2">
        <h2
          id={`${id}-heading`}
          className="border-b border-neutral-800 pb-1 text-[11px] uppercase tracking-wider text-neutral-400"
        >
          {title}
        </h2>
        <Panel />
      </section>
    </div>
  );
};

export default Settings;
