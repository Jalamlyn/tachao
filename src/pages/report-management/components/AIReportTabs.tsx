import React from "react"
import { Tabs, Tab } from "@nextui-org/react"

interface AIReportTabsProps {
  selectedTab: string
  onTabChange: (value: string) => void
  children: React.ReactNode
}

export function AIReportTabs({ selectedTab, onTabChange, children }: AIReportTabsProps) {
  return (
    <Tabs
      aria-label='报表分析'
      className='w-full'
      variant='underlined'
      selectedKey={selectedTab}
      onSelectionChange={(key) => onTabChange(key as string)}
      classNames={{
        tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
        cursor: "w-full bg-primary",
        tab: "max-w-fit px-0 h-12",
        tabContent: "group-data-[selected=true]:text-primary",
      }}
    >
      {children}
    </Tabs>
  )
}

export function AIReportTab({ children, ...props }: { children: React.ReactNode } & any) {
  return <Tab {...props}>{children}</Tab>
}