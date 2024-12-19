import React from "react"
import { Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import FormHistoryTable from "@/components/forms/FormHistoryTable"
import { DynamicComponentRenderer } from "@/components/DynamicComponentRenderer"

interface FormTabsProps {
  selectedTab: string
  onTabChange: (key: string) => void
  formId: string
  templateId: string | null
  componentCode?: string // 新增：组件代码
}

export const FormTabs: React.FC<FormTabsProps> = ({
  selectedTab,
  onTabChange,
  formId,
  templateId,
  componentCode,
  formData,
}) => {
  return (
    <Tabs
      selectedKey={selectedTab}
      onSelectionChange={(key) => onTabChange(key.toString())}
      className='w-full'
      classNames={{
        tabList: "gap-2 sm:gap-4 relative rounded-xl p-1 sm:p-2 bg-gray-100/50 flex-wrap",
        cursor: "bg-white shadow-md",
        tab: "max-w-fit px-2 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm",
        tabContent: "group-data-[selected=true]:text-blue-600",
      }}
    >
      <Tab
        key='form'
        title={
          <div className='flex items-center space-x-1 sm:space-x-2'>
            <Icon icon='mdi:form-select' className='w-4 h-4 sm:w-5 sm:h-5' />
            <span>表单内容</span>
          </div>
        }
      >
        <div className='mt-4 h-[calc(100vh-140px)] overflow-auto rounded-lg'>
          {componentCode && (
            <DynamicComponentRenderer
              code={componentCode}
              formId={formId}
              templateId={templateId}
              formData={formData}
            />
          )}
        </div>
      </Tab>
      <Tab
        key='history'
        title={
          <div className='flex items-center space-x-1 sm:space-x-2'>
            <Icon icon='mdi:history' className='w-4 h-4 sm:w-5 sm:h-5' />
            <span>修改记录</span>
          </div>
        }
      >
        <div className='mt-4'>
          <FormHistoryTable formId={formId} />
        </div>
      </Tab>
    </Tabs>
  )
}
