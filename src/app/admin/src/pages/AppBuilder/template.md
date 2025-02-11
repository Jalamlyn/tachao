# 应用代码导出

## All Modules

```jsx
<mo-ai-code type="app">
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
} = context;

const { Routes, Route, Navigate, useNavigate } = ReactRouterDom;

// 导入页面组件
const ChatPage = await context.wpm.import('page_chat');

const App = observer(() => {
  const navigate = useNavigate();

  return (
    <NextUI.NextUIProvider navigate={navigate}>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </NextUI.NextUIProvider>
  );
});

context.wpm.export(appId, App);
App.displayName = 'App';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_chat_input" title="对话输入组件">
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
} = context;

const { Input, Button } = NextUI;

const ChatInput = observer(({ onSend, loading }) => {
  const [message, setMessage] = React.useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="输入问题..."
        className="flex-1"
        size="lg"
        endContent={
          <Button
            isIconOnly
            color="primary"
            size="sm"
            isLoading={loading}
            onClick={handleSend}
          >
            <Icon icon="solar:arrow-up-linear" className="w-4 h-4" />
          </Button>
        }
      />
    </div>
  );
});

context.wpm.export('comp_chat_input', ChatInput);
ChatInput.displayName = 'ChatInput';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_chat_message" title="对话消息组件">
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
} = context;

const { Avatar, Card, CardBody, Chip } = NextUI;
const { motion } = FramerMotion;

const ChatMessage = observer(({ message, isAi }) => {
  const [dots, setDots] = React.useState('');

  React.useEffect(() => {
    let interval;
    if (message.phase === 'thinking' || message.phase === 'answering') {
      interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
    }
    return () => clearInterval(interval);
  }, [message.phase]);

  // 如果是第二阶段的用户消息,不显示
  if (!isAi && message.phase === 'second-phase') {
    api.log.info('跳过显示第二阶段用户消息', {
      messageId: message.id,
      content: message.content
    });
    return null;
  }

  const hasError = message.error && message.errorMessage;
  const isLoading = message.phase === 'thinking' || message.phase === 'answering';

  // 处理消息内容,如果包含代码块则隐藏
  const processContent = (content) => {
    if (!content) return '';

    // 检查是否包含代码块
    const hasCodeBlock = content.includes('<mo-ai-script>');
    if (hasCodeBlock) {
      // 如果是第一阶段且包含代码,返回思考中
      if (message.phase === 'thinking') {
        return '思考中';
      }

      // 获取代码块之前的内容
      const beforeCode = content.split('<mo-ai-script>')[0];
      return beforeCode || '正在处理';
    }

    return content;
  };

  const displayContent = processContent(message.content);

  // 获取加载状态文本
  const getLoadingText = () => {
    switch (message.phase) {
      case 'thinking':
        return '思考中';
      case 'answering':
        return displayContent || '生成回答中';
      case 'executing':
        return '执行代码中';
      default:
        return '处理中';
    }
  };

  api.log.info('渲染消息组件', {
    messageId: message.id,
    phase: message.phase,
    hasError,
    isLoading,
    content: displayContent?.slice(0, 100)
  });

  return (
    <div className={cn("flex gap-3 mb-4", {
      "justify-end": !isAi
    })}>
      {isAi && (
        <Avatar
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=34&h=34"
          size="sm"
          className="flex-shrink-0"
        />
      )}
      <div className={cn("flex flex-col max-w-[80%]", {
        "items-end": !isAi
      })}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={cn("mb-1", {
            "bg-primary text-white": !isAi,
            "bg-default-100": isAi
          })}>
            <CardBody className="py-2 px-3">
              <p className="text-sm whitespace-pre-wrap">
                {isLoading ? `${getLoadingText()}${dots}` : displayContent}
              </p>
            </CardBody>
          </Card>
        </motion.div>

        {hasError && (
          <motion.div
            className="mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Chip
              variant="flat"
              color="danger"
              size="sm"
              startContent={
                <Icon
                  icon="solar:danger-triangle-bold-duotone"
                  className="w-3 h-3"
                />
              }
            >
              {message.errorMessage}
            </Chip>
          </motion.div>
        )}

        <div className="mt-1 flex items-center gap-2">
          <time className="text-xs text-default-400">
            {new Date(message.timestamp).toLocaleTimeString()}
          </time>
          {isAi && message.executionResult !== undefined && (
            <Chip
              variant="flat"
              color="success"
              size="sm"
              startContent={
                <Icon
                  icon="solar:code-circle-line-duotone"
                  className="w-3 h-3"
                />
              }
            >
              代码已执行
            </Chip>
          )}
        </div>
      </div>
      {!isAi && (
        <Avatar
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=34&h=34"
          size="sm"
          className="flex-shrink-0"
        />
      )}
    </div>
  );
});

context.wpm.export('comp_chat_message', ChatMessage);
ChatMessage.displayName = 'ChatMessage';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_code_preview" title="代码预览组件">
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
} = context;

const { Card, CardBody, Divider, Chip, Spinner } = NextUI;

const CodePreview = observer(({ code, result, error, calculating }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">执行代码</h3>
          {code && (
            <Chip
              variant="flat"
              color="primary"
              size="sm"
              startContent={
                <Icon
                  icon="solar:code-square-line-duotone"
                  className="w-3 h-3"
                />
              }
            >
              JavaScript
            </Chip>
          )}
        </div>
        {code ? (
          <Card className="bg-default-50">
            <CardBody>
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                <code>{code}</code>
              </pre>
            </CardBody>
          </Card>
        ) : (
          <p className="text-default-500">暂无代码</p>
        )}
      </div>

      <Divider />

      <div className="flex-1 mt-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">执行结果</h3>
          {calculating ? (
            <Chip
              variant="flat"
              color="warning"
              size="sm"
              startContent={<Spinner size="sm" />}
            >
              计算中...
            </Chip>
          ) : result !== undefined && !error ? (
            <Chip
              variant="flat"
              color="success"
              size="sm"
              startContent={
                <Icon
                  icon="solar:check-circle-line-duotone"
                  className="w-3 h-3"
                />
              }
            >
              执行成功
            </Chip>
          ) : error ? (
            <Chip
              variant="flat"
              color="danger"
              size="sm"
              startContent={
                <Icon
                  icon="solar:danger-triangle-line-duotone"
                  className="w-3 h-3"
                />
              }
            >
              执行失败
            </Chip>
          ) : null}
        </div>
        <Card className="bg-default-50 h-[calc(100%-3rem)]">
          <CardBody className="overflow-auto">
            {calculating ? (
              <div className="flex items-center justify-center h-full text-default-500">
                <Spinner label="正在计算..." />
              </div>
            ) : error ? (
              <div className="text-danger">
                <p className="font-medium mb-1">错误信息:</p>
                <pre className="text-sm">{error}</pre>
              </div>
            ) : result !== undefined ? (
              <pre className="text-sm whitespace-pre-wrap">
                {typeof result === 'object'
                  ? JSON.stringify(result, null, 2)
                  : String(result)
                }
              </pre>
            ) : (
              <p className="text-default-500">暂无结果</p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
});

context.wpm.export('comp_code_preview', CodePreview);
CodePreview.displayName = 'CodePreview';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_iframe_preview" title="iframe预览组件">
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
} = context;

const { Card, CardBody, CardHeader, Chip, Spinner } = NextUI;

const IframePreview = observer(({ html, error, calculating }) => {
  const iframeRef = React.useRef(null);

  // HTML 模板
  const getTemplate = (content) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            background: transparent;
          }
        </style>
      </head>
      <body>
        ${content || ''}
      </body>
    </html>
  `;

  // 重置 iframe
  const resetIframe = () => {
    if (iframeRef.current) {
      try {
        const doc = iframeRef.current.contentDocument;
        doc.open();
        doc.write(getTemplate(''));
        doc.close();

        api.log.info('重置 iframe 内容');
      } catch (error) {
        api.log.error('重置 iframe 失败', { error });
      }
    }
  };

  // 更新 iframe 内容
  React.useEffect(() => {
    if (!iframeRef.current) return;

    try {
      api.log.info('准备更新 iframe 内容', {
        hasHtml: !!html,
        htmlLength: html?.length,
        calculating,
        error
      });

      const doc = iframeRef.current.contentDocument;
      doc.open();
      doc.write(getTemplate(html));
      doc.close();

      api.log.info('更新 iframe 内容成功');
    } catch (error) {
      api.log.error('更新 iframe 内容失败', { error });
      resetIframe();
    }
  }, [html, calculating, error]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">预览效果</h3>
        {calculating ? (
          <Chip
            variant="flat"
            color="warning"
            size="sm"
            startContent={<Spinner size="sm" />}
          >
            生成中...
          </Chip>
        ) : error ? (
          <Chip
            variant="flat"
            color="danger"
            size="sm"
            startContent={
              <Icon
                icon="solar:danger-triangle-line-duotone"
                className="w-3 h-3"
              />
            }
          >
            生成失败
          </Chip>
        ) : html ? (
          <Chip
            variant="flat"
            color="success"
            size="sm"
            startContent={
              <Icon
                icon="solar:check-circle-line-duotone"
                className="w-3 h-3"
              />
            }
          >
            预览就绪
          </Chip>
        ) : null}
      </div>

      <Card className="flex-1">
        <CardBody className="p-0 overflow-hidden">
          {error ? (
            <div className="p-4 text-danger">
              <p className="font-medium mb-1">错误信息:</p>
              <pre className="text-sm whitespace-pre-wrap">{error}</pre>
            </div>
          ) : calculating ? (
            <div className="h-full flex items-center justify-center">
              <Spinner label="正在生成..." />
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="预览"
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
});

context.wpm.export('comp_iframe_preview', IframePreview);
IframePreview.displayName = 'IframePreview';
</mo-ai-code>
```

```jsx
<mo-ai-code type="markdown" name="readme" title="应用说明文档">
# 多页应用说明文档

## 简介
这是一个使用 AI 助手创建的多页应用程序。该应用采用现代化的技术栈和组件库,提供了良好的用户界面和交互体验。

## 功能特性
- 路由系统:使用 React Router 进行页面导航
- 响应式设计:适配不同屏幕尺寸
- 现代化UI:使用 NextUI 组件库
- 状态管理:采用 MobX 进行状态管理

## 项目结构
```

└── App.jsx # 应用入口(包含路由配置和主要内容)

```

## 开发指南
1. 使用 AI 助手:
   - 在左侧输入您的需求
   - AI 将帮助您开发新功能或修改现有功能

2. 自定义开发:
   - 遵循 React 最佳实践
   - 使用 NextUI 组件库构建界面
   - 使用 MobX 进行状态管理

## 技术栈
- React
- NextUI
- React Router
- MobX
- Tailwind CSS

## 集成说明
- 此多页应用支持集成单页应用模块
- 可以通过导入单页应用组件来扩展功能

## 后续计划
- 添加更多功能模块
- 优化用户体验
- 完善文档说明

## 贡献指南
欢迎提供建议和反馈,一起改进这个应用!
</mo-ai-code>
```

```jsx
<mo-ai-code type="module" name="utils_debounce" title="防抖工具函数">
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
} = context;

