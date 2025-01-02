import { Version } from "../types"

export function addVersion(version: Version) {
  this.versions = this.versions.slice(0, this.currentIndex + 1)
  this.versions.push(version)
  this.currentIndex = this.versions.length - 1
  this.saveToStorage()
  return version
}

export function rollback(): Version | null {
  if (this.canRollback) {
    this.currentIndex--
    return this.currentVersion
  }
  return null
}

export function forward(): Version | null {
  if (this.canForward) {
    this.currentIndex++
    return this.currentVersion
  }
  return null
}

export function clear() {
  this.versions = []
  this.currentIndex = -1
  this.clearStorage()
  this.appId = null
}