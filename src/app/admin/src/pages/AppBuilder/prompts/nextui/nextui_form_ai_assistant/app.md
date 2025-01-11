# 应用代码导出

## All Modules

```jsx
<mo-ai-code type="app">
const {
  wpm,
  React,
  observer,
  NextUI,
  appId,
  Icon,
  FramerMotion
} = context;

const { motion } = FramerMotion;

// 导入组件
const AIChat = await wpm.import('comp_ai_chat');

const App = observer(() => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 md:p-8"
    >
      <div className="h-full max-w-6xl mx-auto">
        {/* AI 聊天组件 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="h-full"
        >
          <AIChat />
        </motion.div>
      </div>
    </motion.div>
  );
});

// 导出应用入口
context.wpm.export(appId, App);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_ai_chat" title="AI聊天组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  FramerMotion
} = context;

const { Card, CardBody, Button, Avatar, ScrollShadow, Input, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Divider } = NextUI;
const { useRef, useState, useEffect } = React;
const { motion, AnimatePresence } = FramerMotion;

const AIContext = await wpm.import('comp_ai_context');
const settingsStore = await wpm.import('store_settings');
const formIndexStore = await wpm.import('store_form_index');

// AI头像组件
const AIAvatar = ({ isThinking = false }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <Avatar
          src="https://6d6f-mobenai-weapp-dev-2e8qhi3a963364-1259692580.tcb.qcloud.la/uploads/1736613945428-2cqivx.png"
          className={cn(
            "w-10 h-10 bg-primary/10",
            "border-2 border-primary/20",
            isThinking && "animate-pulse"
          )}
          imgProps={{
            className: "object-cover"
          }}
        />
        {isThinking && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </div>
    </motion.div>
  );
};

// 消息气泡组件
const MessageBubble = ({ message, isLoading, isLast }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex gap-3",
        isUser && "flex-row-reverse"
      )}
    >
      {isUser ? (
        <Avatar
          icon={<Icon icon="solar:user-linear" className="w-6 h-6"/>}
          className="bg-primary/10 border-2 border-primary/20 w-10 h-10"
        />
      ) : (
        <AIAvatar isThinking={isLoading && isLast} />
      )}
      <div className={cn(
        "flex max-w-[80%] rounded-2xl p-4",
        "shadow-sm backdrop-blur-sm",
        isUser
          ? "bg-primary text-primary-foreground"
          : "bg-content2/80"
      )}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
};

// 快捷操作按钮组
const QuickActions = ({ onSelect }) => {
  const actions = [
    {
      icon: "solar:chart-2-linear",
      label: '数据统计',
      content: '请帮我统计一下当前表单的数据',
      color: 'primary'
    },
    {
      icon: "solar:magnifer-linear",
      label: '查找记录',
      content: '我想查找一条具体的记录',
      color: 'secondary'
    },
    {
      icon: "solar:chart-linear",
      label: '数据分析',
      content: '请帮我分析一下数据的分布情况',
      color: 'success'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap gap-2"
    >
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            size="sm"
            variant="flat"
            color={action.color}
            startContent={<Icon icon={action.icon} className="w-4 h-4"/>}
            onPress={() => onSelect(action.content)}
            className="backdrop-blur-sm"
          >
            {action.label}
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};

const AIChat = observer(() => {
  // ... 保持原有的状态和引用定义 ...
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formIdInput, setFormIdInput] = useState('');
  const [inputError, setInputError] = useState('');

  // ... 保持原有的副作用和方法定义 ...
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      const scrollToBottom = () => {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth'
        });
      };
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      try {
        setIsLoading(true);
        const { display } = await AIContext.generateContext();
        setMessages([
          {
            role: 'assistant',
            content: display
          }
        ]);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setMessages([
          {
            role: 'assistant',
            content: '系统初始化中，请稍后再试...'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    initChat();
  }, [settingsStore.appId]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let currentResponse = '';
      const aiContext = await AIContext.generateContext();
      const allMessages = [
        {
          role: 'system',
          content: `你是一个智能表单助手，负责解答与表单数据相关的问题。\n\n${aiContext.context}\n\n注意事项：\n1. 只回答与当前表单相关的问题\n2. 给出准确、简洁的回答\n3. 使用礼貌、专业的语气\n4. 如果遇到不确定的情况，请说明无法确定`
        },
        ...messages,
        userMessage
      ];

      await context.ai.chat(allMessages, {
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

  const handleFormIdSubmit = async () => {
    if (!formIdInput.trim()) {
      setInputError('请输入表单ID');
      return;
    }

    try {
      settingsStore.setAppId(formIdInput.trim());
      setIsModalOpen(false);
      setFormIdInput('');
      setInputError('');
    } catch (error) {
      setInputError(error.message);
    }
  };

  const handleRefreshData = async () => {
    if (!settingsStore.appId || formIndexStore.loading) return;

    try {
      await formIndexStore.refreshData(settingsStore.appId);
      const { display } = await AIContext.generateContext();
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '数据已更新。' + display
        }
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  return (
    <Card className="h-full w-full max-w-4xl mx-auto backdrop-blur-xl bg-background/70 shadow-xl">
      <CardBody className="p-0 overflow-hidden h-full">
        <div className="flex h-full flex-col">
          {/* 头部：表单选择器 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 border-b border-divider backdrop-blur-xl bg-background/70"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Icon icon="solar:form-linear" className="w-5 h-5 text-primary"/>
              </div>
              <div>
                <h3 className="font-medium">智能表单 AI 助手</h3>
                <p className="text-xs text-default-500">
                  {settingsStore.appId ? (
                    <span className="flex items-center gap-1">
                      当前表单：{settingsStore.appId}
                      {formIndexStore.lastUpdateTime && (
                        <Tooltip
                          content={`最后更新: ${formIndexStore.lastUpdateTime.toLocaleString()}`}
                        >
                          <span className="text-default-400 cursor-help">
                            <Icon icon="solar:info-circle-linear" className="w-3 h-3"/>
                          </span>
                        </Tooltip>
                      )}
                    </span>
                  ) : '请选择要查询的表单'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip content="刷新数据">
                <Button
                  isIconOnly
                  variant="light"
                  onPress={handleRefreshData}
                  isLoading={formIndexStore.loading}
                  isDisabled={!settingsStore.appId}
                  className="backdrop-blur-sm"
                >
                  <Icon icon="solar:refresh-linear" className="w-4 h-4"/>
                </Button>
              </Tooltip>
              <Button
                variant="flat"
                startContent={<Icon icon="solar:settings-linear" className="w-4 h-4"/>}
                onPress={() => setIsModalOpen(true)}
                className="backdrop-blur-sm"
              >
                {settingsStore.appId ? '切换表单' : '选择表单'}
              </Button>
            </div>
          </motion.div>

          {/* 消息列表 */}
          <ScrollShadow ref={scrollRef} className="flex-1 p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-6"
            >
              <AnimatePresence mode="popLayout">
                {messages.map((msg, index) => (
                  <MessageBubble
                    key={index}
                    message={msg}
                    isLoading={isLoading}
                    isLast={index === messages.length - 1}
                  />
                ))}
              </AnimatePresence>

              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <MessageBubble
                  message={{ role: 'assistant', content: 'AI正在思考...' }}
                  isLoading={true}
                  isLast={true}
                />
              )}
            </motion.div>
          </ScrollShadow>

          {/* 输入区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-4 p-4 border-t border-divider backdrop-blur-xl bg-background/70"
          >
            {/* 快捷操作按钮 */}
            {!inputValue && !isLoading && (
              <QuickActions onSelect={setInputValue} />
            )}

            {/* 输入框 */}
            <div className={cn(
              "group relative rounded-xl transition-all duration-200",
              isFocused ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-default-200"
            )}>
              <Input
                ref={inputRef}
                fullWidth
                placeholder={settingsStore.appId ?
                  "输入您的问题..." :
                  "请先选择要查询的表单..."
                }
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isLoading || !settingsStore.appId}
                classNames={{
                  input: "pr-20",
                  inputWrapper: cn(
                    "h-12 bg-default-100/50 hover:bg-default-200/50",
                    "group-hover:bg-default-100/50",
                    "transition-background duration-200",
                    "backdrop-blur-sm"
                  )
                }}
                endContent={
                  <div className="flex items-center gap-2 pr-2">
                    {isLoading ? (
                      <Tooltip content="取消">
                        <Button
                          isIconOnly
                          color="danger"
                          variant="light"
                          size="sm"
                          onPress={() => abortControllerRef.current?.()}
                          className="backdrop-blur-sm"
                        >
                          <Icon icon="solar:close-circle-bold" className="h-5 w-5" />
                        </Button>
                      </Tooltip>
                    ) : inputValue ? (
                      <Button
                        isIconOnly
                        color="primary"
                        size="sm"
                        variant="flat"
                        onPress={handleSend}
                        className="h-8 w-8 backdrop-blur-sm"
                      >
                        <Icon icon="solar:arrow-up-linear" className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Tooltip content="按 Enter 发送">
                        <Button
                          isIconOnly
                          variant="light"
                          size="sm"
                          className="text-default-400 backdrop-blur-sm"
                          disabled
                        >
                          <Icon icon="solar:arrow-up-linear" className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                }
              />
            </div>
          </motion.div>
        </div>
      </CardBody>

      {/* 表单ID输入Modal */}
      <Modal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onClose={() => {
          setFormIdInput('');
          setInputError('');
        }}
        classNames={{
          backdrop: "backdrop-blur-sm bg-[#000000/30]",
          base: "border-1 border-white/20 bg-background/70 dark:bg-default-100/50 backdrop-blur-md"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">设置表单ID</h3>
            <p className="text-sm text-default-500">请输入要查询的表单ID</p>
          </ModalHeader>
          <ModalBody>
            <Input
              label="表单ID"
              placeholder="请输入表单ID"
              value={formIdInput}
              onChange={(e) => {
                setFormIdInput(e.target.value);
                setInputError('');
              }}
              errorMessage={inputError}
              isInvalid={!!inputError}
              startContent={
                <Icon icon="solar:form-linear" className="w-4 h-4 text-default-400" />
              }
            />
            {settingsStore.recentAppIds.length > 0 && (
              <div className="mt-4">
                <Divider className="my-4" />
                <p className="text-sm text-default-500 mb-3">最近使用的表单</p>
                <div className="flex flex-wrap gap-2">
                  {settingsStore.recentAppIds.map((id) => (
                    <Button
                      key={id}
                      size="sm"
                      variant="flat"
                      onPress={() => {
                        setFormIdInput(id);
                        setInputError('');
                      }}
                      startContent={<Icon icon="solar:clock-circle-linear" className="w-3 h-3" />}
                    >
                      {id}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => {
                setIsModalOpen(false);
                setFormIdInput('');
                setInputError('');
              }}
            >
              取消
            </Button>
            <Button
              color="primary"
              onPress={handleFormIdSubmit}
              startContent={<Icon icon="solar:check-circle-linear" className="w-4 h-4" />}
            >
              确认
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
});

context.wpm.export('comp_ai_chat', AIChat);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_ai_context" title="AI上下文生成组件">
const { wpm, api } = context;

const formService = await wpm.import('service_form');
const settingsStore = await wpm.import('store_settings');
const formIndexStore = await wpm.import('store_form_index');

// 生成AI对话上下文
const generateContext = async () => {
  try {
    // 获取当前用户信息
    const userInfo = await api.getCurrentAccountInfo();

    // 获取当前时间
    const now = new Date();
    const currentTime = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    if(!settingsStore.appId) {
      return {
        display: '请先设置要查询的表单ID',
        context: `系统未设置表单ID，无法提供数据支持。