const debounce = (func, wait = 300) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

context.wpm.export('utils_debounce', debounce);
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_chat" title="AI对话页面">
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
} = context;

const { Card, CardBody } = NextUI;

// 导入组件
const ChatInput = await context.wpm.import('comp_chat_input');
const ChatMessage = await context.wpm.import('comp_chat_message');
const IframePreview = await context.wpm.import('comp_iframe_preview');
const chatStore = await context.wpm.import('store_chat');

const ChatPage = observer(() => {
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [chatStore.messages]);

  // 添加布局变化日志
  React.useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024;
      api.log.info('布局响应变化', {
        screenWidth: window.innerWidth,
        isLargeScreen,
        leftWidth: isLargeScreen ? '30%' : '50%',
        rightWidth: isLargeScreen ? '70%' : '50%'
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始检查

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="grid h-screen grid-cols-2 lg:grid-cols-4 transition-all duration-300">
      {/* 左侧对话区域 */}
      <div className="h-full flex flex-col p-4">
        <Card className="flex-1 mb-4">
          <CardBody className="p-4 overflow-y-auto">
            {chatStore.messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                isAi={message.role === 'ai'}
                calculating={index === chatStore.messages.length - 1 && message.role === 'ai' && chatStore.calculating}
              />
            ))}
            <div ref={messagesEndRef} />
          </CardBody>
        </Card>
        <ChatInput
          onSend={chatStore.sendMessage}
          loading={chatStore.loading}
        />
      </div>

      {/* 右侧预览区域 */}
      <div className="h-full p-4 lg:col-span-3">
        <IframePreview
          html={chatStore.previewHtml}
          error={chatStore.previewError}
          calculating={chatStore.calculating}
        />
      </div>
    </div>
  );
});

