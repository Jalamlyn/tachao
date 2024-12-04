import message from "@/components/Message"
import { useAsyncButton } from "@/hooks/useAsyncButton"

export const useSave = (
  reportData: any,
  versionControl: any,
  currentTemplateIds: string[],
  title: string,
  reportId: string,
  setSavedReportId: (id: string) => void,
  setIsSuccessModalOpen: (open: boolean) => void,
  setPendingVersionSave: (pendingVersionSave: any) => void,
  setIsVersionSelectModalOpen: (open: boolean) => void,
  updateReport,
  createReport
) => {
  return useAsyncButton(
    async () => {
      if (!reportData || !versionControl.getCurrentVersion()?.rawConfig) {
        message.error("请先生成报表分析")
        return
      }

      try {
        // 检查是否在查看历史版本
        if (versionControl.currentIndex < versionControl.versions.length - 1) {
          return new Promise<void>((resolve, reject) => {
            setPendingVersionSave({
              resolve,
              reject,
              save: async (useCurrentVersion: boolean) => {
                try {
                  const versionToSave = useCurrentVersion
                    ? versionControl.getCurrentVersion()
                    : versionControl.versions[versionControl.versions.length - 1].data

                  if (!versionToSave) {
                    throw new Error("无效的版本数据")
                  }

                  const currentVersion = versionToSave
                  const reportTitle = title || "新建报表"

                  const saveData = {
                    title: reportTitle,
                    status: "active",
                    data: {
                      templateIds: currentTemplateIds,
                      rawConfig: currentVersion.rawConfig,
                    },
                    template:
                      currentTemplateIds.length === 1
                        ? {
                            id: currentTemplateIds[0],
                            title: reportTitle,
                            type: "form",
                          }
                        : undefined,
                    indexFields: {
                      templateIds: currentTemplateIds,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                  }

                  let result
                  if (reportId) {
                    result = await updateReport(reportId, saveData)
                  } else {
                    result = await createReport(saveData)
                  }

                  if (result) {
                    setSavedReportId(result.id)
                    setIsSuccessModalOpen(true)
                    resolve()
                    return result
                  } else {
                    throw new Error("保存报表失败")
                  }
                } catch (error) {
                  reject(error)
                }
              },
            })
            setIsVersionSelectModalOpen(true)
          })
        }

        // 如果不是历史版本，使用当前版本保存
        const currentVersion = versionControl.getCurrentVersion()
        const reportTitle = title || "新建报表"

        const saveData = {
          title: reportTitle,
          status: "active",
          data: {
            templateIds: currentTemplateIds,
            rawConfig: currentVersion?.rawConfig,
          },
          template:
            currentTemplateIds.length === 1
              ? {
                  id: currentTemplateIds[0],
                  title: reportTitle,
                  type: "form",
                }
              : undefined,
          indexFields: {
            templateIds: currentTemplateIds,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        }

        let result
        if (reportId) {
          result = await updateReport(reportId, saveData)
        } else {
          result = await createReport(saveData)
        }

        if (result) {
          setSavedReportId(result.id)
          setIsSuccessModalOpen(true)
          return result
        } else {
          throw new Error("保存报表失败")
        }
      } catch (error) {
        console.error("保存报表失败:", error)
        throw error
      }
    },
    {
      errorMessage: "保存报表失败",
    }
  )
}
