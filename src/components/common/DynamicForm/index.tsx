// ... 前面的代码保持不变 ...

const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      try {
        await handleSubmit(async (values) => {
          if (onSubmit) {
            await onSubmit(values)
            message.success("提交成功")
            setIsEditing(false)
            return
          }

          // 获取模板信息
          let templateInfo = null
          if (templateId) {
            try {
              const template = await getTemplateDetail(templateId)
              if (template) {
                templateInfo = {
                  id: template.id,
                  title: template.title,
                  type: template.type
                }
              }
            } catch (error) {
              console.error("Failed to get template info:", error)
            }
          }

          const orderNumberFieldName = config.orderNumberConfig?.fieldName || "orderNumber"
          const orderNumber = values[orderNumberFieldName]

          const formData = {
            title: orderNumber || config.metadata.title,
            status: "submitted",
            data: values,
            templateId: templateId,
            // 添加模板信息
            template: templateInfo,
            // 添加索引字段
            indexFields: {
              templateId: templateId,
              templateTitle: templateInfo?.title,
              templateType: templateInfo?.type,
              orderNumber: orderNumber,
              createdAt: new Date().toISOString(),
            }
          }

          if (id) {
            const result = await updateMetadata(id, formData)
            if (result) {
              message.success("更新成功")
              setIsEditing(false)
            } else {
              throw new Error("更新失败")
            }
          } else {
            const result = await createMetadata(formData)
            if (result) {
              message.success("创建成功")
              setIsEditing(false)
            } else {
              throw new Error("创建失败")
            }
          }
        })
      } catch (error) {
        console.error("Form submission error:", error)
        message.error("提交失败，请重试")
      }
    },
    [config, handleSubmit, id, onSubmit, updateMetadata, createMetadata, templateId, getTemplateDetail]
  )

// ... 后面的代码保持不变 ...