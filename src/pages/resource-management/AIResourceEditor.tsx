import React, { useState, useEffect, useCallback } from "react"
import { ScrollShadow, Button, Tabs, Tab } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useNavigate, useParams } from "react-router-dom"
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

// 新增: 代码提取函数
const extractShataAICode = (content: string) => {
  console.log("[extractShataAICode] Checking content:", content);
  const regex = /<shata-ai-resource>([\s\S]*?)<\/shata-ai-resource>/;
  const match = content.match(regex);
  if (match) {
    console.log("[extractShataAICode] Found code:", match[1].trim());
  }
  return match ? match[1].trim() : null;
};

const PreviewButton: React.FC<{
  code?: Message["code"]
  onPreview?: (code: Message["code"]) => void
}> = ({ code, onPreview }) => {
  if (!code) return null

  return (
    <Button
      size='sm'
      variant='light'
      onClick={() => onPreview?.(code)}
      startContent={<Icon icon='mdi:eye' className='w-4 h-4' />}
      className='text-default-600 hover:text-primary transition-colors'
    >
      预览
    </Button>
  )
}

const AIResourceEditor: React.FC = () => {
  const navigate = useNavigate()
  const { resourceId } = useParams<{ resourceId: string }>()
  const { updateBreadcrumbs } = useBreadcrumb()
  const [messages, setMessages] = useState<Message[]>([])
  const [resourceData, setResourceData] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [currentPreview, setCurrentPreview] = useState<Message["code"]>(null)
  const [selectedTab, setSelectedTab] = useState("data")

  const { getDetail: getResourceDetail } = useMetadata("resource")

  // ... 保持原有的 useEffect 和其他函数不变 ...

  const resourceAgent = {
    processCommand: async (command: string, onChunk?: (chunk: string) => void) => {
      try {
        const userMessage: Message = {
          role: "user",
          content: command,
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, userMessage])

        const assistantMessage: Message = {
          role: "assistant",
          content: "正在分析您的数据...",
          id: (Date.now() + 1).toString(),
          timestamp: new Date().toLocaleTimeString(),
        }
        setMessages((prev) => [...prev, assistantMessage])

        // 新增: 代码累积和检测逻辑
        let accumulatedCode = "";
        console.log("[processCommand] Starting command processing");

        const result = await AIResourceAgent.processCommand({
          data: resourceData,
          command: command,
          onChunk: (chunk: string) => {
            onChunk?.(chunk)
            
            // 检测是否包含代码块
            if (chunk.includes("<shata-ai-resource>")) {
              console.log("[processCommand] Detected code block, switching to code tab");
              setSelectedTab("code");
            }
            
            // 累积代码内容
            accumulatedCode += chunk;
            const code = extractShataAICode(accumulatedCode);
            if (code) {
              console.log("[processCommand] Extracted code, updating preview");
              setCurrentPreview({
                preview: null,
                content: code
              });
            }
            
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1]
              if (lastMessage.role === "assistant") {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    content: lastMessage.content + chunk,
                  },
                ]
              }
              return prev
            })
          },
        })

        return result
      } catch (error) {
        console.error("Error in chat:", error)
        message.error("分析过程中发生错误")
        throw error
      }
    },
  }

  // ... 保持其他代码不变 ...

  return (
    <PageLayout title='AI 资料助手' titleIcon='hugeicons:ai-chat-02' className='p-0'>
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
                        message={
                          <div>
                            {message.content}
                            {message.code && (
                              <div className='mt-2'>
                                <PreviewButton code={message.code} onPreview={handlePreview} />
                              </div>
                            )}
                          </div>
                        }
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

export default AIResourceEditor