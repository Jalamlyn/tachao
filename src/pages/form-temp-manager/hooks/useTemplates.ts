import { useState, useCallback, useEffect } from "react"
import { useMetadata } from "@/hooks/useMetadata"
import { DynamicFormConfig } from "@/components/common/DynamicForm/types"
import message from "@/components/Message"
import { getMetadata } from "@/service/apis/metadata"

interface Template {
  id: string
  title: string
  data: {
    config: DynamicFormConfig
    type: "official" | "custom"
    name: string
  }
}

interface TemplateIndex {
  id: string
  type: string
  title: string
  status: string
  updatedAt: string
}

export const useTemplates = () => {
  const {
    items: templates,
    load: loadTemplates,
    create: createTemplate,
    getDetail: getTemplateDetail,
  } = useMetadata<{
    config: DynamicFormConfig
    type: "official" | "custom"
    name: string
  }>("template")

  const [isLoading, setIsLoading] = useState(false)
  const [templateIndexes, setTemplateIndexes] = useState<Array<{ id: string; title: string }>>([])
  const [isLoadingIndexes, setIsLoadingIndexes] = useState(false)

  // 加载模板索引列表
  const loadTemplateIndexes = useCallback(async () => {
    try {
      setIsLoadingIndexes(true)
      // 使用 getIndexes 获取索引数据
      const result = await getMetadata(["template_index"])
      if (result.data?.[0]?.value) {
        const indexes = JSON.parse(result.data[0].value) as TemplateIndex[]
        // 只提取需要的索引信息
        setTemplateIndexes(indexes.map(({ id, title }) => ({ id, title })))
      } else {
        setTemplateIndexes([])
      }
    } catch (error) {
      console.error("加载模板索引错误:", error)
      message.error("加载模板列表失败")
    } finally {
      setIsLoadingIndexes(false)
    }
  }, [])

  // 初始加载索引
  useEffect(() => {
    loadTemplateIndexes()
  }, [loadTemplateIndexes])

  const handleTemplateChange = useCallback(
    async (templateId: string) => {
      try {
        setIsLoading(true)
        if (!templateId) {
          return null
        }

        const template = await getTemplateDetail(templateId)
        if (template && template.data.config) {
          message.success("模板加载成功")
          return template.data.config
        }
        return null
      } catch (error) {
        console.error("加载模板错误:", error)
        message.error("加载模板失败")
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [getTemplateDetail]
  )

  const saveTemplate = useCallback(
    async (config: DynamicFormConfig) => {
      try {
        setIsLoading(true)
        const templateData = {
          title: "新建模板",
          type: "custom",
          status: "active",
          data: {
            config,
            type: "custom" as const,
            name: "新建模板",
          },
        }

        await createTemplate(templateData)
        message.success("模板保存成功")
        await loadTemplateIndexes() // 保存后刷新索引列表
      } catch (error) {
        console.error("保存模板失败:", error)
        message.error("保存模板失败")
      } finally {
        setIsLoading(false)
      }
    },
    [createTemplate, loadTemplateIndexes]
  )

  return {
    templates: templateIndexes, // 返回索引列表而不是完整模板列表
    isLoading,
    isLoadingIndexes,
    handleTemplateChange,
    saveTemplate,
    loadTemplateIndexes,
  }
}
