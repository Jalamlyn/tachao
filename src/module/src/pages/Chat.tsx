import { context } from "@/lib/context"

const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context

const ChatBox = await wpm.import("comp_chat_box")
const chatStore = await wpm.import("store_chat")

const ChatPage = observer(() => {
  const containerRef = React.useRef(null)

  React.useEffect(() => {
    try {
      api.log.info("ChatPage 组件加载")

      // 监听容器高度
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          api.log.info("聊天容器尺寸变化", {
            height: entry.contentRect.height,
            width: entry.contentRect.width,
          })
        }
      })

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current)
      }

      return () => {
        resizeObserver.disconnect()
      }
    } catch (error) {
      api.log.error("ChatPage 加载失败", {
        error: error.message,
      })
    }
  }, [])

  if (!chatStore) {
    api.log.error("ChatStore 未正确加载")
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <NextUI.Spinner label='加载中...' />
      </div>
    )
  }

  return (
    <div ref={containerRef} className='flex flex-col min-h-[calc(100vh-12rem)]'>
      <div className='text-center space-y-2 mb-6 flex-shrink-0'>
        <h1 className='text-3xl font-bold'>AI情感助手</h1>
        <p className='text-default-500'>随时倾听，温暖陪伴</p>
      </div>

      <div className='flex-grow overflow-hidden p-2'>
        <ChatBox
          messages={chatStore.messages || []}
          onSend={chatStore.sendMessage}
          loading={chatStore.loading}
          onTransferToHuman={chatStore.transferToHuman}
          needsHumanSupport={chatStore.needsHumanSupport}
        />
      </div>
    </div>
  )
})

context.wpm.export("page_chat", ChatPage)
ChatPage.displayName = "ChatPage"