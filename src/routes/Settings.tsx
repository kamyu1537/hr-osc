import ConfigField, { Parse } from '../components/ConfigField';
import { defaultConfig, IConfig, saveConfig, serviceLabels } from '../lib/config';
import { startHttpServer, stopHttpServer } from '../lib/http_server';
import { useConfig } from '../lib/states';

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

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section aria-labelledby={id} className="flex flex-col gap-2">
    <h2 id={id} className="text-[11px] uppercase tracking-wider text-neutral-400">
      {title}
    </h2>
    {children}
  </section>
);

const Settings = () => {
  const serviceType = useConfig((state) => state.config?.service_type ?? defaultConfig.service_type);

  return (
    <div className="h-full overflow-y-auto pr-1 pb-1 flex flex-col gap-4">
      <Section id="source-heading" title="Heart rate source">
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
            <ConfigField name="http_server_port" label="HTTP server port" type="number" parse={port} />
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
      </Section>

      <Section id="osc-heading" title="OSC output">
        <ConfigField name="osc_client_host" label="Host" parse={required} />
        <ConfigField name="osc_client_port" label="Port" type="number" parse={port} />
        <ConfigField name="osc_path_connected" label="Connected parameter path" parse={required} />
        <ConfigField name="osc_path_percent" label="HR percent parameter path" parse={required} />
        <ConfigField name="max_heart_rate" label="Max heart rate" type="number" parse={positive} />
        <ConfigField name="connected_timeout" label="Connected timeout (seconds)" type="number" parse={positive} />
      </Section>
    </div>
  );
};

export default Settings;
