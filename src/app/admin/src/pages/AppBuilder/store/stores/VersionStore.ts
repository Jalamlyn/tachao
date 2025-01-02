import { BaseStore } from "./BaseStore"
import { Version } from "../types"

export class VersionStore extends BaseStore {
  private versions: Version[] = []
  public currentIndex: number = -1

  get currentVersion(): Version | null {
    return this.versions[this.currentIndex] || null
  }

  get latestVersion(): Version | null {
    return this.versions[this.versions.length - 1] || null
  }

  get isViewingHistory(): boolean {
    return this.currentIndex < this.versions.length - 1
  }

  get canRollback(): boolean {
    return this.currentIndex > 0
  }

  get canForward(): boolean {
    return this.currentIndex < this.versions.length - 1
  }

  addVersion(version: Version) {
    this.versions = this.versions.slice(0, this.currentIndex + 1)
    this.versions.push(version)
    this.currentIndex = this.versions.length - 1
    return version
  }

  rollback(): Version | null {
    if (this.canRollback) {
      this.currentIndex--
      return this.currentVersion
    }
    return null
  }

  forward(): Version | null {
    if (this.canForward) {
      this.currentIndex++
      return this.currentVersion
    }
    return null
  }

  clear() {
    this.versions = []
    this.currentIndex = -1
  }
}