export const AI_PROMPTS = {
  aiPrompt: `
系统提供了以下 AI 服务 API，你可以用它们来实现 AI 对话功能：

1. AI 服务 API 说明：
api.ai = {
  // 发起 AI 对话
  chat: (messages: Message[], options?: ChatOptions) => Promise<void>
}

2. 参数说明：
interface Message {
  role: 'system' | 'user' | 'assistant'  // 消息角色
  content: string | MessageContent[]     // 消息内容
  images?: string[]                      // 可选的图片数组
}

interface ChatOptions {
  onChunk?: (chunk: string) => void     // 流式返回的回调
  onResult?: (result: string) => void   // 完整结果的回调  
  onError?: (error: Error) => void      // 错误处理回调
  temperature?: number                   // 温度参数,默认为 0
}

3. 使用示例：

\`\`\`jsx
const { React, NextUI, api, message } = context;
const { Button, Input } = NextUI;

const AIChat = () => {
  const [input, setInput] = React.useState("");
  const [response, setResponse] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  
  const handleChat = async () => {
    if (!input.trim()) return;
    
    try {
      setLoading(true);
      setResponse("");
      
      const messages = [
        {
          role: "user",
          content: input
        }
      ];
      
      await api.ai.chat(messages, {
        // 处理流式返回
        onChunk: (chunk) => {
          setResponse(prev => prev + chunk);
        },
        
        // 处理完整结果
        onResult: (result) => {
          console.log("Chat completed:", result);
        },
        
        // 处理错误
        onError: (error) => {
          message.error("对话出错: " + error.message);
        },
        
        // 理科类 0, 日常对话 0.3, 创意类 0.7
        temperature: 0
      });
      
    } catch (error) {
      message.error("对话失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入问题..."
          disabled={loading}
        />
        <Button
          color="primary"
          isLoading={loading}
          onPress={handleChat}
        >
          发送
        </Button>
      </div>
      
      {response && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <div className="text-sm whitespace-pre-wrap">
            {response}
          </div>
        </div>
      )}
    </div>
  );
};
\`\`\`

4. 注意事项：
- 使用前需要从 context 中解构 api 对象
- 所有 AI 功能都封装在 api.ai 命名空间下
- chat 方法支持文本和图片混合输入
- 建议使用流式返回提供更好的用户体验
- temperature 参数可以调整回答的创造性,0 表示保守,1 表示创造性强`,
}
