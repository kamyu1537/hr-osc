import React, { useState } from 'react';
import General from '../components/settings/General';
import Http from '../components/settings/Http';
import OSC from '../components/settings/OSC';
import Parameters from '../components/settings/Parameters';
import Stromno from '../components/settings/Stromno';
import { defaultConfig, IConfig } from '../lib/config';
import { useConfig } from '../lib/states';
import { cn } from '../lib/utils';

const settings = [
  {
    label: 'General',
    component: <General />,
  },
  {
    label: 'Pulsoid',
    component: <Stromno />,
    visible: (config: IConfig) => {
      return config.service_type === 'stromno';
    },
  },
  {
    label: 'HTTP',
    component: <Http />,
    visible: (config: IConfig) => {
      return config.service_type === 'http';
    },
  },
  {
    label: 'OSC',
    component: <OSC />,
  },
  {
    label: 'Parameters',
    component: <Parameters />,
  },
];

const Settings = () => {
  const { config } = useConfig();
  const [setting, setSetting] = useState(0);

  return (
    <div className="flex pt-2 gap-2 h-full">
      <div className="flex flex-col gap-2">
        {settings.map((item, idx) => {
          if (item.visible != null && !item.visible(config || defaultConfig)) {
            return <React.Fragment key={idx} />;
          }

          return (
            <button
              key={idx}
              onClick={() => setSetting(idx)}
              className={cn('bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded-md', setting === idx && 'text-cyan-400')}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-y-auto">{settings[setting].component}</div>
    </div>
  );
};

export default Settings;
