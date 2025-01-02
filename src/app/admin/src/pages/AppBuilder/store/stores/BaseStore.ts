import { makeAutoObservable } from "mobx"

export class BaseStore {
  protected appId: string | null = null

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  setAppId(appId: string) {
    this.appId = appId
  }

  protected getStorageKey(key: string): string {
    return this.appId ? `${key}_${this.appId}` : key
  }
}