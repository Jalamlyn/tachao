import { getMetadata, setMetadata, setPlatMetaData, getPlatMetaData } from "@/service/apis/metadata"
import { AppCodeStore, Version, AppIndexItem } from "../types"

export async function publishToServer(this: AppCodeStore, { useLatest = false } = {}) {
  if (!this.appId) {
    throw new Error("No app id")
  }

  try {
    const versionToPublish = useLatest ? this.latestVersion : this.currentVersion
    if (!versionToPublish) {
      throw new Error("No version to publish")
    }

    const publishInfo = {
      hasNewerVersion: !useLatest && this.isViewingHistory,
      versionDate: new Date(versionToPublish.timestamp).toLocaleString(),
    }

    await setMetadata(
      this.appId,
      JSON.stringify({
        app: versionToPublish.app,
        version: versionToPublish.app.version,
        updatedAt: new Date().toISOString(),
      })
    )

    const modulePromises = Object.entries(versionToPublish.modules).map(([moduleId, moduleWrapper]) => {
      return setMetadata(moduleId, JSON.stringify(moduleWrapper.data))
    })
    await Promise.all(modulePromises)

    const appIndexResult = await getMetadata(["app_index"])
    const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []

    const appIndex = apps.find((app) => app.id === this.appId)
    if (appIndex) {
      appIndex.status = "active"
      appIndex.lastPublishedAt = new Date().toISOString()
      appIndex.version = versionToPublish.app.version
      appIndex.updatedAt = new Date().toISOString()

      await setMetadata("app_index", JSON.stringify(apps))
    }

    return {
      success: true,
      publishInfo,
      version: versionToPublish.app.version,
      publishedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error publishing app:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to publish app")
  }
}

export async function publishTemplate(this: AppCodeStore, { useLatest = false } = {}) {
  if (!this.appId) {
    throw new Error("No app id")
  }

  try {
    const versionToPublish = useLatest ? this.latestVersion : this.currentVersion
    if (!versionToPublish) {
      throw new Error("No version to publish")
    }

    // 使用 plat_ 前缀存储模板详情
    await setPlatMetaData({
      name: `plat_template_${this.appId}`,
      value: JSON.stringify({
        app: versionToPublish.app,
        version: versionToPublish.app.version,
        updatedAt: new Date().toISOString(),
        modules: versionToPublish.modules
      })
    })

    // 更新带有 plat_ 前缀的模板索引
    const templateIndex = {
      id: this.appId,
      name: versionToPublish.app.name,
      version: versionToPublish.app.version,
      updatedAt: new Date().toISOString()
    }

    // 获取现有索引，使用 plat_ 前缀
    const indexResult = await getPlatMetaData(['plat_template_index'])
    const currentIndex = indexResult.data?.[0]?.value ? JSON.parse(indexResult.data[0].value) : []
    
    // 更新索引
    const newIndex = currentIndex.filter(t => t.id !== this.appId)
    newIndex.push(templateIndex)

    await setPlatMetaData({
      name: 'plat_template_index',
      value: JSON.stringify(newIndex)
    })

    return {
      success: true,
      version: versionToPublish.app.version,
      publishedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error("Error publishing template:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to publish template")
  }
}

export async function updateAppIndex(this: AppCodeStore, app: any, name: string): Promise<void> {
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