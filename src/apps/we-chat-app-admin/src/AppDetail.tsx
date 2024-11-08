import React, { useEffect } from "react"
import { Breadcrumbs, BreadcrumbItem, Tabs, Tab } from "@nextui-org/react"
import DocumentContent from "./DocumentContent"
import TableContent from "./TableContent"
import ReportContent from "./ReportContent"
import { Icon } from "@iconify/react"
import { useBreadcrumb } from "../../../contexts/BreadcrumbContext"

const AppDetail: React.FC = () => {
  const { updateBreadcrumbs } = useBreadcrumb()

  useEffect(() => {
    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "应用列表", href: "/we-chat-app/admin/applications" },
      { label: "应用详情", href: "#" },
    ])
  }, [])

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-bold mb-4'>应用详情</h1>

      <Tabs aria-label='应用详情标签页' color='primary' variant='bordered'>
        <Tab
          key='documents'
          title={
            <div className='flex items-center space-x-2'>
              <Icon icon='mdi:file-document-outline' width='20' height='20' />
              <span>单据</span>
            </div>
          }
        >
          <DocumentContent />
        </Tab>
        <Tab
          key='tables'
          title={
            <div className='flex items-center space-x-2'>
              <Icon icon='mdi:table' width='20' height='20' />
              <span>表格</span>
            </div>
          }
        >
          <TableContent />
        </Tab>
        <Tab
          key='reports'
          title={
            <div className='flex items-center space-x-2'>
              <Icon icon='mdi:chart-bar' width='20' height='20' />
              <span>报表</span>
            </div>
          }
        >
          <ReportContent />
        </Tab>
      </Tabs>
    </div>
  )
}

export default AppDetail
