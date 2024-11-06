"use client"
import type { TextAreaProps } from "@nextui-org/react"

import React, { useEffect, useState } from "react"
import { Button, Tooltip, Input } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@nextui-org/react"

import PromptInput from "./PromptInput"
import { useFormSubmission } from "./from-templates/hook/useFormSubmission"
import { leaveRequestConfig } from "./from-templates/leave-request/config"
import { AIFormAgent } from "@/service/agents/AIFormAgent"

// 导入企业微信 JSAPI
import * as ww from "@wecom/jssdk"
import message from "./Message"

interface CommandInputProps extends TextAreaProps {
  classNames?: Record<"button" | "buttonIcon", string>
  agent?: {
    analyzeIntent: (input: string) => Promise<string>
    createForm: (description: string, onChunk: (chunk: string) => void) => Promise<any>
    searchForms: (query: string, formsIndex: any[], onChunk: (chunk: string) => void) => Promise<any[]>
  }
  onCommand?: (command: string) => void
}

export default function Component(props: CommandInputProps) {
  const { agent, onCommand, ...restProps } = props
  const [prompt, setPrompt] = React.useState<string>("")
  const { submitForm } = useFormSubmission()
  const [isRecording, setIsRecording] = React.useState<boolean>(false)
  const [localId, setLocalId] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [signature, setSignature] = useState<string>(
    "kgt8ON7yVITDhtdwci0qeUiDs4BGN8Nv1BTeJl6_DRfVMekQi10Szp0kiRDdSZkANokxKITDT4cv1UV6mWuiKA"
  )
  const [showSignatureInput, setShowSignatureInput] = useState<boolean>(false)
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    // 注册企业微信 JSAPI
    ww.register({
      corpId: "wwe22bac8b8ee6f528", // 请替换为您的企业 ID
      jsApiList: ["startRecord", "stopRecord", "translateVoice"],
      getConfigSignature() {
        // 使用动态的 signature
        return ww.getSignature(signature)
      },
    })
  }, [signature])

  const handleSendCommand = async () => {
    if (prompt && !isLoading) {
      try {
        setIsLoading(true)

        // 如果提供了 onCommand 回调，优先使用它
        if (onCommand) {
          await onCommand(prompt)
        } else if (agent) {
          // 使用传入的 AI agent 处理命令
          const intent = await agent.analyzeIntent(prompt)
          
          // 构建消息数组
          const newMessages = [
            ...messages,
            {
              role: "user",
              content: [{ type: "text", text: prompt }],
              images: []
            }
          ]
          setMessages(newMessages)
          
          if (intent === "create") {
            const result = await agent.createForm(prompt, () => {})
            message.success("表单创建成功")
          } else if (intent === "search") {
            const results = await agent.searchForms(prompt, [], () => {})
            message.success(`找到 ${results.length} 个匹配的表单`)
          }
        } else {
          // 保持原有的表单提交逻辑
          if (prompt.includes("生成配置")) {
            const mockFormData = {
              id: `LEAVE_${Date.now()}`,
              templateId: "leaveRequest",
              title: "请假申请单",
              data: leaveRequestConfig,
              status: "draft",
            }
            await submitForm(JSON.stringify(mockFormData))
            message.success("已生成请假单配置")
          } else {
            await submitForm(prompt)
          }
        }

        setPrompt("")
      } catch (error) {
        console.error("Error submitting command:", error)
        message.error("发送指令失败，请稍后重试")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const startRecording = () => {
    ww.startRecord({
      fail(res) {
        setIsRecording(false)
        message.error("语音输入只在手机端上可用")
      },
    })
    setIsRecording(true)
  }

  const stopRecording = () => {
    ww.stopRecord({
      success: function (res) {
        setLocalId(res.localId)
        setIsRecording(false)
        // 停止录音后直接调用语音识别
        ww.translateVoice({
          localId: res.localId,
          isShowProgressTips: true,
          success: function (translateRes) {
            setPrompt(translateRes.translateResult)
          },
          fail: function (translateRes) {
            console.error("语音转文字失败:", translateRes)
          },
        })
      },
      fail: function (res) {
        console.error("录音失败:", res)
        setIsRecording(false)
      },
    })
  }

  return (
    <div className='flex flex-col w-full items-start gap-2'>
      <form className='flex w-full items-start gap-2' onSubmit={(e) => e.preventDefault()}>
        <PromptInput
          {...restProps}
          classNames={{
            innerWrapper: cn("items-center", props.classNames?.innerWrapper),
            input: cn(
              "text-medium data-[has-start-content=true]:ps-0 data-[has-start-content=true]:pe-0",
              props.classNames?.input
            ),
          }}
          endContent={
            <div className='flex gap-2'>
              <Tooltip showArrow content={isRecording ? "停止录音" : "开始录音"}>
                <Button isIconOnly radius='full' variant='light' onClick={isRecording ? stopRecording : startRecording}>
                  <Icon icon={isRecording ? "solar:stop-circle-linear" : "solar:microphone-3-linear"} width={20} />
                </Button>
              </Tooltip>
              <Tooltip showArrow content='发送指令'>
                <Button
                  isIconOnly
                  className={props?.classNames?.button || ""}
                  color={!prompt || isLoading ? "default" : "primary"}
                  isDisabled={!prompt || isLoading}
                  radius='full'
                  variant={!prompt || isLoading ? "flat" : "solid"}
                  onClick={handleSendCommand}
                  isLoading={isLoading}
                >
                  {isLoading ? (
                    <Icon className='animate-spin' icon='eos-icons:loading' width={20} />
                  ) : (
                    <Icon
                      className={cn(
                        "[&>path]:stroke-[2px]",
                        !prompt ? "text-default-500" : "text-primary-foreground",
                        props?.classNames?.buttonIcon || ""
                      )}
                      icon='solar:arrow-up-linear'
                      width={20}
                    />
                  )}
                </Button>
              </Tooltip>
            </div>
          }
          value={prompt}
          onValueChange={setPrompt}
          disabled={isLoading}
        />
      </form>
    </div>
  )
}