当前时间：${currentTime}
当前用户：${userInfo.name}(${userInfo.account})`
      };
    }

    // 加载表单索引和详情数据
    await formIndexStore.loadFormIndex(settingsStore.appId);
    if(formIndexStore.error) {
      return {
        display: `加载表单数据失败：${formIndexStore.error}\n\n请检查表单ID是否正确，或稍后重试。`,
        context: `表单加载失败：${formIndexStore.error}
当前时间：${currentTime}
当前用户：${userInfo.name}(${userInfo.account})`
      };
    }

    if(!formIndexStore.indexData?.data?.length) {
      return {
        display: '未找到表单数据。请检查表单ID是否正确。',
        context: `表单数据为空
当前时间：${currentTime}
当前用户：${userInfo.name}(${userInfo.account})`
      };
    }

    // 获取索引数据和详情数据
    const indexData = formIndexStore.indexData.data;
    const detailsData = formIndexStore.details;

    // 处理详情数据，移除 config 和 status 字段
    const processedDetails = detailsData.map(detail => {
      const { config, status, ...rest } = detail;
      return rest;
    });

    // 生成用于显示的简要信息
    const displayMessage = `我是智能表单助手，可以帮您查询和分析表单数据。

当前已加载 ${indexData.length} 条表单记录，包含完整的表单详情数据。

