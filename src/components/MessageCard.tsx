import React, { useEffect, useState, useCallback, useTransition } from "react"
import { Button, Badge, Avatar, Link, Image, Chip, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useClipboard } from "@nextui-org/use-clipboard"
import { cn } from "@/theme/cn"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useTranslation } from "react-i18next"
import { create } from "@wpm-js/core"
import rehypeRaw from "rehype-raw"

type MessageCardProps = React.HTMLAttributes<HTMLDivElement> & {
  avatar?: string
  showFeedback?: boolean
  message?: React.ReactNode | string
  currentAttempt?: number
  status?: "success" | "failed" | "streaming" | "loading" | "cancelled" | "thinking"
  attempts?: number
  messageClassName?: string
  onAttemptChange?: (attempt: number) => void
  onMessageCopy?: (content: string) => void
  onFeedback?: (feedback: "like" | "dislike") => void
  onAttemptFeedback?: (feedback: "like" | "dislike" | "same") => void
  images?: string[]
  role?: "user" | "assistant"
  onDeleteMessage?: () => void
  messageType?: "normal" | "guidance" | "system"
  onSwitchAgent?: (agentId: string) => void
  isGuidance?: boolean
  onDeleteGuidanceMessage?: () => void
}

const MessageCard = React.memo(
  React.forwardRef<HTMLDivElement, MessageCardProps>(
    (
      {
        avatar,
        message,
        showFeedback,
        attempts = 1,
        currentAttempt = 1,
        status,
        onMessageCopy,
        onAttemptChange,
        onFeedback,
        onAttemptFeedback,
        className,
        messageClassName,
        images,
        role,
        onDeleteMessage,
        messageType = "normal",
        onSwitchAgent,
        isGuidance = false,
        onDeleteGuidanceMessage,
        ...props
      },
      ref
    ) => {
      const { t } = useTranslation()
      const [attemptFeedback, setAttemptFeedback] = useState<"like" | "dislike" | "same">()
      const [displayedMessage, setDisplayedMessage] = useState(message)
      const [isLoading, setIsLoading] = useState(role === "user" ? false : true)
      const [isPending, startTransition] = useTransition()

      const { copied, copy } = useClipboard()

      useEffect(() => {
        setDisplayedMessage(message)
      }, [message])

      useEffect(() => {
        const cancel = () => {
          setIsLoading(false)
        }
        const commander = create({
          name: "MessageCard",
          exports: {
            cancel,
          },
        })
        return () => {
          commander.dispose()
        }
      }, [])

      useEffect(() => {
        if (status === "loading") {
          setIsLoading(true)
        }
        if (status === "streaming") {
          setIsLoading(false)
        }
        if (status === "failed" || status === "cancelled") {
          setIsLoading(false)
        }
      }, [status])

      const handleCopy = useCallback(() => {
        startTransition(() => {
          const valueToCopy = typeof displayedMessage === "string" ? displayedMessage : String(displayedMessage)
          copy(valueToCopy)
          onMessageCopy?.(valueToCopy)
        })
      }, [copy, displayedMessage, onMessageCopy])

      const failedMessageClassName =
        status === "failed" ? "bg-danger-100/50 border border-danger-100 text-foreground" : ""
      const failedMessage = (
        <p>
          {t("chat_error_message")}
          <Link href='mailto:info@mobenai.com.cn' size='sm'>
            info@mobenai.com.cn
          </Link>
        </p>
      )

      const hasFailed = status === "failed"

      const renderContent = () => {
        if (status === "cancelled") {
          return (
            <div>
              <p>......</p>
            </div>
          )
        }
        if (hasFailed) {
          return failedMessage
        }
        if (status === "thinking") {
          return (
            <div className='flex items-center'>
              <Spinner size='sm' className='mr-2' />
              {t("thinking")}
            </div>
          )
        }

        let contentClassName = "typo markdown-body markdown-body-guidance"
        if (messageType === "guidance") {
          contentClassName += " text-black p-0 rounded-lg"
        }

        if (React.isValidElement(displayedMessage)) {
          return displayedMessage
        }

        return (
          <div className={contentClassName}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                "shata-ai-code": () => {
                  return <div>正在生成代码...</div>
                },
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "")
                  if (match && match[1] == "mermaid") {
                    return (
                      <>
                        <code className='mermaid'>{children}</code>
                      </>
                    )
                  }
                  if (match && match[1] == "mo") {
                    if (children && children.toString().includes("</shata-ai-reflection>")) {
                      return "✔️ 深度思考完成"
                    }
                    if (children && children.toString().startsWith("<shata-ai-reflection>")) {
                      return "我正在深度思考..."
                    }
                    if (children && children.toString().includes("</shata-ai-think>")) {
                      return "✔️ 思考完成"
                    }
                    if (children && children.toString().startsWith("<shata-ai-think>")) {
                      return "我正在思考..."
                    }
                    if (children && children.toString().includes("</shata-ai-scene>")) {
                      return "✔️ 用户意图分析完成"
                    }
                    if (children && children.toString().startsWith("<shata-ai-scene>")) {
                      return "分析用户意图..."
                    }
                    if (children && children.toString().includes("</shata-ai-error>")) {
                      return "❌ 错误信息"
                    }
                    if (children && children.toString().startsWith("<shata-ai-error>")) {
                      return "检测到错误..."
                    }
                    if (children && children.toString().includes("</shata-ai-response>")) {
                      return "✔️ 响应完成"
                    }
                    if (children && children.toString().startsWith("<shata-ai-response>")) {
                      return "正在生成响应..."
                    }
                    if (children && children.toString().includes("</shata-ai-code>")) {
                      return "✔️ 代码生成完成"
                    }
                    if (children && children.toString().startsWith("<shata-ai-code>")) {
                      return "正在生成代码..."
                    }
                    if (children && children.toString().includes("</shata-ai-intent>")) {
                      return "✔️ 理解用户意图完成"
                    }
                    if (children && children.toString().startsWith("<shata-ai-intent>")) {
                      return "正在理解用户意图..."
                    }

                    return (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    )
                  }
                  return (
                    <code {...props} className={className}>
                      {children}
                    </code>
                  )
                },
              }}
            >
              {(displayedMessage as string) || ""}
            </ReactMarkdown>
          </div>
        )
      }

      return (
        <div {...props} ref={ref} className={cn("flex gap-3", className)}>
          <div className='relative flex-none'>
            <Badge
              isOneChar
              color='danger'
              content={<Icon className='text-background' icon='gravity-ui:circle-exclamation-fill' />}
              isInvisible={!hasFailed}
              placement='bottom-right'
              shape='circle'
            >
              <Avatar src={avatar} />
            </Badge>
          </div>
          <div className='flex w-full flex-col gap-4'>
            <div
              className={cn(
                "relative rounded-medium bg-content2 p-4 text-default-600",
                failedMessageClassName,
                messageClassName,
                "sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl",
                "w-full"
              )}
            >
              {images && images.length > 0 && (
                <div className='flex flex-wrap gap-2 mb-2'>
                  {images.map((image, index) => (
                    <Image
                      key={index}
                      src={image}
                      alt={t("uploaded_image_cover")}
                      className='max-w-[100px] max-h-[100px] object-cover rounded'
                    />
                  ))}
                </div>
              )}
              <div className={`text-small markdown-body ${messageType !== "guidance" && ""}`}>{renderContent()}</div>
              {!hasFailed && !isLoading && (
                <div className='absolute right-2 bottom-2 flex rounded-full bg-content2 shadow-small'>
                  <Button isIconOnly radius='full' size='sm' variant='light' onPress={handleCopy}>
                    {copied ? (
                      <Icon className='text-lg text-default-600' icon='gravity-ui:check' />
                    ) : (
                      <Icon className='text-lg text-default-600' icon='gravity-ui:copy' />
                    )}
                  </Button>
                </div>
              )}
              {attempts > 1 && !hasFailed && !isLoading && (
                <div className='flex w-full items-center justify-end'>
                  <button onClick={() => onAttemptChange?.(currentAttempt > 1 ? currentAttempt - 1 : 1)}>
                    <Icon
                      className='cursor-pointer text-default-400 hover:text-default-500'
                      icon='gravity-ui:circle-arrow-left'
                    />
                  </button>
                  <button onClick={() => onAttemptChange?.(currentAttempt < attempts ? currentAttempt + 1 : attempts)}>
                    <Icon
                      className='cursor-pointer text-default-400 hover:text-default-500'
                      icon='gravity-ui:circle-arrow-right'
                    />
                  </button>
                  <p className='px-1 text-tiny font-medium text-default-500'>
                    {currentAttempt}/{attempts}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  )
)

MessageCard.displayName = "MessageCard"

export default MessageCard
