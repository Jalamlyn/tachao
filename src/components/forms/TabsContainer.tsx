import React from "react"
import { Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface TabsContainerProps {
  activeTab: string
  onTabChange: (key: string) => void
  children: React.ReactNode
}

const TabsContainer: React.FC<TabsContainerProps> = ({ activeTab, onTabChange, children }) => {
  return (
    <Tabs
      selectedKey={activeTab}
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
        key='forms'
        title={
          <div className='flex items-center space-x-1 sm:space-x-2'>
            <Icon icon='mdi:form-select' className='w-4 h-4 sm:w-5 sm:h-5' />
            <span>单据</span>
          </div>
        }
      >
        {children}
      </Tab>
      <Tab
        key='reports'
        title={
          <div className='flex items-center space-x-1 sm:space-x-2'>
            <Icon icon='mdi:chart-box' className='w-4 h-4 sm:w-5 sm:h-5' />
            <span>报表</span>
          </div>
        }
      >
        {children}
      </Tab>
      <Tab
        key='resources'
        title={
          <div className='flex items-center space-x-1 sm:space-x-2'>
            <Icon icon='mdi:database' className='w-4 h-4 sm:w-5 sm:h-5' />
            <span>资料</span>
          </div>
        }
      >
        {children}
      </Tab>
    </Tabs>
  )
}

export default TabsContainer