您可以：
• 查看数据统计
• 搜索特定记录
• 分析数据趋势
• 导出数据报表
• 查询具体表单详情

请问有什么可以帮您？`;

    // 生成完整的上下文信息（仅供AI使用）
    const fullContext = `系统信息：
- 当前时间：${currentTime}
- 当前用户：${userInfo.name}(${userInfo.account})
- 用户组织：${userInfo.organizationId}

表单数据概览：
- 表单ID：${settingsStore.appId}
- 索引数据总量：${indexData.length}条
- 已加载详情数量：${processedDetails.length}条

索引数据结构：
${JSON.stringify(indexData[0], null, 2)}

表单详情数据：
${JSON.stringify(processedDetails, null, 2)}

注意：
1. 在回答问题时，可以根据当前时间和用户身份提供更个性化的回答
2. 如果涉及到数据权限，需要考虑用户所属组织
3. 时间相关的分析要基于当前时间进行
4. 可以使用表单详情数据提供更准确的答案`;

    return {
      display: displayMessage,
      context: fullContext
    };

  } catch(error) {
    console.error('Failed to generate context:', error);
    return {
      display: '生成上下文失败，请检查表单ID是否正确，或稍后重试。',
      context: `错误信息：${error.message}
当前时间：${new Date().toLocaleString('zh-CN')}
当前用户：系统未能获取用户信息`
    };
  }
};

context.wpm.export('comp_ai_context', {
  generateContext
});
</mo-ai-code>
```

