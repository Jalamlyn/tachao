import { useState, useCallback } from "react"
import { MetadataDetail } from "@/components/from-templates/hook/useMetadata"

export const useFormSearch = (forms: MetadataDetail[]) => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredForms = useCallback(
    () =>
      forms.filter((form) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          // 搜索标题
          form.title.toLowerCase().includes(searchLower) ||
          // 搜索模板名称
          form.template?.title?.toLowerCase().includes(searchLower) ||
          // 搜索订单号
          form.indexFields?.orderNumber?.toLowerCase().includes(searchLower)
        )
      }),
    [forms, searchQuery]
  )

  return {
    searchQuery,
    setSearchQuery,
    filteredForms,
  }
}