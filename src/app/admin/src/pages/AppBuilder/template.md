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
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context;

const { Avatar, Card, CardBody, Chip, Spinner } = NextUI;
const { motion } = FramerMotion;

const ChatMessage = observer(({ message, isAi }) => {
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
        return '思考中...';
      }

      // 获取代码块之前的内容
      const beforeCode = content.split('<mo-ai-script>')[0];
      return beforeCode || '正在处理...';
    }

    return content;
  };

  const displayContent = processContent(message.content);

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
              {isLoading ? (
                <div className="flex items-center gap-2 min-h-[24px] min-w-[60px]">
                  <Spinner size="sm" color="current" />
                  <span className="text-sm">
                    {message.phase === 'thinking' ? '思考中...' : '回答中...'}
                  </span>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{displayContent}</p>
              )}
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

const { Card, CardBody, Divider } = NextUI;

// 导入组件
const ChatInput = await context.wpm.import('comp_chat_input');
const ChatMessage = await context.wpm.import('comp_chat_message');
const CodePreview = await context.wpm.import('comp_code_preview');
const chatStore = await context.wpm.import('store_chat');

const ChatPage = observer(() => {
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [chatStore.messages]);

  return (
    <div className="flex h-screen">
      {/* 左侧对话区域 */}
      <div className="w-1/2 h-full flex flex-col p-4">
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

      {/* 右侧代码执行结果区域 */}
      <div className="w-1/2 h-full p-4">
        <Card className="h-full">
          <CardBody className="p-4">
            <CodePreview
              code={chatStore.lastExecutableCode}
              result={chatStore.executionResult}
              error={chatStore.executionError}
              calculating={chatStore.calculating}
            />
          </CardBody>
        </Card>
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
  lastExecutableCode = null;
  executionResult = null;
  executionError = null;
  calculating = false;
  isFirstPhase = true;
  messageIdCounter = 0;
  processingMessageId = null;

  constructor() {
    makeAutoObservable(this);
  }

  executeCode = async (code) => {
    try {
      api.log.info('开始执行代码', { code });

      const cleanCode = code.trim();

      api.log.info('处理后的代码', { cleanCode });

      const wrappedCode = `
        try {
          const result = (function() { ${cleanCode} })();
          api.log.info('代码执行结果', { result });
          return result;
        } catch (error) {
          api.log.error('代码执行出错', { error: error.message });
          throw error;
        }
      `;

      api.log.info('包装后的代码', { wrappedCode });

      const result = await new Function('api', wrappedCode)(api);

      api.log.info('最终执行结果', { result });

      return result;

    } catch (error) {
      api.log.error('代码执行失败', {
        code,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  extractCode = (content) => {
    const codeMatch = content.match(/<mo-ai-script>([\s\S]*?)<\/mo-ai-script>/);
    return codeMatch ? codeMatch[1].trim() : null;
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
    return messageId;
  }

  updateMessage = (messageId, updates) => {
    const messageIndex = this.messages.findIndex(m => m.id === messageId);
    if (messageIndex !== -1) {
      this.messages[messageIndex] = {
        ...this.messages[messageIndex],
        ...updates
      };
    }
  }

  sendMessage = async (content) => {
    try {
      this.loading = true;

      api.log.info('发送新消息', {
        content,
        isFirstPhase: this.isFirstPhase,
        phase: this.isFirstPhase ? 'first-phase' : 'second-phase'
      });

      // 添加用户消息,直接标记phase
      const userMessageId = this.addMessage({
        role: 'user',
        content,
        phase: this.isFirstPhase ? 'first-phase' : 'second-phase'
      });

      // 如果已经在处理消息,先重置状态
      if (this.processingMessageId) {
        api.log.info('重置之前的处理状态', {
          previousMessageId: this.processingMessageId
        });
        this.updateMessage(this.processingMessageId, {
          phase: 'completed'
        });
      }

      // 添加AI消息
      const aiMessageId = this.addMessage({
        role: 'ai',
        content: '',
        phase: this.isFirstPhase ? 'thinking' : 'answering'
      });

      this.processingMessageId = aiMessageId;
      this.calculating = true;

      if (this.isFirstPhase) {
        await ai.chat([
          {
            role: 'system',
            content: `你是一个使用代码思考的AI助手。当遇到需要计算、数据处理或逻辑分析的问题时:
1. 判断是否需要通过 Javascript 代码来思考
2. 如果需要,将代码放在<mo-ai-script>标签中
3. 代码必须有返回值，最后一个行必须是 return xxx
4. 代码执行后会返回结果给你
5. 你必须根据代码的执行结果来回答问题,不要主观判断
6. 如果不需要代码,直接回答问题
7. 如果代码执行出错,要说明错误原因`
          },
          {
            role: 'user',
            content
          }
        ], {
          onChunk: async (chunk) => {
            runInAction(() => {
              api.log.info('收到AI响应chunk', { chunk, messageId: aiMessageId });
              this.updateMessage(aiMessageId, {
                content: (this.messages.find(m => m.id === aiMessageId)?.content || '') + chunk
              });

              const code = this.extractCode(this.messages.find(m => m.id === aiMessageId)?.content || '');
              if (code && code !== this.lastExecutableCode) {
                this.lastExecutableCode = code;

                api.log.info('检测到新的代码块', { code });

                this.executeCode(code)
                  .then(result => {
                    runInAction(() => {
                      this.executionResult = result;
                      this.executionError = null;
                      this.updateMessage(aiMessageId, {
                        executionResult: result,
                        phase: 'executed'
                      });
                      this.isFirstPhase = false;

                      api.log.info('代码执行成功', {
                        result,
                        code,
                        messageId: aiMessageId
                      });

                      // 自动触发第二阶段
                      this.sendMessage(content);
                    });
                  })
                  .catch(error => {
                    runInAction(() => {
                      this.executionError = error.message;
                      this.executionResult = null;
                      this.updateMessage(aiMessageId, {
                        error: true,
                        errorMessage: error.message,
                        phase: 'error'
                      });

                      api.log.error('代码执行失败', {
                        error: error.message,
                        code,
                        messageId: aiMessageId
                      });
                    });
                  });
              }
            });
          },
          onResult: () => {
            api.log.info('第一阶段AI对话完成', {
              hasCode: !!this.lastExecutableCode,
              result: this.executionResult,
              messageId: aiMessageId
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
              phase: 'first',
              messageId: aiMessageId
            });
            runInAction(() => {
              this.updateMessage(aiMessageId, {
                error: true,
                errorMessage: error.message,
                phase: 'error'
              });
              this.calculating = false;
            });
          }
        });
      } else {
        await ai.chat([
          {
            role: 'system',
            content: '这是代码执行的结果,请根据这个结果来回答用户的问题,不要主观判断。注意回答要简洁清晰,完全基于代码执行结果。'
          },
          {
            role: 'user',
            content: `问题:${content}\n执行结果:${JSON.stringify(this.executionResult)}`
          }
        ], {
          onChunk: (chunk) => {
            runInAction(() => {
              this.updateMessage(aiMessageId, {
                content: (this.messages.find(m => m.id === aiMessageId)?.content || '') + chunk
              });
            });
          },
          onResult: () => {
            api.log.info('第二阶段AI对话完成', {
              messageId: aiMessageId
            });
            runInAction(() => {
              this.calculating = false;
              this.isFirstPhase = true;
              this.lastExecutableCode = null;
              this.executionResult = null;
              this.processingMessageId = null;
              this.updateMessage(aiMessageId, {
                phase: 'completed'
              });
            });
          },
          onError: (error) => {
            api.log.error('AI 对话失败', {
              error: error.message,
              phase: 'second',
              messageId: aiMessageId
            });
            runInAction(() => {
              this.updateMessage(aiMessageId, {
                error: true,
                errorMessage: error.message,
                phase: 'error'
              });
              this.calculating = false;
              this.isFirstPhase = true;
              this.processingMessageId = null;
            });
          }
        });
      }

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