context.wpm.export('page_chat', ChatPage);
ChatPage.displayName = 'ChatPage';
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_chat" title="对话状态管理">
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
} = context;

const { makeAutoObservable, runInAction } = mobx;

class ChatStore {
  messages = [];
  loading = false;
  previewHtml = null;
  previewError = null;
  calculating = false;
  messageIdCounter = 0;

  constructor() {
    makeAutoObservable(this);
  }

  extractHtml = (content) => {
    const htmlMatch = content.match(/<mo-ai-html>([\s\S]*?)<\/mo-ai-html>/);
    const html = htmlMatch ? htmlMatch[1].trim() : null;

    api.log.info('提取HTML内容', {
      hasMatch: !!htmlMatch,
      htmlLength: html?.length,
      contentLength: content?.length,
      content: content?.slice(0, 100)
    });

    return html;
  }

  generateMessageId = () => {
    return `msg_${Date.now()}_${this.messageIdCounter++}`;
  }

  addMessage = (message) => {
    const messageId = this.generateMessageId();
    this.messages.push({
      ...message,
      id: messageId,
      timestamp: new Date().toISOString()
    });

    api.log.info('添加新消息', {
      messageId,
      role: message.role,
      phase: message.phase
    });

    return messageId;
  }

  updateMessage = (messageId, updates) => {
    const messageIndex = this.messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      this.messages[messageIndex] = {
        ...this.messages[messageIndex],
        ...updates
      };

      api.log.info('更新消息', {
        messageId,
        updates: Object.keys(updates),
        newContent: updates.content?.slice(0, 100)
      });

      // 检查更新的内容中是否包含HTML
      if (updates.content) {
        const html = this.extractHtml(updates.content);
        if (html) {
          api.log.info('检测到HTML内容更新', {
            messageId,
            htmlLength: html.length
          });
          runInAction(() => {
            this.previewHtml = html;
            this.previewError = null;
          });
        }
      }
    }
  }

  sendMessage = async (content) => {
    try {
      this.loading = true;

      api.log.info('发送新消息', { content });

      // 添加用户消息
      const userMessageId = this.addMessage({
        role: 'user',
        content,
        phase: 'completed'
      });

      // 添加AI消息
      const aiMessageId = this.addMessage({
        role: 'ai',
        content: '',
        phase: 'thinking'
      });

      this.calculating = true;

      await ai.chat([
        {
          role: 'system',
          content: `你是一个使用HTML和Tailwind CSS来实现UI的AI助手。当遇到需要实现界面效果的问题时:
1. 使用HTML和Tailwind CSS和JavaScript来实现界面
2. 将HTML代码放在<mo-ai-html>标签中
3. 代码必须是完整的HTML结构
4. 使用Tailwind CSS来实现样式
5. 你必须根据用户的需求来实现界面
6. 如果实现出错,要说明错误原因`
        },
        {
          role: 'user',
          content
        }
      ], {
        onChunk: (chunk) => {
          runInAction(() => {
            api.log.info('收到AI响应chunk', {
              chunk: chunk.slice(0, 100),
              messageId: aiMessageId
            });

            // 更新消息内容
            const currentMessage = this.messages.find(m => m.id === aiMessageId);
            const newContent = (currentMessage?.content || '') + chunk;

            this.updateMessage(aiMessageId, {
              content: newContent,
              phase: 'answering'
            });

            // 检查并更新预览HTML
            const html = this.extractHtml(newContent);
            if (html) {
              this.previewHtml = html;
              this.previewError = null;

              api.log.info('更新预览HTML', {
                htmlLength: html.length,
                messageId: aiMessageId
              });
            }
          });
        },
        onResult: () => {
          api.log.info('AI对话完成', {
            messageId: aiMessageId,
            hasHtml: !!this.previewHtml
          });

          runInAction(() => {
            this.calculating = false;
            this.updateMessage(aiMessageId, {
              phase: 'completed'
            });
          });
        },
        onError: (error) => {
          api.log.error('AI 对话失败', {
            error: error.message,
            messageId: aiMessageId
          });

          runInAction(() => {
            this.updateMessage(aiMessageId, {
              error: true,
              errorMessage: error.message,
              phase: 'error'
            });
            this.calculating = false;
            this.previewError = error.message;
          });
        }
      });

    } catch (error) {
      api.log.error('发送消息失败', {
        error: error.message,
        userMessage: content
      });
      message.error('发送消息失败');
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  };
}

const chatStore = new ChatStore();
context.wpm.export('store_chat', chatStore);
</mo-ai-code>
```