```jsx
<mo-ai-code type="markdown" name="readme" title="应用说明文档">
# 单页应用模块说明文档

## 简介
这是一个使用 AI 助手创建的单页应用模块。该模块采用现代化的技术栈和组件库，可以作为独立模块使用，也可以被集成到多页应用中。

## 功能特性
- 独立模块：可单独使用或被集成
- 响应式设计：适配不同屏幕尺寸
- 现代化UI：使用 NextUI 组件库
- 状态管理：采用 MobX 进行状态管理

## 项目结构
```

├── App.jsx # 应用入口（单一组件）
└── stores/ # 状态管理

````

## 开发指南
1. 使用 AI 助手：
   - 在左侧输入您的需求
   - AI 将帮助您开发新功能或修改现有功能

2. 自定义开发：
   - 遵循 React 最佳实践
   - 使用 NextUI 组件库构建界面
   - 使用 MobX 进行状态管理

## 技术栈
- React
- NextUI
- MobX
- Tailwind CSS

## 集成说明
- 此单页模块可以被集成到多页应用中
- 不包含路由配置，专注于单一功能
- 可以通过 wpm.import 导入使用

## 使用示例
```jsx
// 在多页应用中使用此模块
const YourModule = await wpm.import('your_module_id');

function ParentComponent() {
  return (
    <div>
      <YourModule />
    </div>
  );
}
````

## 后续计划

- 优化组件性能
- 添加更多功能
- 完善文档说明

## 贡献指南

欢迎提供建议和反馈，一起改进这个模块！
</mo-ai-code>

````

```jsx
<mo-ai-code type="service" name="service_form" title="表单数据服务">
const { api, message } = context;

class FormService {
  // 缓存键前缀
  CACHE_KEY_PREFIX = 'form_index_cache_';
  DETAIL_CACHE_PREFIX = 'form_detail_cache_';

  // 获取缓存键
  getCacheKey(appId) {
    return `${this.CACHE_KEY_PREFIX}${appId}`;
  }

  // 获取详情缓存键
  getDetailCacheKey(appId, formId) {
    return `${this.DETAIL_CACHE_PREFIX}${appId}_${formId}`;
  }

