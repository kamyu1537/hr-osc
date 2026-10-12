import { HeartIcon } from '@heroicons/react/24/solid';
import { getVersion } from '@tauri-apps/api/app';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useEffect, useState } from 'react';
import appIcon from '../assets/images/icon.png';

const About = () => {
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
    <div className="h-full text-center">
      <img src={appIcon} alt="" className="inline-block size-10" draggable={false} />
      <h1 className="text-[22px]">hr-osc</h1>
      <p className="text-xs text-neutral-400">{version}</p>

      <p className="mt-2.5 text-xs text-neutral-200">
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

      <button className="btn mt-2.5 py-px text-[11px] leading-[normal]" onClick={handleOpenSponsor}>
        <HeartIcon className="size-2.5 text-red-400" />
        Support the developer
      </button>
    </div>
  );
};

export default About;
