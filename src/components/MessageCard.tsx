import React, { useEffect, useState, useCallback, useRef, useTransition } from "react"
import { Button, Badge, Avatar, Link, Image, Chip, Spinner } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useClipboard } from "@nextui-org/use-clipboard"
import { cn } from "@/theme/cn"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { useTranslation } from "react-i18next"
import { create } from "@wpm-js/core"
import mermaid from "mermaid"
import rehypeRaw from "rehype-raw"

type MessageCardProps = React.HTMLAttributes<HTMLDivElement> & {
  avatar?: string
  showFeedback?: boolean
  message?: React.ReactNode | string
  currentAttempt?: number
  status?: "success" | "failed" | "streaming" | "loading" | "cancelled"
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

// 简化的 Mermaid 组件
const Mermaid = ({ chart }) => (
  <div className="mermaid bg-white p-4 rounded-lg shadow-sm my-2 border border-gray-200">
    {chart}
  </div>
)

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

      const messageRef = useRef<HTMLDivElement>(null)

      const { copied, copy } = useClipboard()

      // 初始化 mermaid
      useEffect(() => {
        mermaid.initialize({
          startOnLoad: true,
          theme: "default",
          themeVariables: {
            primaryColor: "#4f46e5",
            primaryTextColor: "#000000",
            primaryBorderColor: "#4f46e5",
            lineColor: "#4b5563",
            secondaryColor: "#6366f1",
            tertiaryColor: "#818cf8"
          }
        })
      }, [])

      useEffect(() => {
        setDisplayedMessage(message)
      }, [message])

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
          const valueToCopy =
            typeof displayedMessage === "string" ? displayedMessage : messageRef.current?.textContent || ""
          copy(valueToCopy)
          onMessageCopy?.(valueToCopy)
        })
      }, [copy, displayedMessage, onMessageCopy])

      const handleAttemptFeedback = useCallback(
        (feedback: "like" | "dislike" | "same") => {
          setAttemptFeedback(feedback)
          onAttemptFeedback?.(feedback)
        },
        [onAttemptFeedback]
      )

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
        if (isLoading && !displayedMessage) {
          return (
            <div className='flex items-center'>
              <Spinner size='sm' className='mr-2' />
              {t("thinking")}
            </div>
          )
        }

        let contentClassName = "markdown-body markdown-body-guidance"
        if (messageType === "guidance") {
          contentClassName += " text-black p-0 rounded-lg"
        }

        // 检查 displayedMessage 的类型
        if (React.isValidElement(displayedMessage)) {
          // 如果是 React 元素，直接返回
          return displayedMessage
        }

        // 如果是字符串，使用 ReactMarkdown 渲染
        return (
          <div className={contentClassName}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "")
                  if (!inline && match?.[1] === "mermaid") {
                    return <Mermaid chart={String(children).trim()} />
                  }
                  if (match && match[1] == "mo") {
                    if (children && children.toString().startsWith("<shata-ai-resource>")) {
                      if (children.toString().includes("</shata-ai-resource>")) {
                        return <div color='success'>工作流程创建完成 ✔️</div>
                      } else {
                        return <div>正在创建工作流程，请稍后...</div>
                      }
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
                "relative rounded-medium bg-content2 px-4 py-3 pr-3 text-default-600",
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
              <div ref={messageRef} className={`text-small markdown-body ${messageType !== "guidance" && ""}`}>
                {renderContent()}
              </div>
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