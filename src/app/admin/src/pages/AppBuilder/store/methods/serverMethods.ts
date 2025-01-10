import { getMetadata, setMetadata, setPlatMetaData, getPlatMetaData } from "@/service/apis/metadata"
import { AppCodeStore, Version, AppIndexItem, PublishedVersion } from "../types"
import { getCurrentAccountInfo } from "@/service/apis/user"

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

    // 获取当前用户信息
    debugger
    const userInfo = await getCurrentAccountInfo()
    
    // 生成唯一模板ID
    const templateId = `template_${this.appId}_${Date.now()}`

    // 创建模板数据
    const templateData = {
      id: templateId,
      sourceAppId: this.appId,
      name: versionToPublish.app.name,
      creator: {
        id: userInfo.id,
        name: userInfo.name || userInfo.username,
        avatar: userInfo.avatar
      },
      app: versionToPublish.app,
      modules: versionToPublish.modules,
      updatedAt: new Date().toISOString()
    }

    await setPlatMetaData({
      name: templateId,
      value: JSON.stringify(templateData)
    })

    // 更新模板索引
    const templateIndex = {
      id: templateId,
      sourceAppId: this.appId,
      name: versionToPublish.app.name,
      creator: {
        id: userInfo.id,
        name: userInfo.name || userInfo.username,
        avatar: userInfo.avatar
      },
      updatedAt: new Date().toISOString()
    }

    const indexResult = await getPlatMetaData(['plat_template_index'])
    const currentIndex = indexResult.data?.[0]?.values[0]?.value ? JSON.parse(indexResult.data[0].values[0].value) : []
    
    // 添加新模板到索引列表
    const newIndex = [...currentIndex, templateIndex]

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

export async function getLastPublishedVersion(this: AppCodeStore): Promise<PublishedVersion | null> {
  if (!this.appId) throw new Error("No app id")
  
  try {
    const appResult = await getMetadata([this.appId])
    if (!appResult.data?.[0]?.value) return null
    
    const appData = JSON.parse(appResult.data[0].value)
    
    const moduleIds = Object.keys(appData.app.modules)
    const moduleResults = await Promise.all(
      moduleIds.map(moduleId => getMetadata([moduleId]))
    )
    
    const modules = {}
    moduleResults.forEach((result, index) => {
      const moduleId = moduleIds[index]
      if (result.data?.[0]?.value) {
        modules[moduleId] = JSON.parse(result.data[0].value)
      }
    })
    
    return {
      version: appData.version,
      publishedAt: appData.updatedAt,
      modules
    }
  } catch (error) {
    console.error("Error getting last published version:", error)
    return null
  }
}

export async function rollbackToLastPublished(this: AppCodeStore): Promise<boolean> {
  try {
    const publishedVersion = await this.getLastPublishedVersion()
    if (!publishedVersion) {
      throw new Error("No published version found")
    }

    const newVersion: Version = {
      timestamp: Date.now(),
      app: {
        ...this.currentVersion!.app,
        version: publishedVersion.version,
        updatedAt: new Date().toISOString(),
      },
      modules: Object.entries(publishedVersion.modules).reduce(
        (acc, [moduleId, moduleData]) => ({
          ...acc,
          [moduleId]: {
            data: moduleData,
            updatedAt: new Date().toISOString(),
          },
        }),
        {}
      ),
    }

    this.addVersion(newVersion)
    return true
  } catch (error) {
    console.error("Error rolling back to last published version:", error)
    throw error
  }
}