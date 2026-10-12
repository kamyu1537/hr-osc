import { create } from 'zustand';
import { IConfig } from './config';

interface IConfigState {
  config: IConfig | null;
  setConfig: (config: IConfig) => void;
  reconnectRequest: number;
  requestReconnect: () => void;
  oscFailure: string | null;
}

export const useConfig = create<IConfigState>((set) => ({
  config: null,
  setConfig: (config) => set({ config }),
  reconnectRequest: 0,
  requestReconnect: () => set((state) => ({ reconnectRequest: state.reconnectRequest + 1 })),
  oscFailure: null,
}));
