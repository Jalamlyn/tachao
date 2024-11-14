import React, { useState, useEffect, useCallback, useRef } from "react"
import { ScrollShadow, Tabs, Tab, Code } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import MessageCard from "@/components/MessageCard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AIResourceAgent from "@/service/agents/AIResourceAgent"
import AnalysisResult from "./components/AnalysisResult"
import AICommandInput from "@/components/AICommandInput"

import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

interface Message {
  role: "user" | "assistant"
  content: React.ReactNode
  id: string
  timestamp: string
  status?: "success" | "error"
  code?: {
    preview?: React.ReactNode
    content?: string
  }
}

const extractShataAICode = (content: string) => {
  console.log("[extractShataAICode] Checking content for code")
  const regex = /<shata-ai-code>([\s\S]*?)<\/shata-ai-code>/
  const match = content.match(regex)
  if (match) {
    console.log("[extractShataAICode] Code found")
    return match[1].trim()
  }
  console.log("[extractShataAICode] No code found")
  return null
}

const AIReportEditor: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { resourceId } = useParams<{ resourceId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [messages, setMessages] = useState<Message[]>([])
  const [resourceData, setResourceData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [previewContent, setPreviewContent] = useState<string>("")
  const [previewComponent, setPreviewComponent] = useState<React.ReactNode>(null)
  const [selectedTab, setSelectedTab] = useState("data")

  const accumulatedTextRef = useRef("")
  const { getDetail: getResourceDetail } = useMetadata("resource")
  const { getDetail: getFormDetail } = useMetadata("form")

  useEffect(() => {
    const loadResourceData = async () => {
      try {
        let data: any[] = []
        
        if (resourceId) {
          // 如果有 resourceId，从资源加载数据
          const resource = await getResourceDetail(resourceId)
          if (resource && resource.data) {
            data = resource.data.data
          } else {
            message.error("资料加载失败")
            navigate("/we-chat-app/admin/resources")
            return
          }
        } else if (location.state?.forms) {
          // 如果是创建模式，从表单数据加载
          const forms = location.state.forms
          // 合并所有表单数据
          data = await Promise.all(forms.map(async (form: any) => {
            const formDetail = await getFormDetail(form.id)
            return formDetail ? formDetail.data : null
          }))
          data = data.filter(Boolean).flat()
        } else {
          message.error("未找到数据源")
          navigate("/we-chat-app/admin/resources")
          return
        }

        setResourceData(data)
        if (Array.isArray(data) && data.length > 0) {
          const firstRow = data[0]
          const cols = Object.keys(firstRow).map((key) => ({
            header: key,
            accessorKey: key,
          }))
          setColumns(cols)
        }
      } catch (error) {
        console.error("Error loading data:", error)
        message.error("数据加载失败")
        navigate("/we-chat-app/admin/resources")
      }
    }

    loadResourceData()

    // 更新面包屑
    const breadcrumbs = [
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "资料管理", href: "/we-chat-app/admin/resources" },
    ]
    
    if (resourceId) {
      breadcrumbs.push({ label: "AI 资料助手", href: `/we-chat-app/admin/resources/ai/${resourceId}` })
    } else {
      breadcrumbs.push({ label: "创建报表", href: `/we-chat-app/admin/reports/ai/create` })
    }
    
    updateBreadcrumbs(breadcrumbs)
  }, [resourceId, location.state, navigate, getResourceDetail, getFormDetail, updateBreadcrumbs])

  // 保持其他代码不变...
  // 这里是原有的其他方法和JSX，保持不变

  return (
    <PageLayout title={resourceId ? 'AI 资料助手' : '创建报表'} titleIcon='hugeicons:ai-chat-02' className='p-0'>
      <div className='h-[calc(100vh-140px)] overflow-hidden'>
        <ResizablePanelGroup direction='horizontal' className='h-full p-2'>
          <ResizablePanel defaultSize={30} className='resizable-panel'>
            <div className='h-full flex flex-col'>
              <ScrollShadow className='flex-1 overflow-y-auto'>
                <div className='space-y-4'>
                  {messages.map((message) => (
                    <div key={message.id}>
                      <MessageCard
                        avatar={message.role === "assistant" ? mo2 : user}
                        message={message.content}
                        role={message.role}
                        status={message.status || "success"}
                        className='message-card'
                      />
                    </div>
                  ))}
                </div>
              </ScrollShadow>

              <AICommandInput agent={resourceAgent} onResult={handleCommandResult} />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} className='resizable-panel bg-slate-50'>
            <div className='h-full flex flex-col'>
              <Tabs size='sm' selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key.toString())}>
                <Tab key='data' title='数据表格'>
                  <div className='h-[calc(100vh-260px)] overflow-auto p-2'>
                    {resourceData ? (
                      renderDataTable()
                    ) : (
                      <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
                        <Icon icon='mdi:loading' className='w-12 h-12 mx-auto mb-4' />
                        <p>正在加载数据...</p>
                      </div>
                    )}
                  </div>
                </Tab>
                <Tab key='analysis' title='分析报表'>
                  <div className='h-[calc(100vh-260px)] overflow-auto p-2'>{renderAnalysisResult()}</div>
                </Tab>
                <Tab key='code' title='代码视图'>
                  <div className='h-[calc(100vh-260px)] overflow-auto p-2'>{renderCodeView()}</div>
                </Tab>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </PageLayout>
  )
}

export default AIReportEditor