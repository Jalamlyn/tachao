import React, { useState } from "react"
import { Tabs, Tab, Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { FormTypeTable } from "./FormTypeTable"
import { FormTypeAIModal } from "./FormTypeAIModal"
import { useFormTypes } from "./hooks/useFormTypes"
import { useChatHistory } from "./hooks/useChatHistory"
import { MetadataDetail } from "@/hooks/metadata/types"

interface FormTypeTabsProps {
  forms: MetadataDetail[]
  isLoading?: boolean
}

export const FormTypeTabs: React.FC<FormTypeTabsProps> = ({ forms, isLoading }) => {
  const formTypes = useFormTypes(forms)
  const { chatHistories, updateHistory, clearHistory, getChatHistory } = useChatHistory()
  const [selectedType, setSelectedType] = useState<string>("")
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const handleTabChange = (type: string) => {
    setSelectedType(type)
    setCurrentPage(1) // 切换Tab时重置页码
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className='flex flex-col gap-4'>
      <Tabs
        aria-label='表单类型'
        selectedKey={selectedType}
        onSelectionChange={(key) => handleTabChange(key as string)}
        className='w-full'
      >
        {formTypes.map((type) => (
          <Tab
            key={type.templateId}
            title={
              <div className='flex items-center gap-2'>
                <span>{type.label}</span>
                <span className='text-tiny'>({type.forms.length})</span>
              </div>
            }
          >
            <div className='flex flex-col gap-4'>
              <div className='flex justify-end'>
                <Button
                  color='primary'
                  variant='flat'
                  startContent={<Icon icon='hugeicons:ai-chat-02' className='w-4 h-4' />}
                  onPress={() => setIsAIModalOpen(true)}
                >
                  AI 分析
                </Button>
              </div>
              <FormTypeTable
                forms={type.forms}
                isLoading={isLoading}
                page={currentPage}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </div>
          </Tab>
        ))}
      </Tabs>

      <FormTypeAIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        formType={selectedType}
        chatHistory={getChatHistory(selectedType)}
        onUpdateHistory={updateHistory}
        onClearHistory={clearHistory}
        context={
          formTypes
            .find((t) => t.templateId === selectedType)
            ?.forms.map((f) => JSON.stringify(f))
            .join("\n") || ""
        }
      />
    </div>
  )
}
