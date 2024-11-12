import React, { useState, useEffect, useRef } from "react"
import { ScrollShadow } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate, useParams } from "react-router-dom"
import { Button, Textarea } from "@nextui-org/react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useMetadata } from "@/hooks/useMetadata"
import message from "@/components/Message"
import { useBreadcrumb } from "@/contexts/BreadcrumbContext"
import PageLayout from "@/components/PageLayout"
import { useAsyncButton } from "@/hooks/useAsyncButton"
import MessageCard from "@/components/MessageCard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// 导入头像
import mo2 from "/assets/mo-2.png"
import user from "/assets/user.png"

const AIResourceEditor: React.FC = () => {
  const navigate = useNavigate()
  const { resourceId } = useParams<{ resourceId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [resourceData, setResourceData] = useState<any>(null)
  const [columns, setColumns] = useState<any[]>([])

  const { getDetail: getResourceDetail } = useMetadata("resource")

  useEffect(() => {
    const loadResourceData = async () => {
      if (resourceId) {
        try {
          const resource = await getResourceDetail(resourceId)
          if (resource && resource.data) {
            setResourceData(resource.data)
            // 从数据中提取列定义
            if (Array.isArray(resource.data) && resource.data.length > 0) {
              const firstRow = resource.data[0]
              const cols = Object.keys(firstRow).map(key => ({
                header: key,
                accessorKey: key,
              }))
              setColumns(cols)
            }
          } else {
            message.error("资料加载失败")
            navigate("/we-chat-app/admin/resources")
          }
        } catch (error) {
          console.error("Error loading resource:", error)
          message.error("资料加载失败")
          navigate("/we-chat-app/admin/resources")
        }
      }
    }

    loadResourceData()

    updateBreadcrumbs([
      { label: "首页", href: "/we-chat-app/admin" },
      { label: "资料管理", href: "/we-chat-app/admin/resources" },
      { label: "AI 资料分析", href: `/we-chat-app/admin/resources/ai/${resourceId}` },
    ])
  }, [resourceId])

  const { isLoading, handleClick: handleSendMessage } = useAsyncButton(
    async () => {
      if (!input.trim()) return

      const userMessage = {
        role: "user",
        content: input,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInput("")

      try {
        const assistantMessage = {
          role: "assistant",
          content: "正在分析您的数据...",
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        // TODO: 这里添加与 AI 的交互逻辑
        
      } catch (error) {
        console.error("Error in chat:", error)
        message.error("分析过程中发生错误")
      }
    },
    {
      errorMessage: "分析过程中发生错误",
    }
  )

  return (
    <PageLayout title='AI 资料分析' titleIcon='hugeicons:ai-chat-02' className="p-0">
      <div className='h-[calc(100vh-140px)] overflow-hidden'>
        <ResizablePanelGroup direction='horizontal' className='h-full'>
          <ResizablePanel defaultSize={30}>
            <div className='h-full flex flex-col'>
              <ScrollShadow className='flex-1 overflow-y-auto'>
                <div className='space-y-4 p-4'>
                  {messages.map((message) => (
                    <div key={message.id}>
                      <MessageCard
                        avatar={message.role === "assistant" ? mo2 : user}
                        message={message.content}
                        role={message.role}
                        status='success'
                        className='mb-4'
                      />
                    </div>
                  ))}
                </div>
              </ScrollShadow>

              <div className='flex items-end gap-2 p-4 bg-white border-t'>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='输入您的问题，AI 将帮您分析数据...'
                  className='flex-grow'
                  classNames={{
                    input: "py-2 text-medium",
                    inputWrapper: "bg-default-100",
                  }}
                  minRows={1}
                  maxRows={4}
                  endContent={
                    <div className='flex items-center gap-2 pr-2'>
                      <Button
                        isIconOnly
                        className={!input || isLoading ? "" : "bg-primary"}
                        color={!input || isLoading ? "default" : "primary"}
                        isDisabled={!input || isLoading}
                        radius='full'
                        variant={!input || isLoading ? "flat" : "solid"}
                        onClick={handleSendMessage}
                        isLoading={isLoading}
                      >
                        {isLoading ? (
                          <Icon className='animate-spin' icon='eos-icons:loading' width={20} />
                        ) : (
                          <Icon
                            className={!input ? "text-default-500" : "text-white"}
                            icon='solar:arrow-up-linear'
                            width={20}
                          />
                        )}
                      </Button>
                    </div>
                  }
                />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={70} className='bg-slate-100'>
            <div className='h-full overflow-auto p-4'>
              {resourceData ? (
                <div className="bg-white rounded-lg shadow">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((column) => (
                          <TableHead key={column.accessorKey}>{column.header}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resourceData.map((row: any, rowIndex: number) => (
                        <TableRow key={rowIndex}>
                          {columns.map((column) => (
                            <TableCell key={`${rowIndex}-${column.accessorKey}`}>
                              {row[column.accessorKey]}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className='text-center py-12 text-gray-500 h-full flex flex-col justify-center items-center'>
                  <Icon icon='mdi:loading' className='w-12 h-12 mx-auto mb-4 animate-spin' />
                  <p>正在加载数据...</p>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </PageLayout>
  )
}

export default AIResourceEditor