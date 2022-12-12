import create from 'zustand';
import { IConfig } from './config';

interface IConfigState {
  config: IConfig | null;
  setConfig: (config: IConfig) => void;
}

export const useConfig = create<IConfigState>((set) => ({
  config: null,
  setConfig: (config) => set({ config }),
}));
