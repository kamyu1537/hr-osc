import { getVersion } from '@tauri-apps/api/app';
import { useEffect, useState } from 'react';
import semver from 'semver';

const useUpdate = (): [string, () => Promise<void>, React.ReactNode] => {
  const [update, setUpdate] = useState<string>('');
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    (async () => {
      const version = await getVersion();
      setVersion(version);
    })();
  }, []);

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
    window.open('https://github.com/kamyu1537/hr-osc/releases/latest');
  };

  return [
    update,
    checkUpdate,
    <div className="flex items-center justify-center h-screen">
      <div>
        <h2 className="font-bold text-2xl mb-3">Update available!</h2>
        <p className="text-sm">
          <span className="block text-rose-500">Current version: {version}</span>
          <span className="block text-lime-500">New version: {update}</span>
        </p>

        <div className="mt-4 flex flex-row gap-1">
          <button
            onClick={handleClickUpdate}
            className="hover:bg-opacity-50 bg-opacity-30 bg-lime-800 w-full p-1.5 transition-colors rounded-lg"
          >
            Download
          </button>
          <button
            onClick={handleClickLater}
            className="hover:bg-opacity-50 bg-opacity-30 bg-rose-800 py-1.5 px-4 transition-colors rounded-lg"
          >
            Later
          </button>
        </div>
      </div>
    </div>,
  ];
};

export default useUpdate;
