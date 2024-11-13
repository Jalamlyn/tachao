import React, { useState, useEffect, useCallback, useRef } from "react"
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

type ProcessingStage = "idle" | "generating" | "analyzing" | "complete" | "error"

const extractShataAICode = (content: string) => {
  console.log("[extractShataAICode] Checking content for code")
  const regex = /<shata-ai-resource>([\s\S]*?)<\/shata-ai-resource>/
  const match = content.match(regex)
  if (match) {
    console.log("[extractShataAICode] Code found")
    return match[1].trim()
  }
  console.log("[extractShataAICode] No code found")
  return null
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
  const [processingStage, setProcessingStage] = useState<ProcessingStage>("idle")

  // 使用 ref 来累积 AI 输出
  const accumulatedTextRef = useRef("")
  const codeOutputRef = useRef("")
  const isGeneratingCodeRef = useRef(false)
  const { getDetail: getResourceDetail } = useMetadata("resource")

  useEffect(() => {
    const loadResourceData = async () => {
      if (resourceId) {
        try {
          const resource = await getResourceDetail(resourceId)
          if (resource && resource.data) {
            updatedResourceData(resource.data)
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
      { label: "AI 资料助手", href: `/we-chat-app/admin/resources/ai/${resourceId}` },
    ])
  }, [resourceId])

  // 处理 AI 输出的 chunk
  const handleChunk = useCallback((chunk: string) => {
    console.log("[handleChunk] Processing chunk:", chunk.slice(0, 50) + "...")
    
    // 累积文本
    accumulatedTextRef.current += chunk
    
    // 检测是否开始生成代码
    if (accumulatedTextRef.current.includes("<shata-ai-resource>") && !isGeneratingCodeRef.current) {
      console.log("[handleChunk] Code generation started")
      isGeneratingCodeRef.current = true
      
      // 更新状态显示生成代码的提示
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        return [...prev.slice(0, -1), {
          ...lastMessage,
          content: (
            <div className='flex items-center gap-3 text-primary'>
              <Icon icon='mdi:code-braces' className='animate-pulse w-5 h-5' />
              <div className='flex flex-col'>
                <span className='font-medium'>AI 正在生成分析代码</span>
                <span className='text-xs text-default-500'>请稍候...</span>
              </div>
            </div>
          )
        }]
      })
      
      // 切换到代码视图
      setProcessingStage("generating")
      setSelectedTab("code")
    }
    
    // 如果正在生成代码,将代码内容累积到专门的 ref
    if (isGeneratingCodeRef.current) {
      codeOutputRef.current += chunk
      
      // 检查代码是否生成完成
      if (accumulatedTextRef.current.includes("</shata-ai-resource>")) {
        console.log("[handleChunk] Code generation completed")
        isGeneratingCodeRef.current = false
        const code = extractShataAICode(accumulatedTextRef.current)
        
        if (code) {
          console.log("[handleChunk] Setting code preview")
          // 更新代码预览
          setCurrentPreview({
            preview: null,
            content: code
          })
          
          // 切换到分析阶段
          setProcessingStage("analyzing")
        }
      } else {
        // 持续更新代码预览
        setCurrentPreview(prev => ({
          ...prev,
          content: codeOutputRef.current
        }))
      }
    } else {
      // 非代码生成阶段,正常更新消息
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1]
        return [...prev.slice(0, -1), {
          ...lastMessage,
          content: lastMessage.content + chunk
        }]
      })
    }
  }, [])

  const resourceAgent = {
    processCommand: async (command: string) => {
      console.log("[processCommand] Starting command processing")
      try {
        setProcessingStage("idle")
        
        // 重置 ref 值
        accumulatedTextRef.current = ""
        codeOutputRef.current = ""
        isGeneratingCodeRef.current = false

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

        const result = await AIResourceAgent.processCommand({
          data: resourceData,
          command: command,
          onChunk: handleChunk
        })

        return result
      } catch (error) {
        console.error("Error in chat:", error)
        setProcessingStage("error")
        message.error("分析过程中发生错误")
        throw error
      }
    },
  }

  const updatedResourceData = useCallback((res) => {
    setResourceData(res.data)
    if (Array.isArray(res.data) && res.data.length > 0) {
      const firstRow = res.data[0]
      const cols = Object.keys(firstRow).map((key) => ({
        header: key,
        accessorKey: key,
      }))
      setColumns(cols)
    }
  }, [])

  const handleCommandResult = useCallback(
    (result) => {
      console.log("[handleCommandResult] Processing result:", result)
      if (result.success) {
        if (result.analysis) {
          console.log("[handleCommandResult] Analysis result received")

          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage.role === "assistant") {
              const regex = /<shata-ai-resource>([\s\S]*?)<\/shata-ai-resource>/
              const match = lastMessage.content.toString().match(regex)
              const originalCode = match ? match[1].trim() : null

              const messageWithCode = {
                ...lastMessage,
                content: "✔️ 分析完成",
                status: "success",
                code: {
                  preview: <AnalysisResult analysis={result.analysis} />,
                  content: originalCode,
                },
              }

              setSelectedTab("analysis")
              setCurrentPreview(messageWithCode.code)
              setProcessingStage("complete")
              console.log("[handleCommandResult] Analysis completed, stage: complete")

              return [...prev.slice(0, -1), messageWithCode]
            }
            return prev
          })
        } else if (result.data) {
          console.log("[handleCommandResult] Data result received")
          updatedResourceData(result.data)
          setMessages((prev) => {
            const lastMessage = prev[prev.length - 1]
            if (lastMessage.role === "assistant") {
              setProcessingStage("complete")
              return [
                ...prev.slice(0, -1),
                {
                  ...lastMessage,
                  content: "✔️ 数据已更新",
                  status: "success",
                },
              ]
            }
            return prev
          })
        }
      } else {
        console.log("[handleCommandResult] Error result received")
        setProcessingStage("error")
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: result.message,
                status: "error",
              },
            ]
          }
          return prev
        })
      }
    },
    [updatedResourceData]
  )

  const renderDataTable = () => (
    <div className='bg-white rounded-lg shadow'>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead className='min-w-24 bg-slate-50' key={column.accessorKey}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {resourceData.map((row: any, rowIndex: number) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={`${rowIndex}-${column.accessorKey}`}>{row[column.accessorKey]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderAnalysisResult = () =>
    currentPreview?.preview ? (
      <div className='h-full flex flex-col'>
        <div className='flex-1 bg-white rounded-lg'>{currentPreview.preview}</div>
      </div>
    ) : (
      <div className='flex items-center justify-center h-full text-gray-500'>
        <p>请先生成分析报表</p>
      </div>
    )

  const renderCodeView = () => {
    console.log("[renderCodeView] Current stage:", processingStage)
    
    if (processingStage === "generating") {
      return (
        <div className='flex items-center justify-center h-full'>
          <div className='flex flex-col items-center gap-3 text-primary'>
            <Icon icon='mdi:code-braces' className='w-8 h-8 animate-pulse' />
            <div className='flex flex-col items-center'>
              <span className='font-medium'>AI 正在生成分析代码</span>
              <span className='text-xs text-default-500'>请稍候...</span>
            </div>
          </div>
        </div>
      )
    }

    if (processingStage === "analyzing") {
      return (
        <div className='flex items-center justify-center h-full'>
          <div className='flex flex-col items-center gap-3 text-primary'>
            <Icon icon='mdi:chart-box' className='w-8 h-8 animate-pulse' />
            <div className='flex flex-col items-center'>
              <span className='font-medium'>正在分析数据</span>
              <span className='text-xs text-default-500'>请稍候...</span>
            </div>
          </div>
        </div>
      )
    }

    if (currentPreview?.content) {
      return (
        <pre className='text-sm overflow-auto bg-slate-800 text-white p-2 rounded-lg'>
          <code>{currentPreview.content}</code>
        </pre>
      )
    }

    return (
      <div className='flex items-center justify-center h-full text-gray-500'>
        <p>请先生成分析报表</p>
      </div>
    )
  }

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

export default AIResourceEditor