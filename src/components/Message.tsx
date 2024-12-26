import React, { useCallback } from "react"
import { toast } from "sonner"
import { CheckCircle, XCircle, AlertCircle, Info, Trash2, Loader, Copy } from "lucide-react"
import { Spinner } from "@nextui-org/react"

type MessageType = "success" | "error" | "warning" | "info" | "delete" | "loading"

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  delete: Trash2,
  loading: Loader,
}

const colors = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
  delete: "text-gray-500",
  loading: "text-blue-500",
}

interface MessageWithCopyProps {
  content: React.ReactNode
  type: MessageType
}

interface ConfirmOptions {
  title: string
  content: React.ReactNode
  onOk?: () => void
  onCancel?: () => void
  okText?: string
  cancelText?: string
}

// 错误信息格式化组件
const ErrorMessageList: React.FC<{ messages: string[] }> = ({ messages }) => {
  return (
    <div className='space-y-1'>
      {messages.map((msg, index) => (
        <div key={index} className='flex items-start'>
          <span className='mr-2'>•</span>
          <span>{msg}</span>
        </div>
      ))}
    </div>
  )
}

const MessageWithCopy: React.FC<MessageWithCopyProps> = ({ content, type }) => {
  const copyToClipboard = useCallback(() => {
    if (typeof content === "string") {
      navigator.clipboard.writeText(content).catch((err) => {
        console.error("Failed to copy: ", err)
        message.error("Failed to copy")
      })
    }
  }, [content])

  return (
    <div className='flex items-center justify-between'>
      <div className={`flex items-center ${type === "loading" ? "" : colors[type]}`}>
        {type === "loading" ? (
          <Spinner size='sm' color='current' />
        ) : (
          React.createElement(icons[type], { size: 18, className: "min-w-[18px]" })
        )}
        <div className={`ml-2 ${type === "loading" ? "text-black" : ""}`}>{content}</div>
      </div>
      {typeof content === "string" && (
        <button onClick={copyToClipboard} className='ml-2 p-1 rounded hover:bg-gray-200'>
          <Copy size={16} />
        </button>
      )}
    </div>
  )
}

const showMessage = (type: MessageType, content: React.ReactNode | string[], duration = 6000): string => {
  const id = Math.random().toString(36).substr(2, 9)

  let messageContent: React.ReactNode

  if (Array.isArray(content)) {
    messageContent = <MessageWithCopy content={<ErrorMessageList messages={content} />} type={type} />
  } else {
    messageContent = <MessageWithCopy content={content} type={type} />
  }

  toast[type === "delete" ? "error" : type](messageContent, {
    duration: type === "loading" ? null : duration,
    id,
  })

  return id
}

const message = {
  success: (content: React.ReactNode, duration?: number) => showMessage("success", content, duration),
  error: (content: React.ReactNode | string[], duration?: number) => showMessage("error", content, duration),
  warning: (content: React.ReactNode, duration?: number) => showMessage("warning", content, duration),
  info: (content: React.ReactNode, duration?: number) => showMessage("info", content, duration),
  delete: (content: React.ReactNode, duration?: number) => showMessage("delete", content, duration),
  loading: (content: React.ReactNode) => showMessage("loading", content),
  dismiss: (toastId: string) => toast.dismiss(toastId),
  update: (toastId: string, content: React.ReactNode) => {
    toast.custom((t) => <MessageWithCopy content={content} type='loading' />, { id: toastId })
  },
  closeLoading: (toastId: string, status?: "success" | "error", content?: React.ReactNode) => {
    toast.dismiss(toastId)
    if (status && content) {
      showMessage(status, content)
    }
  },
  confirm: (options: ConfirmOptions) => {
    const { title, content, onOk, onCancel, okText = "确认", cancelText = "取消" } = options

    toast.custom((t) => (
      <div className='p-4 bg-white rounded-lg shadow-lg min-w-[300px]'>
        <h3 className='text-lg font-semibold mb-2'>{title}</h3>
        <div className='mb-4'>{content}</div>
        <div className='flex justify-end gap-2'>
          <button
            onClick={() => {
              toast.dismiss(t)
              onCancel?.()
            }}
            className='px-4 py-2 text-gray-600 hover:bg-gray-100 rounded'
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onOk?.()
            }}
            className='px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded'
          >
            {okText}
          </button>
        </div>
      </div>
    ))
  },
}

export default message
export { message }
