import { openUrl } from '@tauri-apps/plugin-opener';
import { create } from 'zustand';
import { pollPulsoidToken, PulsoidDeviceCode, requestPulsoidDeviceCode, setPulsoidToken } from '../lib/pulsoid';
import { useConfig } from '../lib/states';

export type PulsoidLoginState =
  | { step: 'idle' }
  | { step: 'waiting'; device?: PulsoidDeviceCode }
  | { step: 'done'; token: string }
  | { step: 'failed'; reason: 'denied' | 'expired' | 'error' };

interface IPulsoidLogin {
  state: PulsoidLoginState;
  start: () => Promise<void>;
  cancel: () => void;
}

let controller: AbortController | undefined;

const usePulsoidLogin = create<IPulsoidLogin>((set) => ({
  state: { step: 'idle' },
  start: async () => {
    controller?.abort();
    const current = new AbortController();
    controller = current;
    set({ state: { step: 'waiting' } });
    try {
      const device = await requestPulsoidDeviceCode();
      current.signal.throwIfAborted();
      set({ state: { step: 'waiting', device } });
      openUrl(device.verificationUriComplete).catch(console.error);
      const result = await pollPulsoidToken(device, current.signal);
      current.signal.throwIfAborted();
      if ('failure' in result) {
        set({ state: { step: 'failed', reason: result.failure } });
        return;
      }
      await setPulsoidToken(result.token);
      current.signal.throwIfAborted();
      useConfig.getState().requestReconnect();
      set({ state: { step: 'done', token: result.token } });
    } catch (err) {
      if (current.signal.aborted) return;
      console.error(err);
      set({ state: { step: 'failed', reason: 'error' } });
    }
  },
  cancel: () => {
    controller?.abort();
    set({ state: { step: 'idle' } });
  },
}));

export default usePulsoidLogin;
