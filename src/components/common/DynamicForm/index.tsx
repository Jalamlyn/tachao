// ... 其他 import 保持不变

const DynamicForm: React.FC<DynamicFormProps> = ({
  config: userConfig,
  id,
  onSubmit,
  onCancel,
  templateId,
  initialValues,
  previewMode = false, // 添加 previewMode 参数
}) => {
  // ... 其他代码保持不变

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // 提交处理
      const { success, validationResult, values, error } = await submitForm(form.getValues())
      
      if (!success) {
        if (validationResult) {
          handleValidationErrors(validationResult.errors)
        }
        return
      }

      // 如果是预览模式,只显示校验成功消息,不执行实际提交
      if (previewMode) {
        message.success("表单校验通过")
        return
      }

      // 如果有外部提交处理函数
      if (onSubmit) {
        await onSubmit(validationResult!, values)
        return
      }

      // 获取模板信息
      const templateInfo = await getTemplateInfo(templateId)
      
      // 准备表单数据
      const formData = prepareFormData(values, templateInfo)
      
      // 提交到服务器
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
      
    } catch (error) {
      console.error("Form submission error:", error)
      message.error("提交失败，请重试")
    }
  }, [form, id, onSubmit, templateId, updateMetadata, createMetadata, previewMode]) // 添加 previewMode 依赖

  // ... 其他代码保持不变
}

export default DynamicForm