  // 从缓存获取数据
  getFromCache(appId) {
    try {
      const cacheKey = this.getCacheKey(appId);
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        // 检查缓存是否过期 (30分钟)
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          return data;
        }
        // 清除过期缓存
        sessionStorage.removeItem(cacheKey);
      }
    } catch (error) {
      console.error('Failed to get cache:', error);
    }
    return null;
  }

  // 从缓存获取详情数据
  getDetailFromCache(appId, formId) {
    try {
      const cacheKey = this.getDetailCacheKey(appId, formId);
      const cachedData = sessionStorage.getItem(cacheKey);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        // 检查缓存是否过期 (30分钟)
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          return data;
        }
        // 清除过期缓存
        sessionStorage.removeItem(cacheKey);
      }
    } catch (error) {
      console.error('Failed to get detail cache:', error);
    }
    return null;
  }

  // 设置缓存
  setCache(appId, data) {
    try {
      const cacheKey = this.getCacheKey(appId);
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }

  // 设置详情缓存
  setDetailCache(appId, formId, data) {
    try {
      const cacheKey = this.getDetailCacheKey(appId, formId);
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to set detail cache:', error);
    }
  }

  // 清除缓存
  clearCache(appId) {
    try {
      const cacheKey = this.getCacheKey(appId);
      sessionStorage.removeItem(cacheKey);

      // 清除相关的详情缓存
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(this.DETAIL_CACHE_PREFIX + appId)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  // 获取表单索引数据
  async getFormIndex(appId, forceRefresh = false) {
    if(!appId) {
      throw new Error('表单ID不能为空');
    }

    try {
      // 如果不是强制刷新,先尝试从缓存获取
      if (!forceRefresh) {
        const cachedData = this.getFromCache(appId);
        if (cachedData) {
          return cachedData;
        }
      }

      // 获取表单索引数据
      const result = await api.getMetadata([`${appId}_form_index`]);

      if(!result?.data?.[0]?.value) {
        // 如果没有索引数据，返回空的初始结构
        return {
          data: [],
          total: 0
        };
      }

      const indexData = JSON.parse(result.data[0].value);
      const processedData = {
        data: indexData?.slice(0, 20) || [], // 只缓存前20条
        total: indexData?.length || 0
      };

      // 缓存数据
      this.setCache(appId, processedData);

      return processedData;

    } catch(error) {
      console.error('Failed to get form index:', error);
      throw new Error(error.message || '获取表单数据失败');
    }
  }

  // 获取表单详情数据
  async getFormDetail(appId, formId, forceRefresh = false) {
    if(!appId || !formId) {
      throw new Error('表单ID和记录ID不能为空');
    }

    try {
      // 如果不是强制刷新,先尝试从缓存获取
      if (!forceRefresh) {
        const cachedData = this.getDetailFromCache(appId, formId);
        if (cachedData) {
          return cachedData;
        }
      }

      // 构造详情数据的ID
      const detailId = `${appId}_form_${formId}`;

      // 获取详情数据
      const result = await api.getMetadata([detailId]);

      if(!result?.data?.[0]?.value) {
        throw new Error('未找到表单详情数据');
      }

      const detailData = JSON.parse(result.data[0].value);

      // 缓存详情数据
      this.setDetailCache(appId, formId, detailData);

      return detailData;

    } catch(error) {
      console.error('Failed to get form detail:', error);
      throw new Error(error.message || '获取表单详情失败');
    }
  }

  // 批量获取表单详情数据
  async batchGetFormDetails(appId, formIds, forceRefresh = false) {
    if(!appId || !formIds?.length) {
      throw new Error('表单ID和记录ID列表不能为空');
    }

    try {
      // 创建获取详情的Promise数组
      const detailPromises = formIds.map(formId =>
        this.getFormDetail(appId, formId, forceRefresh)
          .catch(error => {
            console.error(`Failed to get detail for form ${formId}:`, error);
            return null;
          })
      );

      // 并发获取所有详情数据
      const details = await Promise.all(detailPromises);

      // 过滤掉获取失败的数据
      return details.filter(detail => detail !== null);

    } catch(error) {
      console.error('Failed to batch get form details:', error);
      throw new Error(error.message || '批量获取表单详情失败');
    }
  }

  // 按状态获取表单数据
  async getFormsByStatus(appId, status) {
    const indexData = await this.getFormIndex(appId);
    if(!indexData) return [];

    return indexData.data.filter(item => item.status === status);
  }

  // 搜索表单数据
  async searchFormData(appId, keyword, filters = {}) {
    const indexData = await this.getFormIndex(appId);
    if(!indexData) return [];

    return indexData.data.filter(item => {
      // 应用过滤条件
      if(filters.status && item.status !== filters.status) return false;
      if(filters.formType && item.formType !== filters.formType) return false;
      if(filters.creatorId && item.creator?.id !== filters.creatorId) return false;

      // 搜索关键词
      if(!keyword) return true;

      return Object.entries(item).some(([key, value]) => {
        if(typeof value === 'object') {
          return Object.values(value).some(v =>
            String(v).toLowerCase().includes(keyword.toLowerCase())
          );
        }
        return String(value).toLowerCase().includes(keyword.toLowerCase());
      });
    });
  }
}

const service = new FormService();
context.wpm.export('service_form', service);
</mo-ai-code>
````

```jsx
<mo-ai-code type="store" name="store_form_index" title="表单索引状态管理">
const { mobx, message } = context;
const { makeAutoObservable, runInAction } = mobx;

const formService = await context.wpm.import('service_form');

class FormIndexStore {
  // 表单索引数据
  indexData = null;

  // 表单详情数据Map
  details = []

  // 加载状态
  loading = false;

  // 错误信息
  error = null;

  // 初始化状态
  initialized = false;

  // 最后更新时间
  lastUpdateTime = null;

  constructor() {
    makeAutoObservable(this);
  }

  // 加载表单索引数据
  async loadFormIndex(appId, forceRefresh = false) {
    if(!appId) {
      this.clear();
      return;
    }

    // 如果已经加载过相同的appId，且数据存在，且不是强制刷新，则不重复加载
    if(this.initialized && this.indexData && !this.error && !forceRefresh) {
      return;
    }

    try {
      this.loading = true;
      this.error = null;

      // 加载索引数据
      const indexData = await formService.getFormIndex(appId, forceRefresh);

      // 并发加载详情数据
      const formIds = indexData.data.map(item => item.formId);


      // 更新状态
      runInAction(async() => {
        this.indexData = indexData;
        this.details = await formService.batchGetFormDetails(appId, formIds, forceRefresh);
        this.initialized = true;
        this.lastUpdateTime = new Date();
      });
    } catch(error) {
      runInAction(() => {
        this.error = error.message;
        this.initialized = false;

        // 显示更友好的错误提示
        if(error.message.includes('未找到表单基础信息')) {
          message.error('未找到该表单，请检查表单ID是否正确');
        } else {
          message.error(error.message || '加载表单索引失败');
        }
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // 刷新数据
  async refreshData(appId) {
    if (!appId) return;

    try {
      await this.loadFormIndex(appId, true);
      message.success('数据已更新');
    } catch (error) {
      message.error('刷新数据失败');
    }
  }

  // 搜索表单数据
  async searchForms(appId, keyword, filters) {
    if(!this.initialized) {
      await this.loadFormIndex(appId);
    }

    try {
      return await formService.searchFormData(appId, keyword, filters);
    } catch(error) {
      message.error('搜索表单数据失败');
      return [];
    }
  }

  // 按状态获取表单
  async getFormsByStatus(appId, status) {
    if(!this.initialized) {
      await this.loadFormIndex(appId);
    }

    try {
      return await formService.getFormsByStatus(appId, status);
    } catch(error) {
      message.error('获取表单数据失败');
      return [];
    }
  }

  // 清除数据
  clear() {
    this.indexData = null;
    this.detailsMap.clear();
    this.loading = false;
    this.error = null;
    this.initialized = false;
    this.lastUpdateTime = null;
  }
}

const store = new FormIndexStore();
context.wpm.export('store_form_index', store);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_settings" title="设置存储">
const { mobx } = context;
const { makeAutoObservable } = mobx;

class SettingsStore {
  // 当前选择的appId
  appId = '';

  // 最近使用的appId列表
  recentAppIds = [];

  constructor() {
    makeAutoObservable(this);
    this.loadSettings();
  }

  setAppId(appId) {
    if(!appId) return;

    this.appId = appId;

    // 更新最近使用列表
    this.recentAppIds = [
      appId,
      ...this.recentAppIds.filter(id => id !== appId)
    ].slice(0, 5);

    this.saveSettings();
  }

  // 从localStorage加载设置
  loadSettings() {
    try {
      const settings = localStorage.getItem('form_ai_settings');
      if(settings) {
        const { appId, recentAppIds } = JSON.parse(settings);
        this.appId = appId || '';
        this.recentAppIds = recentAppIds || [];
      }
    } catch(error) {
      console.error('Failed to load settings:', error);
    }
  }

  // 保存设置到localStorage
  saveSettings() {
    try {
      localStorage.setItem('form_ai_settings', JSON.stringify({
        appId: this.appId,
        recentAppIds: this.recentAppIds
      }));
    } catch(error) {
      console.error('Failed to save settings:', error);
    }
  }

  // 清除设置
  clearSettings() {
    this.appId = '';
    this.recentAppIds = [];
    localStorage.removeItem('form_ai_settings');
  }
}

const store = new SettingsStore();
context.wpm.export('store_settings', store);
</mo-ai-code>
```
