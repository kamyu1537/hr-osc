import { HeartIcon } from '@heroicons/react/24/solid';
import { getVersion } from '@tauri-apps/api/app';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useEffect, useState } from 'react';
import appIcon from '../assets/images/icon.png';
import { useStrings } from '../lib/i18n';

const About = () => {
  const t = useStrings();
  const [version, setVersion] = useState('');

  useEffect(() => {
    (async () => {
      setVersion(await getVersion());
    })();
  }, []);

  const handleOpenGithub = () => {
    openUrl('https://github.com/kamyu1537/hr-osc.git');
  };

  const handleOpenTwitter = (id: string) => {
    openUrl('https://twitter.com/' + id);
  };

  const handleOpenSponsor = () => {
    openUrl('https://github.com/sponsors/kamyu1537');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="flex items-center gap-3">
        <img src={appIcon} alt="" className="w-12" draggable={false} />
        <div>
          <h1 className="text-[22px] leading-tight">hr-osc</h1>
          <p className="text-xs text-neutral-400">{version}</p>
        </div>
      </div>

      <p className="mt-6 text-xs text-neutral-200">
        <button className="link" onClick={handleOpenGithub}>
          GitHub
        </button>
        {' · '}
        <button className="link" onClick={() => handleOpenTwitter('kamyu1537')}>
          @kamyu1537
        </button>
        {' · '}
        <button className="link" onClick={() => handleOpenTwitter('selees824')}>
          @selees824
        </button>
      </p>

      <button className="btn mt-3 py-px text-[11px] leading-[normal]" onClick={handleOpenSponsor}>
        <HeartIcon className="size-2.5 text-red-400" />
        {t.about.support}
      </button>
    </div>
  );
};

export default About;
