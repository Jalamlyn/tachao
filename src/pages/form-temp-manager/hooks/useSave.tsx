import message from "@/components/Message"
import { useAsyncButton } from "@/hooks/useAsyncButton"

export const useSave = (
  formState,
  versionControl,
  createTemplate,
  updateTemplate,
  templateId,
  isEditMode,
  title,
  setPendingVersionSave,
  setNewTitle,
  setTitleModalOpen,
  setPendingSave,
  setSavedTemplateId,
  setSuccessModalOpen,
  setVersionSelectModalOpen,
  handleError
) => {
  return useAsyncButton(
    async () => {
      // 增强状态检查逻辑
      if (!formState.formConfig) {
        message.error("表单配置不完整，请先生成表单")
        return
      }
      if (!formState.rawConfig) {
        message.error("表单原始配置缺失，请先生成表单")
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

                  if (!isEditMode) {
                    setNewTitle(title || versionToSave.formConfig.metadata?.title || "")
                    setTitleModalOpen(true)
                    setPendingSave({
                      resolve,
                      reject,
                      save: async (confirmedTitle: string) => {
                        try {
                          const templateData = {
                            title: confirmedTitle,
                            type: "custom",
                            status: "active",
                            data: {
                              rawConfig: versionToSave.rawConfig,
                              type: "custom",
                              name: confirmedTitle,
                            },
                          }

                          const result = await createTemplate(templateData)
                          if (result) {
                            setSavedTemplateId(result.id)
                            setSuccessModalOpen(true)
                            resolve()
                          } else {
                            throw new Error("保存模板失败")
                          }
                        } catch (error) {
                          reject(error)
                        }
                      },
                    })
                  } else {
                    const templateData = {
                      title: title || versionToSave.formConfig.metadata?.title || "新建模板",
                      type: "custom",
                      status: "active",
                      data: {
                        rawConfig: versionToSave.rawConfig,
                        type: "custom",
                        name: title || versionToSave.formConfig.metadata?.title || "新建模板",
                      },
                    }

                    const result = await updateTemplate(templateId, templateData)
                    if (result) {
                      setSavedTemplateId(templateId)
                      setSuccessModalOpen(true)
                      resolve()
                    } else {
                      throw new Error("更新模板失败")
                    }
                  }
                } catch (error) {
                  reject(error)
                  throw error
                }
              },
            })
            setVersionSelectModalOpen(true)
          })
        }

        if (!isEditMode) {
          const initialTitle = title || formState.formConfig.metadata?.title || ""
          setNewTitle(initialTitle)
          setTitleModalOpen(true)

          return new Promise<void>((resolve, reject) => {
            setPendingSave({
              resolve,
              reject,
              save: async (confirmedTitle: string) => {
                try {
                  const templateData = {
                    title: confirmedTitle,
                    type: "custom",
                    status: "active",
                    data: {
                      rawConfig: formState.rawConfig,
                      type: "custom",
                      name: confirmedTitle,
                    },
                  }

                  const result = await createTemplate(templateData)
                  if (result) {
                    setSavedTemplateId(result.id)
                    setSuccessModalOpen(true)
                    resolve()
                  } else {
                    throw new Error("保存模板失败")
                  }
                } catch (error) {
                  reject(error)
                }
              },
            })
          })
        }

        try {
          const templateData = {
            title: title || formState.formConfig.metadata?.title || "新建模板",
            type: "custom",
            status: "active",
            data: {
              rawConfig: formState.rawConfig,
              type: "custom",
              name: title || formState.formConfig.metadata?.title || "新建模板",
            },
          }

          const result = await updateTemplate(templateId, templateData)
          if (result) {
            setSavedTemplateId(templateId)
            setSuccessModalOpen(true)
          } else {
            throw new Error("更新模板失败")
          }
        } catch (error) {
          handleError(error)
          throw error
        }
      } catch (error) {
        handleError(error)
        throw error
      }
    },
    {
      errorMessage: "保存模板失败",
    }
  )
}