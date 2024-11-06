import { useState, useCallback } from "react"
import { MetadataDetail } from "@/components/from-templates/hook/useMetadata"

export const useFormSearch = (forms: MetadataDetail[]) => {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredForms = useCallback(
    () =>
      forms.filter((form) =>
        form.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [forms, searchQuery]
  )

  return {
    searchQuery,
    setSearchQuery,
    filteredForms,
  }
}