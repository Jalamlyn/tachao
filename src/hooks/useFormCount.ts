import { useQueryMetadata } from "@/hooks/metadata/react-query"

export function useFormCount() {
  const { items: formItems } = useQueryMetadata("form")
  
  const getFormCountByTemplate = (templateId: string) => {
    return formItems?.filter(item => 
      item.indexFields?.templateId === templateId
    ).length || 0
  }

  return {
    getFormCountByTemplate
  }
}