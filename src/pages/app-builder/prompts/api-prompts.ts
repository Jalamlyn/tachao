export const API_PROMPTS = {
  multimodal: `
您可以使用以下 API 来构建支持多模态输入的 AI 应用:

1. 多模态 AI API:
\`\`\`javascript
const response = await context.ai.process({
  text: "分析这张图片",
  images: ["base64图片数据"],
  temperature: 0.7
});
\`\`\`

2. 数据存储 API:
\`\`\`javascript
// 读取数据
const data = await context.api.getMetadata(["user_data"]);

// 写入数据
await context.api.setMetadata("user_data", {
  name: "张三",
  preferences: { theme: "dark" }
});
\`\`\`

3. 流式输出示例:
\`\`\`javascript
export default (props) => {
  const { React, NextUI, api, ai } = context;
  const { useState, useRef } = React;
  const { Input, Button, Card, ScrollShadow } = NextUI;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const abortControllerRef = useRef(null);

  // 处理流式输出
  const handleStream = async (messages, onChunk) => {
    try {
      abortControllerRef.current = new AbortController();
      
      const responseMessage = {
        id: Date.now(),
        role: 'assistant',
        content: '',
        status: 'streaming'
      };
      setMessages(prev => [...prev, responseMessage]);
      
      let accumulatedText = '';
      
      const handleChunk = (chunk) => {
        accumulatedText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].content = accumulatedText;
          return updated;
        });
        onChunk?.(chunk);
      };

      await ai.chat(
        messages,
        handleChunk,
        () => abortControllerRef.current?.abort(),
        true // 使用流式输出
      );

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].status = 'complete';
        return updated;
      });

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        console.error('Stream error:', error);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].status = 'error';
          updated[updated.length - 1].error = error.message;
          return updated;
        });
      }
    }
  };

  // 处理发送消息
  const handleSend = async () => {
    if (!input.trim() && !currentImage) return;

    try {
      setLoading(true);

      const newMessages = [
        ...messages,
        {
          role: 'user',
          content: currentImage ? [
            { type: 'text', text: input || '' },
            { 
              type: 'image_url', 
              image_url: { 
                url: currentImage,
                detail: "high"
              }
            }
          ] : input
        }
      ];

      setMessages(newMessages);

      await handleStream(newMessages, (chunk) => {
        const container = document.querySelector('.message-container');
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });

      setInput('');
      setCurrentImage(null);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  // 取消生成
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  // 渲染消息
  const renderMessage = (message) => {
    const isUser = message.role === 'user';
    const isStreaming = message.status === 'streaming';
    const hasError = message.status === 'error';

    return (
      <Card 
        key={message.id}
        className={\`p-4 \${
          isUser ? 'ml-auto bg-primary-50' : 'mr-auto'
        }\`}
      >
        {typeof message.content === 'string' ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div>
            <p>{message.content[0].text}</p>
            {message.content[1] && (
              <img 
                src={message.content[1].image_url.url} 
                alt="Uploaded content"
                className="max-w-xs rounded mt-2" 
              />
            )}
          </div>
        )}

        {isStreaming && (
          <div className="flex items-center gap-2 mt-2">
            <div className="animate-pulse">生成中...</div>
            <Button
              size="sm"
              color="danger"
              variant="light"
              onClick={handleCancel}
            >
              停止生成
            </Button>
          </div>
        )}

        {hasError && (
          <div className="text-danger mt-2">
            发生错误: {message.error}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <ScrollShadow className="flex-1 space-y-4 mb-4 message-container">
        {messages.map(renderMessage)}
      </ScrollShadow>

      <div className="flex items-center gap-2">
        <Button
          isIconOnly
          onClick={() => document.getElementById('imageInput').click()}
          disabled={loading}
        >
          <Icon icon="mdi:image" />
        </Button>
        <input
          type="file"
          id="imageInput"
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
        
        <Input
          className="flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          disabled={loading}
        />
        
        <Button
          color="primary"
          isLoading={loading}
          onClick={handleSend}
          disabled={(!input.trim() && !currentImage) || loading}
        >
          发送
        </Button>
      </div>

      {currentImage && (
        <div className="mt-2">
          <img
            src={currentImage}
            alt="Preview"
            className="max-h-32 rounded"
          />
          <Button
            size="sm"
            color="danger"
            variant="light"
            onClick={() => setCurrentImage(null)}
          >
            移除图片
          </Button>
        </div>
      )}
    </div>
  );
};
\`\`\`

最佳实践:
1. 数据组织:
   - 使用层级结构组织数据
   - 使用有意义的键名
   - 避免存储大型二进制数据

2. 错误处理:
   - 始终包含错误检查
   - 提供用户友好的错误消息
   - 实现重试机制

3. 性能优化:
   - 缓存频繁访问的数据
   - 批量处理数据操作
   - 实现增量更新

4. 流式输出处理:
   - 使用 AbortController 管理取消
   - 实现平滑的打字机效果
   - 优雅处理错误状态
   - 提供良好的用户反馈
`,
}

export default API_PROMPTS
