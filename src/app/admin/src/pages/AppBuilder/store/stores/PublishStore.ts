import { BaseStore } from "./BaseStore"
import { getMetadata, setMetadata } from "@/service/apis/metadata"
import { App, Version, AppIndexItem } from "../types"

export class PublishStore extends BaseStore {
  async updateAppIndex(app: App, name: string): Promise<void> {
    try {
      const appIndexResult = await getMetadata(["app_index"])
      const apps: AppIndexItem[] = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []

      const newAppIndex: AppIndexItem = {
        id: app.id,
        title: name,
        status: "draft",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: app.version,
      }

      const updatedApps = [...apps, newAppIndex]
      await setMetadata("app_index", JSON.stringify(updatedApps))
    } catch (error) {
      console.error("Error updating app index:", error)
      throw new Error("Failed to update app index")
    }
  }

  async publishToServer(version: Version): Promise<void> {
    if (!this.appId) {
      throw new Error("No app id")
    }

    try {
      await setMetadata(
        this.appId,
        JSON.stringify({
          app: version.app,
          version: version.app.version,
          updatedAt: new Date().toISOString(),
        })
      )

      const modulePromises = Object.entries(version.modules).map(([moduleId, moduleWrapper]) => {
        return setMetadata(moduleId, JSON.stringify(moduleWrapper.data))
      })
      await Promise.all(modulePromises)

      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []

      const appIndex = apps.find((app) => app.id === this.appId)
      if (appIndex) {
        appIndex.status = "active"
        appIndex.lastPublishedAt = new Date().toISOString()
        appIndex.version = version.app.version
        appIndex.updatedAt = new Date().toISOString()

        await setMetadata("app_index", JSON.stringify(apps))
      }
    } catch (error) {
      console.error("Error publishing app:", error)
      throw new Error("Failed to publish app")
    }
  }
}