import { getMetadata, setMetadata, setPlatMetaData, getPlatMetaData } from "@/service/apis/metadata"
import { AppCodeStore, Version, AppIndex, PublishedVersion, BundleVersion, ModuleBundle } from "../types"
import { getCurrentAccountInfo } from "@/service/apis/user"
import html2canvas from 'html2canvas'
import message from "@/components/Message"

function generateVersionNumber(bundles?: BundleVersion[]): string {
  if (!bundles || bundles.length === 0) {
    return "v1.00"
  }

  const lastVersion = bundles[0].version
  const versionNum = parseFloat(lastVersion.substring(1)) + 0.01
  return `v${versionNum.toFixed(2)}`
}

async function captureAndUploadPreview(iframe: HTMLIFrameElement): Promise<{ url: string; fileID: string }> {
  try {
    // 等待 iframe 加载完成
    await new Promise(resolve => {
      if (iframe.contentDocument?.readyState === 'complete') {
        resolve(true);
      } else {
        iframe.onload = () => resolve(true);
      }
    });

    // 使用 html2canvas 截图
    const canvas = await html2canvas(iframe.contentDocument.body, {
      scale: 2,
      width: 1200,
      height: 800,
      useCORS: true,
    });

    // 转换为 blob
    const blob = await new Promise<Blob>(resolve => {
      canvas.toBlob(
        blob => resolve(blob),
        'image/webp',
        0.8
      );
    });

    // 创建 File 对象
    const previewFile = new File([blob], `preview-${Date.now()}.webp`, {
      type: 'image/webp'
    });

    // 生成云存储路径
    const cloudPath = `app-previews/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;
    
    // 认证
    const auth = app.auth();
    await auth.signInAnonymously();
    
    // 上传文件
    const uploadResult = await app.uploadFile({
      cloudPath,
      filePath: previewFile,
    });

    // 获取临时URL
    const urlResult = await app.getTempFileURL({
      fileList: [uploadResult.fileID],
    });

    const tempFileURL = urlResult.fileList[0]?.tempFileURL;
    if (!tempFileURL) {
      throw new Error("Failed to get preview image URL");
    }

    return {
      url: tempFileURL,
      fileID: uploadResult.fileID
    };
  } catch (error) {
    console.error("Error capturing and uploading preview:", error);
    throw error;
  }
}

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

    // 1. 首先过滤出非markdown模块
    const executableModules = Object.entries(versionToPublish.modules).filter(
      ([_, moduleWrapper]) => moduleWrapper.data.type !== "markdown"
    )

    // 2. 编译并上传可执行模块
    const moduleUrls = await this.compileAndUpload()
    // 3. 构建模块信息
    const moduleBundles: ModuleBundle[] = executableModules.map(([moduleId, moduleWrapper], index) => ({
      id: moduleId,
      url: moduleUrls[index],
      type: moduleWrapper.data.type,
      name: moduleWrapper.data.name,
    }))

    // 3. 准备新的bundle版本信息
    const currentBundles = versionToPublish.app.bundles || []
    const newBundle: BundleVersion = {
      version: generateVersionNumber(currentBundles),
      timestamp: Date.now(),
      urls: moduleUrls,
      modules: moduleBundles,
      bundleUrl: moduleUrls[0], // 保持向后兼容
    }

    // 4. 更新bundles数组，保持最近10个版本
    const updatedBundles = [newBundle, ...currentBundles].slice(0, 10)

    // 5. 获取预览图
    const iframe = document.querySelector('iframe');
    let previewImage = versionToPublish.app.previewImage;
    
    if (iframe) {
      try {
        const { url, fileID } = await captureAndUploadPreview(iframe);
        previewImage = {
          url,
          fileID,
          updatedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error("Failed to capture preview:", error);
        message.warning("预览图生成失败，将使用现有预览图");
      }
    }

    // 6. 发布到服务器
    await setMetadata(
      this.appId,
      JSON.stringify({
        app: {
          ...versionToPublish.app,
          bundles: updatedBundles,
          bundleUrl: moduleUrls[0], // 保持向后兼容
          previewImage,
        },
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
      appIndex.previewImage = previewImage

      await setMetadata("app_index", JSON.stringify(apps))
    }

    // 更新当前版本的bundle信息
    if (this.currentVersion) {
      this.currentVersion.app.bundles = updatedBundles
      this.currentVersion.app.bundleUrl = moduleUrls[0] // 保持向后兼容
      this.currentVersion.app.previewImage = previewImage
    }

    return {
      success: true,
      publishInfo,
      version: versionToPublish.app.version,
      publishedAt: new Date().toISOString(),
      bundleUrl: moduleUrls[0],
      bundles: updatedBundles,
      previewImage,
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
        avatar: userInfo.avatar,
      },
      app: versionToPublish.app,
      modules: versionToPublish.modules,
      updatedAt: new Date().toISOString(),
    }

    await setPlatMetaData({
      name: templateId,
      value: JSON.stringify(templateData),
    })

    // 更新模板索引
    const templateIndex = {
      id: templateId,
      sourceAppId: this.appId,
      name: versionToPublish.app.name,
      creator: {
        id: userInfo.id,
        name: userInfo.name || userInfo.username,
        avatar: userInfo.avatar,
      },
      updatedAt: new Date().toISOString(),
    }

    const indexResult = await getPlatMetaData(["plat_template_index"])
    const currentIndex = indexResult.data?.[0]?.values[0]?.value ? JSON.parse(indexResult.data[0].values[0].value) : []

    // 添加新模板到索引列表
    const newIndex = [...currentIndex, templateIndex]

    await setPlatMetaData({
      name: "plat_template_index",
      value: JSON.stringify(newIndex),
    })

    return {
      success: true,
      version: versionToPublish.app.version,
      publishedAt: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Error publishing template:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to publish template")
  }
}

export async function updateAppIndex(this: AppCodeStore, app: any, name: string): Promise<void> {
  try {
    const userInfo = await getCurrentAccountInfo()
    const appIndexResult = await getMetadata(["app_index"])
    const apps: AppIndex[] = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []

    const newAppIndex: AppIndex = {
      id: app.id,
      title: name,
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: app.version,
      creator: {
        id: userInfo.id,
        name: userInfo.name || userInfo.username,
        avatar: userInfo.avatar,
      },
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
    const moduleResults = await Promise.all(moduleIds.map((moduleId) => getMetadata([moduleId])))

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
      modules,
      bundleUrl: appData.app.bundleUrl,
      bundles: appData.app.bundles,
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
        bundleUrl: publishedVersion.bundleUrl,
        bundles: publishedVersion.bundles,
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