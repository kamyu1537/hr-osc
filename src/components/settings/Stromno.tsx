import { useContext } from 'react';
import useInput from '../../hooks/useInput';
import { ConfigContext, defaultConfig, saveConfig } from '../../lib/config';

const Stromno = () => {
  const config = useContext(ConfigContext);
  const widget = useInput(
    { placeholder: defaultConfig.stromno_widget_id + '', type: 'text' },
    config?.stromno_widget_id,
    (val) => saveConfig({ ...(config || defaultConfig), stromno_widget_id: val })
  );
  const timeout = useInput(
    { placeholder: defaultConfig.stromno_timeout + '', type: 'number' },
    config?.stromno_timeout,
    (val) => saveConfig({ ...(config || defaultConfig), stromno_timeout: val })
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm leading-3">Stromno widget:</div>
      {widget.component}

      <div className="text-sm leading-3">Stromno timeout:</div>
      {timeout.component}
    </div>
  );
};

export default Stromno;
