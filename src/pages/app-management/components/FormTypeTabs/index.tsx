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

  const handleTabChange = (type: string) => {
    setSelectedType(type)
  }

  const handleOpenAIModal = () => {
    setIsAIModalOpen(true)
  }

  const handleCloseAIModal = () => {
    setIsAIModalOpen(false)
  }

  const getFormsContext = (type: string) => {
    const typeForms = formTypes.find((t) => t.type === type)?.forms || []
    return typeForms.map((form) => JSON.stringify(form)).join("\n")
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        aria-label="表单类型"
        selectedKey={selectedType}
        onSelectionChange={(key) => handleTabChange(key as string)}
        className="w-full"
      >
        {formTypes.map((type) => (
          <Tab
            key={type.type}
            title={
              <div className="flex items-center gap-2">
                <span>{type.label}</span>
                <span className="text-tiny">({type.forms.length})</span>
              </div>
            }
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-end">
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Icon icon="mdi:robot" className="w-4 h-4" />}
                  onPress={handleOpenAIModal}
                >
                  AI 分析
                </Button>
              </div>
              <FormTypeTable forms={type.forms} isLoading={isLoading} />
            </div>
          </Tab>
        ))}
      </Tabs>

      <FormTypeAIModal
        isOpen={isAIModalOpen}
        onClose={handleCloseAIModal}
        formType={selectedType}
        chatHistory={getChatHistory(selectedType)}
        onUpdateHistory={updateHistory}
        onClearHistory={clearHistory}
        context={getFormsContext(selectedType)}
      />
    </div>
  )
}