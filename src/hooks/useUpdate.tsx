import { XMarkIcon } from '@heroicons/react/24/solid';
import { getVersion } from '@tauri-apps/api/app';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useState } from 'react';
import semver from 'semver';

const useUpdate = (): [string, () => Promise<void>, React.ReactNode] => {
  const [update, setUpdate] = useState<string>('');

  const checkUpdate = async () => {
    try {
      const version = await getVersion();

      const resp = await fetch('https://api.github.com/repos/kamyu1537/hr-osc/releases/latest');
      const release = await resp.json();

      let releaseVersion = release.tag_name;
      if (releaseVersion.split('.').length !== 3) {
        releaseVersion = releaseVersion + '.0';
      }
      if (semver.gt(releaseVersion, version)) {
        console.info('found new version!');
        setUpdate(releaseVersion);
      } else {
        console.info('latest version!');
        setUpdate('');
      }
    } catch (e) {
      console.error(e);
      setUpdate('');
    }
  };

  const handleClickLater = () => {
    setUpdate('');
  };

  const handleClickUpdate = () => {
    openUrl('https://github.com/kamyu1537/hr-osc/releases/latest');
  };

  return [
    update,
    checkUpdate,
    <div role="status" className="-mx-2 -mt-2 mb-1.5 flex items-center gap-2 bg-neutral-800 px-2 py-1 text-xs">
      <span>Version {update} is available</span>
      <button onClick={handleClickUpdate} className="link text-xs">
        Download
      </button>
      <button onClick={handleClickLater} aria-label="Dismiss update notice" className="ml-auto rounded-sm text-neutral-300 hover:text-white">
        <XMarkIcon className="w-4" />
      </button>
    </div>,
  ];
};

export default useUpdate;
