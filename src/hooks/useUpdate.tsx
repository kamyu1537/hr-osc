import { getVersion } from '@tauri-apps/api/app';
import { openUrl } from '@tauri-apps/plugin-opener';
import { useState } from 'react';
import semver from 'semver';
import { useStrings } from '../lib/i18n';

const useUpdate = (): [string, () => Promise<void>, React.ReactNode] => {
  const t = useStrings();
  const [update, setUpdate] = useState<string>('');

  const checkUpdate = async () => {
    try {
      const version = await getVersion();

      const resp = await fetch('https://api.github.com/repos/kamyu1537/hr-osc/releases/latest', { signal: AbortSignal.timeout(5000) });
      if (!resp.ok) {
        console.warn(`update check failed: HTTP ${resp.status}`);
        return;
      }
      const release = await resp.json();
      if (typeof release?.tag_name !== 'string') {
        console.warn('update check failed: release has no tag_name');
        return;
      }

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
    <div role="status" className="flex shrink-0 items-center gap-2 bg-neutral-900 px-2 py-0.5 text-[11px] text-neutral-300">
      <span>{t.update.available(update)}</span>
      <button onClick={handleClickUpdate} className="link">
        {t.update.download}
      </button>
      <button onClick={handleClickLater} aria-label={t.update.dismiss} className="ml-auto px-1 text-[13px] leading-none text-neutral-400 hover:text-white">
        ×
      </button>
    </div>,
  ];
};

export default useUpdate;
