import { balanceStore } from './balanceStore';

class RootStore {
  balanceStore = balanceStore;
}

export const rootStore = new RootStore();