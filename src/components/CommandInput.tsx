"use client"
import type { TextAreaProps } from "@nextui-org/react"

import React, { useEffect, useState, useRef } from "react"
import { Button, Tooltip, Input } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@nextui-org/react"

import PromptInput from "./PromptInput"

// 导入企业微信 JSAPI
import * as ww from "@wecom/jssdk"
import message from "./Message"

interface CommandInputProps extends TextAreaProps {
  classNames?: Record<"button" | "buttonIcon", string>
  onChunk?: (chunk: string) => void
  onCommand?: any
  config?: any
  agent?: {
    processCommand: (description: string, onChunk: (chunk: string) => void) => Promise<any>
    cacheImage: (imageData: string) => void
    clearCachedImage: () => void
  }
}

export default function Component(props: CommandInputProps) {
  const { agent, onChunk = () => {}, onCommand, config, ...restProps } = props
  const [prompt, setPrompt] = React.useState<string>("")
  const [isRecording, setIsRecording] = React.useState<boolean>(false)
  const [localId, setLocalId] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [signature, setSignature] = useState<string>(
    "kgt8ON7yVITDhtdwci0qeUiDs4BGN8Nv1BTeJl6_DRfVMekQi10Szp0kiRDdSZkANokxKITDT4cv1UV6mWuiKA"
  )
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    if ((prompt || uploadedImage) && !isLoading) {
      try {
        setIsLoading(true)

        if (agent) {
          let commandContent = prompt
          if (uploadedImage) {
            agent.cacheImage(uploadedImage)
            commandContent += ` [Uploaded Image]`
          }
          const result = await agent.processCommand(commandContent, onChunk, config)
          debugger
          onCommand && onCommand(result)
        }
        setPrompt("")
        setUploadedImage(null)
        agent?.clearCachedImage()
      } catch (error) {
        console.error("Error submitting command:", error)
        message.error("发送指令失败，请稍后重试")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const startRecording = () => {
    if (!ww.isWeixinJSBridgeReady) {
      return message.error("只支持在企业微信中使用语音对话")
    }
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        message.error("图片大小不能超过5MB")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.onerror = () => {
        message.error("图片上传失败，请重试")
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
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
              <Tooltip showArrow content='上传图片'>
                <Button isIconOnly radius='full' variant='light' onClick={triggerImageUpload}>
                  <Icon icon='mdi:image-plus' width={20} />
                </Button>
              </Tooltip>
              <input
                type='file'
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageUpload}
                accept='image/*'
              />
              <Tooltip showArrow content='发送指令'>
                <Button
                  isIconOnly
                  className={props?.classNames?.button || ""}
                  color={(!prompt && !uploadedImage) || isLoading ? "default" : "primary"}
                  isDisabled={(!prompt && !uploadedImage) || isLoading}
                  radius='full'
                  variant={(!prompt && !uploadedImage) || isLoading ? "flat" : "solid"}
                  onClick={handleSendCommand}
                  isLoading={isLoading}
                >
                  {isLoading ? (
                    <Icon className='animate-spin' icon='eos-icons:loading' width={20} />
                  ) : (
                    <Icon
                      className={cn(
                        "[&>path]:stroke-[2px]",
                        !prompt && !uploadedImage ? "text-default-500" : "text-primary-foreground",
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
      {uploadedImage && (
        <div className='mt-2 relative'>
          <img src={uploadedImage} alt='Uploaded' className='max-w-xs max-h-32 rounded-lg' />
          <Button
            isIconOnly
            size='sm'
            color='danger'
            variant='flat'
            className='absolute top-1 right-1'
            onClick={() => setUploadedImage(null)}
          >
            <Icon icon='mdi:close' width={16} />
          </Button>
        </div>
      )}
    </div>
  )
}
