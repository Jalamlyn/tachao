// 前面的 import 语句保持不变...

const ProductManagerModal = ({ isOpen, onClose }) => {
  // 前面的状态声明保持不变...

  const handleCreateApp = async (title: string) => {
    try {
      // 创建应用并获取 appId
      const appId = await appCodeStore.createApp(title)
      
      // 格式化需求内容
      const requirement = `基于以下需求对话创建应用:

用户需求:
${messages.filter(m => m.role === 'user').map(m => `- ${m.content}`).join('\n')}

需求分析:
${messages.filter(m => m.role === 'assistant').map(m => `- ${m.content}`).join('\n')}

请根据以上对话内容,生成完整的应用代码。`
      
      // 关闭所有 Modal
      setShowCreateAppModal(false)
      onClose()

      // 带着 appId 和对话内容跳转到应用开发界面
      navigate(`/admin/apps/${appId}/builder`, {
        state: {
          initialPrompt: requirement,
          messages: messages,
          fromProductManager: true
        }
      })
      
      message.success("应用创建成功，正在跳转到开发界面...")
    } catch (error) {
      console.error("Error creating app:", error)
      message.error("创建应用失败")
    }
  }

  // 其余代码保持不变...
}

export default ProductManagerModal