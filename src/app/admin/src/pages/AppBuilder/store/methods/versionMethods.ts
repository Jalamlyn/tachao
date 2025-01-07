import { context } from "../../components/functionContext"
import { AppCodeStore, Version } from "../types"

export function addVersion(this: AppCodeStore, version: Version) {
  this.versions = this.versions.slice(0, this.currentIndex + 1)
  this.versions.push(version)
  this.currentIndex = this.versions.length - 1
  this.saveToStorage()
  return version
}

export async function rollback(this: AppCodeStore): Promise<Version | null> {
  if (this.canRollback) {
    this.currentIndex--
    const version = this.currentVersion
    if (version && this.appId) {
      // 执行当前版本的代码
      await this.executeModules(context(this.appId))
    }
    return version
  }
  return null
}

export async function forward(this: AppCodeStore): Promise<Version | null> {
  if (this.canForward) {
    this.currentIndex++
    const version = this.currentVersion
    if (version && this.appId) {
      // 执行当前版本的代码
      await this.executeModules(context(this.appId))
    }
    return version
  }
  return null
}

export function clear(this: AppCodeStore) {
  this.versions = []
  this.currentIndex = -1
  this.clearStorage()
}
