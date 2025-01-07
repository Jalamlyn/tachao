import { AppCodeStore, Version } from "../types"

// 最大版本数限制
const MAX_VERSIONS = 10

export function addVersion(this: AppCodeStore, version: Version) {
  // 检查版本数量是否超过限制
  if (this.versions.length >= MAX_VERSIONS) {
    // 删除最早的版本
    this.versions = this.versions.slice(1)
    // 调整currentIndex
    if (this.currentIndex > 0) {
      this.currentIndex--
    }
  }
  
  this.versions = this.versions.slice(0, this.currentIndex + 1)
  this.versions.push(version)
  this.currentIndex = this.versions.length - 1
  this.saveToStorage()
  return version
}

export function rollback(this: AppCodeStore, onVersionChange): Version | null {
  if (this.canRollback) {
    this.currentIndex--
    this.saveToStorage()
    onVersionChange()
    return this.currentVersion
  }
  return null
}

export function forward(this: AppCodeStore, onVersionChange): Version | null {
  if (this.canForward) {
    this.currentIndex++
    this.saveToStorage()
    onVersionChange()
    return this.currentVersion
  }
  return null
}

export function clear(this: AppCodeStore) {
  this.versions = []
  this.currentIndex = -1
  this.clearStorage()
}