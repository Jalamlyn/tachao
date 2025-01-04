// 前面的 import 语句保持不变...

const AppBuilder: React.FC = observer(() => {
  // 前面的状态声明保持不变...

  // 修改处理初始提示的 useEffect
  useEffect(() => {
    if (location.state?.initialPrompt && location.state?.fromProductManager) {
      const initialMessage: AppBuilderMessage = {
        role: "user",
        content: location.state.initialPrompt,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
      }
      
      // 先设置消息
      setMessages([initialMessage])
      
      // 使用 setTimeout 确保状态更新后再处理命令
      setTimeout(() => {
        // 自动处理初始提示
        processCommand(location.state.initialPrompt)
      }, 100)

      // 清除 location state 以防止刷新时重复处理
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // 其余代码保持不变...
})

export default AppBuilder