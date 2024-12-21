# 提交处理

## 基础提交
```typescript
{
  onSubmit: async (values) => {
    try {
      const response = await api.post("/api/form", values)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}
```
基础的提交处理配置。

## 提交前转换
```typescript
{
  onSubmit: async (values) => {
    // 提交前转换数据
    const transformedValues = {
      ...values,
      submitTime: new Date().toISOString(),
      status: "pending"
    }
    
    try {
      const response = await api.post("/api/form", transformedValues)
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  }
}
```
支持提交前的数据转换。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "提交处理示例"
  },
  renderConfig: {
    // ... 其他配置
  },
  onSubmit: async (values, { form, setSubmitting }) => {
    try {
      setSubmitting(true)
      
      // 1. 数据验证
      const validationResult = await form.trigger()
      if (!validationResult) {
        throw new Error("表单验证失败")
      }
      
      // 2. 数据转换
      const transformedValues = {
        ...values,
        // 基本信息转换
        submitTime: new Date().toISOString(),
        status: "pending",
        
        // 处理表格数据
        tableData: Object.entries(values.tableData || {}).reduce((acc, [key, rows]) => {
          acc[key] = Array.isArray(rows) ? rows.map(row => ({
            ...row,
            // 移除临时字段
            _tempId: undefined,
            // 处理数字字段
            amount: Number(row.amount),
            quantity: Number(row.quantity)
          })) : rows
          return acc
        }, {}),
        
        // 处理流程数据
        processConfirmations: Object.entries(values.processConfirmations || {}).reduce((acc, [key, data]) => {
          if (data.confirmed) {
            acc[key] = {
              ...data,
              confirmationDate: new Date(data.confirmationDate).toISOString()
            }
          }
          return acc
        }, {})
      }
      
      // 3. 文件处理
      const fileFields = Object.entries(transformedValues).filter(([_, value]) => 
        value && typeof value === "object" && value.fileKey
      )
      
      if (fileFields.length > 0) {
        // 上传文件
        await Promise.all(fileFields.map(async ([field, file]) => {
          const uploadResult = await uploadFile(file)
          transformedValues[field] = uploadResult.url
        }))
      }
      
      // 4. 提交数据
      const response = await api.post("/api/form", transformedValues, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 10000
      })
      
      // 5. 处理响应
      if (response.data.code !== 0) {
        throw new Error(response.data.message || "提交失败")
      }
      
      // 6. 成功处理
      message.success("提交成功")
      
      // 7. 返回结果
      return {
        success: true,
        data: response.data.data
      }
      
    } catch (error) {
      // 8. 错误处理
      console.error("Submit error:", error)
      message.error(error.message || "提交失败，请重试")
      
      return {
        success: false,
        error: error.message
      }
      
    } finally {
      // 9. 清理工作
      setSubmitting(false)
    }
  },
  
  // 提交成功后的回调
  onSubmitSuccess: (result) => {
    // 可以进行页面跳转等操作
    router.push(`/detail/${result.data.id}`)
  },
  
  // 提交失败后的回调
  onSubmitError: (error) => {
    // 可以进行错误日志上报等操作
    logger.error("Form submission failed:", error)
  }
}

// 辅助函数：上传文件
async function uploadFile(file) {
  const formData = new FormData()
  formData.append("file", file)
  
  const response = await api.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
  
  return response.data
}
```