import React from "react"
import { Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import DynamicForm from "@/components/common/DynamicForm"
import FormHistoryTable from "@/components/forms/FormHistoryTable"
import { DynamicComponentRenderer } from "@/components/DynamicComponentRenderer"

interface FormTabsProps {
  selectedTab: string
  onTabChange: (key: string) => void
  formConfig: any
  formData: any
  formId: string
  templateId: string | null
  componentCode?: string // 新增：组件代码
}

export const FormTabs: React.FC<FormTabsProps> = ({
  selectedTab,
  onTabChange,
  formConfig,
  formData,
  formId,
  templateId,
  componentCode
}) => (
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
        {componentCode ? (
          // 使用新的动态组件渲染器
          <DynamicComponentRenderer
            code={componentCode}
            formId={formId}
            templateId={templateId}
            initialValues={formData}
            mode="edit"
          />
        ) : (
          // 保持原有的渲染逻辑
          <DynamicForm 
            config={formConfig} 
            id={formId} 
            templateId={templateId} 
            initialValues={formData} 
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