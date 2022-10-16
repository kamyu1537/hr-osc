import { useState } from 'react';
import OSC from '../components/settings/OSC';
import Parameters from '../components/settings/Parameters';
import Stromno from '../components/settings/Stromno';
import { cn } from '../lib/utils';

const settings = [
  {
    label: 'Stromno',
    component: <Stromno />,
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
  const [setting, setSetting] = useState(0);
  return (
    <div className="flex pt-2 gap-2 h-full">
      <div className="flex flex-col gap-2">
        {settings.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setSetting(idx)}
            className={cn('bg-gray-800 hover:bg-gray-700 px-2 py-0.5 rounded-md', setting === idx && 'text-yellow-400')}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto">{settings[setting].component}</div>
    </div>
  );
};

export default Settings;
