import { getVersion } from '@tauri-apps/api/app';
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
    window.open('https://github.com/kamyu1537/hr-osc.git');
  };

  const handleOpenTwitter = (id: string) => {
    window.open('https://twitter.com/' + id);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex mb-6 gap-3">
        <div>
          <img src={appIcon} alt="" className="w-12" draggable={false} />
        </div>
        <div>
          <h1 className="text-3xl">hr-osc</h1>
          <p className="text-gray-500 leading-3">version: {version}</p>
        </div>
      </div>

      <div className="grow" />

      <div className="text-sm underline text-sky-200 cursor-pointer flex flex-col">
        <button className="text-left mb-3" onClick={handleOpenGithub}>
          Github
        </button>

        <button className="text-left" onClick={() => handleOpenTwitter('kamyu1537')}>
          kamyu_ (@kamyu1537)
        </button>
        <button className="text-left" onClick={() => handleOpenTwitter('selees824')}>
          Ein (@selees824)
        </button>
      </div>
    </div>
  );
};

export default About;
