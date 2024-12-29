// ... [前面的代码保持不变，直到 handlePublish 函数]

  const handlePublish = async () => {
    if (!appId) return
    try {
      setIsLoading(true)
      const publishData = versionStore.exportForPublish()
      if (!publishData) {
        throw new Error("没有可发布的内容")
      }

      // 1. 更新所有页面
      for (const [pageId, page] of Object.entries(publishData.pages)) {
        await setMetadata(
          pageId,
          JSON.stringify({
            id: pageId,
            title: page.title,
            code: page.code,
            appId,
            updatedAt: page.updatedAt,
          })
        )
      }

      // 2. 更新应用代码
      await setMetadata(
        `app_${appId}`,
        JSON.stringify({
          code: publishData.appCode,
          updatedAt: publishData.updatedAt,
          version: publishData.version,
        })
      )

      // 3. 更新应用索引
      const appIndexResult = await getMetadata(["app_index"])
      const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
      const appIndex = apps.findIndex((a: any) => a.id === appId)
      if (appIndex === -1) throw new Error("应用不存在")

      const updatedApps = [...apps]
      updatedApps[appIndex] = {
        ...updatedApps[appIndex],
        updatedAt: new Date().toISOString(),
        status: "active",
        version: publishData.version,
        lastPublishedAt: new Date().toISOString(),
      }

      await setMetadata("app_index", JSON.stringify(updatedApps))

      // 4. 清空本地版本历史（草稿）
      versionStore.clear()

      // 5. 重新加载最新发布的版本
      await AppAgent.loadAppCache(appId)

      message.success("发布成功")
      setShowPublishModal(true)
    } catch (error) {
      console.error("Error publishing app:", error)
      message.error("发布失败")
    } finally {
      setIsLoading(false)
    }
  }

// ... [后面的代码保持不变]