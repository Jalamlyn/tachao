```jsx
<mo-ai-code type="component" name="comp_ai_chat">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  ai
} = context;

const { Card, CardBody, Button, Avatar, ScrollShadow, Input } = NextUI;
const AIContext = await context.wpm.import('comp_ai_context');

const AIChat = observer(() => {
  const [messages, setMessages] = React.useState([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef(null);
  const abortControllerRef = React.useRef(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    // 初始化系统消息
    const systemContext = AIContext.generateContext();
    setMessages([
      {
        role: 'assistant',
        content: '您好，我是您的送货助手。我可以帮您：\n\n1. 查询订单状态\n2. 分析销售数据\n3. 回答送货相关问题\n\n请问有什么可以帮您？'
      }
    ]);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let currentResponse = '';
      const systemContext = AIContext.generateContext();
      const allMessages = [
        {
          role: 'system',
          content: `你是一个专业的送货助手，负责解答与送货相关的问题。以下是当前系统状态，请基于这些信息来回答：

${systemContext}

注意事项：
1. 只回答与送货、订单、销售相关的问题
2. 给出准确、简洁的回答
3. 使用礼貌、专业的语气
4. 如果遇到不确定的情况，请说明无法确定`
        },
        ...messages,
        userMessage
      ];

      await ai.chat(allMessages, {
        onChunk: (chunk) => {
          currentResponse += chunk;
          setMessages(prev => {
            const newMessages = [...prev];
            if (newMessages[newMessages.length - 1]?.role === 'assistant') {
              newMessages[newMessages.length - 1].content = currentResponse;
            } else {
              newMessages.push({ role: 'assistant', content: currentResponse });
            }
            return newMessages;
          });
        },
        onError: (error) => {
          console.error('Chat error:', error);
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: '抱歉，处理您的请求时出现错误，请重试。' }
          ]);
        }
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="flex-1">
        <CardBody>
          <ScrollShadow ref={scrollRef} className="h-[calc(100vh-300px)]">
            <div className="flex flex-col gap-4 p-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn("flex gap-3", {
                    "flex-row-reverse": msg.role === "user"
                  })}
                >
                  <Avatar
                    src={msg.role === "assistant" ? "https://avatars.githubusercontent.com/u/30373425?v=4" : ""}
                    className="flex-shrink-0"
                  />
                  <div
                    className={cn(
                      "flex max-w-[80%] rounded-lg p-3",
                      msg.role === "assistant"
                        ? "bg-content2"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-default-400">
                  <div className="animate-spin h-4 w-4 rounded-full border-b-2 border-primary"></div>
                  AI正在思考...
                </div>
              )}
            </div>
          </ScrollShadow>
        </CardBody>
      </Card>

      <div className="flex gap-2">
        <Input
          fullWidth
          placeholder="输入您的问题..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          endContent={
            isLoading ? (
              <Button
                isIconOnly
                color="danger"
                variant="light"
                onPress={() => abortControllerRef.current?.()}
              >
                <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                isIconOnly
                color={inputValue ? "primary" : "default"}
                variant={inputValue ? "solid" : "flat"}
                onPress={handleSend}
                disabled={!inputValue}
              >
                <Icon
                  className={cn(
                    "[&>path]:stroke-[2px]",
                    inputValue ? "text-primary-foreground" : "text-default-500"
                  )}
                  icon="solar:arrow-up-linear"
                  width={20}
                />
              </Button>
            )
          }
        />
      </div>
    </div>
  );
});

context.wpm.export('comp_ai_chat', AIChat);
</mo-ai-code>
```