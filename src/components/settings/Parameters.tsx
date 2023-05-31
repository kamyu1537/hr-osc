import useInput from '../../hooks/useInput';
import { defaultConfig, saveConfig } from '../../lib/config';
import { useConfig } from '../../lib/states';

const Parameters = () => {
  const config = useConfig((state) => state.config);

  const connected = useInput(
    { placeholder: '', type: 'text' },
    config?.osc_path_connected,
    (val) => saveConfig({ ...(config || defaultConfig), osc_path_connected: val })
  );
  const percent = useInput(
    { placeholder: '', type: 'text' },
    config?.osc_path_percent,
    (val) => saveConfig({ ...(config || defaultConfig), osc_path_percent: val })
  );
  const heartRate = useInput(
    { placeholder: `(default: ${defaultConfig.max_heart_rate})`, type: 'number' },
    config?.max_heart_rate,
    (val) => saveConfig({ ...(config || defaultConfig), max_heart_rate: val })
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm leading-3">Connected Parameter Path:</div>
      {connected.component}

      <div className="text-sm leading-3">HR Percent Parameter Path:</div>
      {percent.component}

      <div className="text-sm leading-3">Max Heart Rate:</div>
      {heartRate.component}
    </div>
  );
};

export default Parameters;
