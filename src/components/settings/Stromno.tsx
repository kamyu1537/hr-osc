import useInput from '../../hooks/useInput';
import { defaultConfig, saveConfig } from '../../lib/config';
import { useConfig } from '../../lib/states';

const Stromno = () => {
  const config = useConfig((state) => state.config);

  const widget = useInput(
    { placeholder: defaultConfig.stromno_widget_id + '', type: 'text' },
    config?.stromno_widget_id,
    (val) => saveConfig({ ...(config || defaultConfig), stromno_widget_id: val })
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm leading-3">Widget Id:</div>
      {widget.component}

      <button
        className="bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded-md hover:text-cyan-400 transition-colors"
        onClick={() => {
          console.info('reconnect request!');
          saveConfig({ ...(config || defaultConfig) }).then();
        }}
      >
        Reconnect
      </button>
    </div>
  );
};

export default Stromno;
