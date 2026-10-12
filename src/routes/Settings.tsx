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

const seconds: Parse<number> = (raw) => {
  const value = Number(raw);
  return raw.trim() !== '' && Number.isInteger(value) && value >= 1
    ? { value }
    : { error: 'Enter a whole number of seconds (1 or more)' };
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
        <label htmlFor="service_type" className="block text-[11px] leading-[14px] text-neutral-400">
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
        <ConfigField
          key="http_server_port"
          name="http_server_port"
          label="HTTP server port"
          type="number"
          parse={port}
          hint={`POST bpm as text to http://127.0.0.1:${httpPort}`}
        />
      ) : (
        <ConfigField key="stromno_widget_id" name="stromno_widget_id" label="Widget ID" parse={optional} />
      )}

      <ConfigField
        name="connected_timeout"
        label="Connected timeout (seconds)"
        type="number"
        parse={seconds}
        hint="Disconnected after this long without data"
      />
    </>
  );
};

const SourceAction = () => {
  const serviceType = useConfig((state) => state.config?.service_type ?? defaultConfig.service_type);

  return serviceType === 'http' ? (
    <button className="btn" onClick={() => startHttpServer(latestConfig())}>
      Restart server
    </button>
  ) : (
    <button className="btn" onClick={() => saveConfig({ ...latestConfig() })}>
      Reconnect
    </button>
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
  { id: 'source', tab: 'Source', title: 'Heart rate source', Panel: SourcePanel, Action: SourceAction },
  { id: 'osc', tab: 'OSC', title: 'OSC output', Panel: OscPanel },
  { id: 'parameters', tab: 'Params', title: 'Parameters', Panel: ParametersPanel },
];

const Settings = () => {
  const [selected, setSelected] = useState(panels[0].id);
  const { id, title, Panel, Action } = panels.find((panel) => panel.id === selected) ?? panels[0];

  return (
    <div className="h-full flex flex-col">
      <ul className="mb-0.5 flex gap-3 text-xs">
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
              {panel.tab}
            </button>
          </li>
        ))}
      </ul>

      <section aria-labelledby={`${id}-heading`} className="min-h-0 grow overflow-y-auto flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 id={`${id}-heading`} className="text-[13px]">
            {title}
          </h2>
          {Action && <Action />}
        </div>
        <Panel />
      </section>
    </div>
  );
};

export default Settings;
