# 应用代码导出

## All Modules

```jsx
<mo-ai-code type="app">
const {
  wpm,
  React,
  ReactRouterDom,
  observer,
  NextUI,
  Icon,
  FramerMotion,
  message,
  api,
  mobx,
  appId,
  cn
} = context;
const { Routes, Route, Navigate, useNavigate } = ReactRouterDom;
const { ScrollShadow, Spacer, Avatar, Button, useDisclosure, Spinner, Divider } = NextUI;

// 导入页面组件
const DeliveryPage = await context.wpm.import('page_delivery');
const ReportPage = await context.wpm.import('page_report');
const AIPage = await context.wpm.import('page_ai');
const DeliverySharePage = await context.wpm.import('page_delivery_share');
const AIStandalonePage = await context.wpm.import('page_ai_standalone');

// 导入组件
const Sidebar = await context.wpm.import('comp_sidebar');
const SidebarDrawer = await context.wpm.import('comp_sidebar_drawer');
const userStore = await context.wpm.import('store_user');

const App = observer(() => {
  const {isOpen, onOpenChange} = useDisclosure();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isMobile = window.innerWidth <= 768;
  const navigate = useNavigate();
  const location = ReactRouterDom.useLocation();

  React.useEffect(() => {
    userStore.loadUserInfo();
  }, []);

  const onToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // 判断是否是独立页面
  const isStandalonePage = location.pathname.startsWith('/share') || location.pathname.startsWith('/ai-standalone');

  if (isStandalonePage) {
    return (
      <NextUI.NextUIProvider navigate={navigate}>
        <Routes>
          <Route path="/share/:id" element={<DeliverySharePage />} />
          <Route path="/ai-standalone" element={<AIStandalonePage />} />
        </Routes>
      </NextUI.NextUIProvider>
    );
  }

  return (
    <NextUI.NextUIProvider navigate={navigate}>
      <div className="flex h-screen w-full p-2">
        {/* 侧边栏 */}
        <SidebarDrawer
          className={cn("min-w-[288px] rounded-lg", {"min-w-[76px]": isCollapsed})}
          hideCloseButton={true}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <div
            className={cn(
              "will-change relative flex h-full w-72 flex-col bg-default-100 p-6 transition-width",
              {
                "w-[83px] items-center px-[6px] py-6": isCollapsed,
              },
            )}
          >
            <div
              className={cn("flex items-center gap-3 pl-2", {
                "justify-center gap-0 pl-0": isCollapsed,
              })}
            >
              <span
                className={cn("w-full text-small font-bold uppercase opacity-100", {
                  "w-0 opacity-0": isCollapsed,
                })}
              >
                酒类配送管理系统
              </span>
              <div className={cn("flex-end flex", {hidden: isCollapsed})}>
                <Icon
                  className="cursor-pointer dark:text-primary-foreground/60 [&>g]:stroke-[1px]"
                  icon="solar:round-alt-arrow-left-line-duotone"
                  width={24}
                  onClick={isMobile ? onOpenChange : onToggle}
                />
              </div>
            </div>
            <Spacer y={6} />
            <div className="flex items-center gap-3 px-3">
              <Avatar
                isBordered
                size="sm"
                src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
              />
              <div className={cn("flex max-w-full flex-col", {hidden: isCollapsed})}>
                {userStore.isLoading ? (
                  <Spinner size="sm" />
                ) : userStore.error ? (
                  <p className="text-small text-danger">加载失败</p>
                ) : (
                  <>
                    <p className="text-small font-medium text-foreground">
                      {userStore.userInfo?.name || '未知用户'}
                    </p>
                    <p className="text-tiny font-medium text-default-400">
                      {userStore.userInfo?.account || '未知账号'}
                    </p>
                  </>
                )}
              </div>
            </div>

            {!isCollapsed && (
              <>
                <Divider className="my-4" />
                <div className="px-3 space-y-1">
                  <p className="text-tiny text-default-500">企业信息</p>
                  <p className="text-small font-medium text-foreground">
                    {userStore.enterpriseInfo?.name || '未知企业'}
                  </p>
                  <p className="text-tiny text-default-400">
                    ID: {userStore.enterpriseInfo?.id || '-'}
                  </p>
                </div>
                <Divider className="my-4" />
              </>
            )}

            <Sidebar
              defaultSelectedKey="delivery"
              iconClassName="group-data-[selected=true]:text-default-50"
              isCompact={isCollapsed}
              items={[
                {
                  key: "delivery",
                  title: "送货单管理",
                  icon: "solar:delivery-bold-duotone",
                  href: "/delivery"
                },
                {
                  key: "report",
                  title: "数据报表",
                  icon: "solar:chart-2-bold-duotone",
                  href: "/report"
                },
                {
                  key: "ai",
                  title: "智能助手",
                  icon: "hugeicons:ai-search",
                  href: "/ai"
                }
              ]}
              itemClasses={{
                base: "px-3 rounded-large data-[selected=true]:!bg-foreground",
                title: "group-data-[selected=true]:text-default-50",
              }}
            />

            <Spacer y={8} />

            <div
              className={cn("mt-auto flex flex-col", {
                "items-center": isCollapsed,
              })}
            >
              {isCollapsed && (
                <Button
                  isIconOnly
                  className="flex h-10 w-10 min-w-5 text-default-600"
                  size="sm"
                  variant="light"
                >
                  <Icon
                    className="cursor-pointer dark:text-primary-foreground/60 [&>g]:stroke-[1px]"
                    height={24}
                    icon="solar:round-alt-arrow-right-line-duotone"
                    width={24}
                    onClick={onToggle}
                  />
                </Button>
              )}
            </div>
          </div>
        </SidebarDrawer>

        {/* 内容区域 */}
        <div className="flex-1 overflow-auto p-6">
          <div className="w-full">
              <Routes>
                <Route path="/" element={<Navigate to="/delivery" replace />} />
                <Route path="/delivery" element={<DeliveryPage />} />
                <Route path="/report" element={<ReportPage />} />
                <Route path="/ai" element={<AIPage />} />
              </Routes>
          </div>
        </div>
      </div>
    </NextUI.NextUIProvider>
  );
});
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
  ai
} = context;

const { Card, CardBody, Button, Avatar, ScrollShadow, Input, Tooltip } = NextUI;
const AIContext = await context.wpm.import('comp_ai_context');

const AIChat = observer(({ standalone = false }) => {
  const [messages, setMessages] = React.useState([]);
  const [inputValue, setInputValue] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const scrollRef = React.useRef(null);
  const inputRef = React.useRef(null);
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
    const initChat = async () => {
      try {
        setIsLoading(true);
        const systemContext = await AIContext.generateContext();
        setMessages([
          {
            role: 'assistant',
            content: '您好，我是您的送货助手。我可以帮您：\n\n1. 查询订单状态\n2. 分析销售数据\n3. 回答送货相关问题\n\n请问有什么可以帮您？'
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
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      let currentResponse = '';
      const systemContext = await AIContext.generateContext();
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

  const quickActions = [
    { label: "查询订单", content: "请帮我查询最近的订单状态" },
    { label: "销售分析", content: "请分析本月的销售情况" },
    { label: "配送问题", content: "如何处理配送延迟的情况" }
  ];

  return (
    <div className="flex h-full flex-col">
      <ScrollShadow ref={scrollRef} className="flex-1 p-4">
        <div className="flex flex-col gap-4">
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

      <div className="flex flex-col gap-2 p-4 border-t border-divider bg-background">
        {/* 快捷操作按钮 */}
        {!inputValue && (
          <div className="flex gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => setInputValue(action.content)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
        
        {/* 输入框区域 */}
        <div className={cn(
          "group relative rounded-xl transition-all duration-200",
          isFocused ? "ring-2 ring-primary" : "hover:ring-2 hover:ring-default-200"
        )}>
          <Input
            ref={inputRef}
            fullWidth
            placeholder="输入您的问题..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
            classNames={{
              input: "pr-20",
              inputWrapper: cn(
                "h-12 bg-default-100 hover:bg-default-200",
                "group-hover:bg-default-100",
                "transition-background duration-200"
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
                    className="h-8 w-8"
                  >
                    <Icon icon="solar:arrow-up-linear" className="h-4 w-4" />
                  </Button>
                ) : (
                  <Tooltip content="按 Enter 发送">
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      className="text-default-400"
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
      </div>
    </div>
  );
});

context.wpm.export('comp_ai_chat', AIChat);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_ai_context" title="AI上下文生成组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const deliveryStore = await context.wpm.import('store_delivery');

const generateContext = async () => {
  try {
    // 基础统计信息
    const stats = deliveryStore.getStatistics();
    const customerStats = deliveryStore.getCustomerStatistics();
    const productStats = await deliveryStore.getProductStatistics();

    // 获取最近的订单列表(限制20条避免上下文过大)
    const recentOrders = deliveryStore.deliveryOrders
      .slice(0, 20)
      .map(order => ({
        id: order.id,
        customerName: order.customerName,
        contactPerson: order.contactPerson,
        contactPhone: order.contactPhone,
        deliveryTime: order.deliveryTime,
        status: deliveryStore.constructor.StatusText[order.status],
        totalAmount: order.totalAmount
      }));

    return `系统当前状态：

1. 订单统计
- 总订单数：${stats.total}
- 待处理订单：${stats.pending}
- 配送中订单：${stats.delivering}
- 已完成订单：${stats.completed}

2. 热门客户TOP5：
${customerStats.slice(0, 5).map((customer, index) =>
  `${index + 1}. ${customer.name}
   - 订单数：${customer.orderCount}单
   - 总金额：¥${customer.totalAmount}`
).join('\n')}

3. 热门商品TOP5：
${Array.isArray(productStats) ? productStats.slice(0, 5).map((product, index) =>
  `${index + 1}. ${product.name}
   - 销量：${product.quantity}
   - 销售额：¥${product.amount}`
).join('\n') : '暂无数据'}

4. 最近订单列表：
${recentOrders.map((order, index) =>
  `${index + 1}. 订单号：${order.id}
   - 客户：${order.customerName}
   - 联系人：${order.contactPerson}
   - 电话：${order.contactPhone}
   - 送货日期：${order.deliveryTime}
   - 状态：${order.status}
   - 金额：¥${order.totalAmount}`
).join('\n')}

订单状态说明：
- 待处理：新创建的订单
- 配送中：已开始配送
- 客户已确认：客户已签收确认
- 业务员已确认：业务员已确认完成
- 已完成：订单已完成
- 已取消：订单已取消

你可以：
1. 查询特定订单的状态和详情
2. 分析销售数据和趋势
3. 回答关于客户和商品的问题
4. 提供配送相关建议

请基于以上信息来回答问题。如果遇到不确定的情况，请说明无法确定。`;
  } catch (error) {
    console.error('Failed to generate AI context:', error);
    return `系统当前状态：
- 数据加载失败
- 只能提供基础的问答服务

请谅解，如需具体数据请稍后重试。`;
  }
};

const getOrderContext = async (orderId) => {
  try {
    const order = await deliveryStore.getOrderById(orderId);
    if (!order) return '未找到该订单';

    return `订单详细信息：

1. 基本信息
- 订单号：${order.id}
- 客户名称：${order.customerName}
- 联系人：${order.contactPerson}
- 联系电话：${order.contactPhone}
- 送货地址：${order.address}
- 送货日期：${order.deliveryTime}
- 订单状态：${deliveryStore.constructor.StatusText[order.status]}
- 创建时间：${new Date(order.createdAt).toLocaleString()}

2. 商品明细：
${order.items.map((item, index) =>
  `${index + 1}. ${item.name}
   - 数量：${item.quantity}件
   - 单价：¥${item.price}
   - 小计：¥${item.amount}`
).join('\n')}

3. 订单总额：¥${order.items.reduce((sum, item) => sum + item.amount, 0)}

4. 确认信息：
${order.confirmations?.customer ? 
  `客户确认：
  - 确认人：${order.confirmations.customer.name}
  - 电话：${order.confirmations.customer.phone}
  - 时间：${new Date(order.confirmations.customer.time).toLocaleString()}
  ${order.confirmations.customer.note ? `- 备注：${order.confirmations.customer.note}` : ''}` : 
  '客户未确认'}

${order.confirmations?.staff ? 
  `业务员确认：
  - 确认人：${order.confirmations.staff.name}
  - 电话：${order.confirmations.staff.phone}
  - 时间：${new Date(order.confirmations.staff.time).toLocaleString()}
  ${order.confirmations.staff.note ? `- 备注：${order.confirmations.staff.note}` : ''}` : 
  '业务员未确认'}`;
  } catch (error) {
    console.error('Failed to get order context:', error);
    return '获取订单信息失败，请稍后重试';
  }
};

context.wpm.export('comp_ai_context', {
  generateContext,
  getOrderContext
});
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_basic_info" title="送货单基本信息">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Input, Textarea } = NextUI;

const DeliveryBasicInfo = observer(({
  readOnly = false,
  defaultValues = {}
}) => {
  return (
    <div>
      <h4 className="text-medium font-medium mb-4 flex items-center gap-2">
        <Icon className="text-primary" icon="solar:user-id-bold" />
        客户信息
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          isRequired
          isReadOnly={readOnly}
          label="客户名称"
          name="customerName"
          placeholder="请输入客户名称"
          defaultValue={defaultValues?.customerName}
          classNames={{
            label: "text-default-600",
            input: "text-default-800"
          }}
          startContent={
            <Icon 
              className="text-default-400 pointer-events-none flex-shrink-0"
              icon="solar:user-bold"
              width={20}
            />
          }
        />
        <Input
          isRequired
          isReadOnly={readOnly}
          label="联系人"
          name="contactPerson"
          placeholder="请输入联系人"
          defaultValue={defaultValues?.contactPerson}
          classNames={{
            label: "text-default-600",
            input: "text-default-800"
          }}
          startContent={
            <Icon 
              className="text-default-400 pointer-events-none flex-shrink-0"
              icon="solar:user-id-bold"
              width={20}
            />
          }
        />
        <Input
          isRequired
          isReadOnly={readOnly}
          label="联系电话"
          name="contactPhone"
          placeholder="请输入联系电话"
          defaultValue={defaultValues?.contactPhone}
          classNames={{
            label: "text-default-600",
            input: "text-default-800"
          }}
          startContent={
            <Icon 
              className="text-default-400 pointer-events-none flex-shrink-0"
              icon="solar:phone-bold"
              width={20}
            />
          }
        />
        <Input
          isRequired
          isReadOnly={readOnly}
          type="date"
          label="送货日期"
          name="deliveryTime"
          placeholder="请选择送货日期"
          defaultValue={defaultValues?.deliveryTime || new Date().toISOString().split('T')[0]}
          classNames={{
            label: "text-default-600",
            input: "text-default-800"
          }}
          startContent={
            <Icon 
              className="text-default-400 pointer-events-none flex-shrink-0"
              icon="solar:calendar-bold"
              width={20}
            />
          }
        />
        <Textarea
          isRequired
          isReadOnly={readOnly}
          className="md:col-span-2"
          label="送货地址"
          name="address"
          placeholder="请输入详细地址"
          defaultValue={defaultValues?.address}
          classNames={{
            label: "text-default-600",
            input: "text-default-800"
          }}
          startContent={
            <Icon 
              className="text-default-400 pointer-events-none flex-shrink-0 mt-1"
              icon="solar:map-point-bold"
              width={20}
            />
          }
        />
      </div>
    </div>
  );
});

context.wpm.export('comp_delivery_basic_info', DeliveryBasicInfo);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_detail" title="送货单详情组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  esm
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner, Card, CardBody, Tabs, Tab } = NextUI;
const deliveryStore = await context.wpm.import('store_delivery');
const DeliveryForm = await context.wpm.import('comp_delivery_form');
const DeliveryPrint = await context.wpm.import('comp_delivery_print');
const DeliveryDetailProgress = await context.wpm.import('comp_delivery_detail_progress');
const DeliveryDetailInfo = await context.wpm.import('comp_delivery_detail_info');
const DeliveryDetailItems = await context.wpm.import('comp_delivery_detail_items');
const DeliveryDetailConfirmations = await context.wpm.import('comp_delivery_detail_confirmations');
const DeliveryHistory = await context.wpm.import('comp_delivery_history');

// 导入 ReactToPrint
const { useReactToPrint } = await context.ReactToPrint

const DeliveryDetail = observer(({
  isOpen,
  onOpenChange,
  order
}) => {
  const [showPreview, setShowPreview] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [selectedTab, setSelectedTab] = React.useState("details");
  const contentRef = React.useRef(null);
  
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `送货单_${order?.id || ''}`,
    onBeforePrint: () => {
      return new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    },
    onPrintError: (error) => {
      console.error('Print failed:', error);
      message.error('打印失败，请重试');
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
        }
        html, body {
          height: 100vh;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden;
        }
      }
    `,
  });

  const handleStartDelivering = async () => {
    setLoading(true);
    try {
      await deliveryStore.startDelivering(order.id);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "bg-background",
          header: "border-b border-divider",
          body: "py-6",
          footer: "border-t border-divider"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">送货单详情</h3>
                  <NextUI.Chip
                    className="capitalize"
                    color={deliveryStore.constructor.StatusColor[order.status]}
                    size="sm"
                    variant="flat"
                    startContent={
                      <Icon 
                        className="text-current" 
                        icon={deliveryStore.constructor.StatusIcon[order.status]}
                        width={16}
                      />
                    }
                  >
                    {deliveryStore.constructor.StatusText[order.status]}
                  </NextUI.Chip>
                </div>
                <p className="text-small text-default-500">
                  创建时间: {new Date(order.createdAt).toLocaleString()}
                </p>
              </ModalHeader>
              <ModalBody>
                <Tabs 
                  selectedKey={selectedTab}
                  onSelectionChange={setSelectedTab}
                  classNames={{
                    tabList: "gap-4",
                    cursor: "w-full",
                    tab: "max-w-fit px-2 h-8",
                    tabContent: "group-data-[selected=true]:text-primary"
                  }}
                >
                  <Tab
                    key="details"
                    title={
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:document-text-bold" />
                        <span>基本信息</span>
                      </div>
                    }
                  >
                    <div className="space-y-6">
                      {order.status === deliveryStore.constructor.OrderStatus.PENDING && (
                        <Card>
                          <CardBody>
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-medium font-medium">待处理订单</h4>
                                <p className="text-small text-default-500">
                                  点击开始配送按钮开始处理订单
                                </p>
                              </div>
                              <Button
                                color="primary"
                                startContent={<Icon icon="solar:delivery-bold" />}
                                isLoading={loading}
                                onPress={handleStartDelivering}
                              >
                                开始配送
                              </Button>
                            </div>
                          </CardBody>
                        </Card>
                      )}
                      <DeliveryDetailProgress order={order} />
                      <DeliveryDetailInfo order={order} />
                      <DeliveryDetailItems order={order} />
                      <DeliveryDetailConfirmations order={order} />
                    </div>
                  </Tab>
                  <Tab
                    key="history"
                    title={
                      <div className="flex items-center gap-2">
                        <Icon icon="solar:history-bold" />
                        <span>修改记录</span>
                      </div>
                    }
                  >
                    <DeliveryHistory orderId={`${context.appId}_order_${order.id}`} />
                  </Tab>
                </Tabs>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="primary" 
                  variant="flat"
                  onPress={() => setShowPreview(true)}
                  startContent={<Icon icon="solar:eye-bold" />}
                >
                  打印预览
                </Button>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={onClose}
                  startContent={<Icon icon="solar:close-circle-bold" />}
                >
                  关闭
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showPreview}
        onOpenChange={setShowPreview}
        size="4xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <h3 className="text-xl font-semibold">打印预览</h3>
              </ModalHeader>
              <ModalBody>
                <div className="border rounded-lg">
                  <div ref={contentRef}>
                    <DeliveryPrint order={order} />
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="primary" 
                  onPress={handlePrint}
                  startContent={<Icon icon="solar:printer-bold" />}
                >
                  打印
                </Button>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={onClose}
                  startContent={<Icon icon="solar:close-circle-bold" />}
                >
                  关闭
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
});

context.wpm.export('comp_delivery_detail', DeliveryDetail);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_detail_confirm_modal" title="送货单确认表单模态框组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  api
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } = NextUI;

const DeliveryDetailConfirmModal = observer(({
  isOpen,
  onOpenChange,
  type,
  onConfirm
}) => {
  const [loading, setLoading] = React.useState(false);
  const [location, setLocation] = React.useState(null);

  React.useEffect(() => {
    if (isOpen) {
      // 获取当前位置
      api.location.getCurrentPosition().then(async position => {
        const address = await api.location.getAddressFromLocation(
          position.coords.latitude,
          position.coords.longitude
        );
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address
        });
      }).catch(() => {
        setLocation(null);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (!formData.get('name')?.trim()) {
      message.warning('请输入确认人姓名');
      return;
    }
    
    if (!formData.get('phone')?.trim()) {
      message.warning('请输入联系电话');
      return;
    }

    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      note: formData.get('note'),
      location
    };

    setLoading(true);
    try {
      await onConfirm(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
    >
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold">
                {type === 'customer' ? '客户确认' : '业务员确认'}
              </h3>
              <p className="text-small text-default-500">
                请填写确认信息，带 * 为必填项
              </p>
            </ModalHeader>
            <ModalBody>
              <Input
                isRequired
                label="确认人姓名"
                name="name"
                placeholder="请输入姓名"
                startContent={
                  <Icon 
                    className="text-default-400 pointer-events-none flex-shrink-0"
                    icon="solar:user-bold"
                    width={20}
                  />
                }
              />
              <Input
                isRequired
                label="联系电话"
                name="phone"
                placeholder="请输入电话"
                startContent={
                  <Icon 
                    className="text-default-400 pointer-events-none flex-shrink-0"
                    icon="solar:phone-bold"
                    width={20}
                  />
                }
              />
              <Textarea
                label="备注"
                name="note"
                placeholder="可选填写备注信息"
                startContent={
                  <Icon 
                    className="text-default-400 pointer-events-none flex-shrink-0 mt-1"
                    icon="solar:notes-bold"
                    width={20}
                  />
                }
              />
              {location && (
                <div className="rounded-lg bg-default-100 p-3">
                  <div className="flex items-center gap-2 text-small">
                    <Icon 
                      className="text-success"
                      icon="solar:map-point-bold"
                      width={20}
                    />
                    <span>当前位置：{location.address}</span>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                color="danger" 
                variant="light" 
                onPress={onClose}
                startContent={<Icon icon="solar:close-circle-bold" />}
              >
                取消
              </Button>
              <Button 
                color="primary" 
                type="submit" 
                isLoading={loading}
                startContent={!loading && <Icon icon="solar:disk-bold" />}
              >
                确认
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
});

context.wpm.export('comp_delivery_detail_confirm_modal', DeliveryDetailConfirmModal);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_detail_confirmations" title="送货单确认记录组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Card, CardBody } = NextUI;

const DeliveryDetailConfirmations = observer(({
  order
}) => {
  if (!order.confirmations?.customer && !order.confirmations?.staff) {
    return null;
  }

  return (
    <Card>
      <CardBody>
        <h4 className="mb-4 text-medium font-medium flex items-center gap-2">
          <Icon className="text-primary" icon="solar:notes-bold" />
          确认记录
        </h4>
        <div className="space-y-4">
          {order.confirmations?.customer && (
            <div className="rounded-lg bg-default-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  className="text-success text-xl"
                  icon="solar:user-speak-bold"
                />
                <h5 className="text-small font-medium">客户确认信息</h5>
              </div>
              <div className="space-y-1">
                <p className="text-small">
                  <span className="text-default-500">确认人：</span>
                  {order.confirmations.customer.name}
                </p>
                <p className="text-small">
                  <span className="text-default-500">联系电话：</span>
                  {order.confirmations.customer.phone}
                </p>
                {order.confirmations.customer.note && (
                  <p className="text-small">
                    <span className="text-default-500">备注：</span>
                    {order.confirmations.customer.note}
                  </p>
                )}
                <p className="text-small">
                  <span className="text-default-500">确认时间：</span>
                  {new Date(order.confirmations.customer.time).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {order.confirmations?.staff && (
            <div className="rounded-lg bg-default-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  className="text-secondary text-xl"
                  icon="solar:shield-minimalistic-bold"
                />
                <h5 className="text-small font-medium">业务员确认信息</h5>
              </div>
              <div className="space-y-1">
                <p className="text-small">
                  <span className="text-default-500">确认人：</span>
                  {order.confirmations.staff.name}
                </p>
                <p className="text-small">
                  <span className="text-default-500">联系电话：</span>
                  {order.confirmations.staff.phone}
                </p>
                {order.confirmations.staff.note && (
                  <p className="text-small">
                    <span className="text-default-500">备注：</span>
                    {order.confirmations.staff.note}
                  </p>
                )}
                <p className="text-small">
                  <span className="text-default-500">确认时间：</span>
                  {new Date(order.confirmations.staff.time).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_delivery_detail_confirmations', DeliveryDetailConfirmations);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_detail_info" title="送货单基本信息组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Card, CardBody } = NextUI;

const DeliveryDetailInfo = observer(({
  order
}) => {
  return (
    <Card>
      <CardBody>
        <h4 className="mb-4 text-medium font-medium flex items-center gap-2">
          <Icon className="text-primary" icon="solar:user-id-bold" />
          客户信息
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-small text-default-500">客户名称</p>
            <p className="font-medium">{order.customerName}</p>
          </div>
          <div>
            <p className="text-small text-default-500">联系人</p>
            <p className="font-medium">{order.contactPerson}</p>
          </div>
          <div>
            <p className="text-small text-default-500">联系电话</p>
            <p className="font-medium">{order.contactPhone}</p>
          </div>
          <div>
            <p className="text-small text-default-500">送货日期</p>
            <p className="font-medium">{order.deliveryTime}</p>
          </div>
          <div className="col-span-2">
            <p className="text-small text-default-500">送货地址</p>
            <p className="font-medium">{order.address}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_delivery_detail_info', DeliveryDetailInfo);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_detail_items" title="送货单商品明细组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody } = NextUI;

const DeliveryDetailItems = observer(({
  order
}) => {
  const totalAmount = order.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardBody>
        <h4 className="mb-4 text-medium font-medium flex items-center gap-2">
          <Icon className="text-primary" icon="solar:box-bold" />
          商品明细
        </h4>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "group flex items-center justify-between rounded-xl border p-4",
                "transition-colors duration-200",
                "hover:border-primary hover:bg-primary/5"
              )}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h6 className="font-medium text-default-800">{item.name}</h6>
                    <div className="flex items-center gap-3 text-small text-default-500">
                      <span>单价: ¥{item.price}</span>
                      <span>数量: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">¥{item.amount}</p>
                    <p className="text-tiny text-default-400">小计</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end rounded-xl bg-primary/10 p-4">
          <div className="text-right">
            <p className="text-small text-default-600">
              共 {order.items.length} 件商品
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-default-600">总计:</span>
              <span className="text-2xl font-semibold text-primary">
                ¥{totalAmount}
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_delivery_detail_items', DeliveryDetailItems);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_detail_progress" title="送货单进度组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody, Progress } = NextUI;
const deliveryStore = await context.wpm.import('store_delivery');

const DeliveryDetailProgress = observer(({
  order
}) => {
  const getProgressValue = () => {
    switch (order.status) {
      case deliveryStore.constructor.OrderStatus.PENDING:
        return 0;
      case deliveryStore.constructor.OrderStatus.DELIVERING:
        return 25;
      case deliveryStore.constructor.OrderStatus.CUSTOMER_CONFIRMED:
      case deliveryStore.constructor.OrderStatus.STAFF_CONFIRMED:
        return 75;
      case deliveryStore.constructor.OrderStatus.COMPLETED:
        return 100;
      default:
        return 0;
    }
  };

  const getProgressSteps = () => {
    return [
      {
        status: 'pending',
        title: '待处理',
        icon: 'solar:clock-circle-bold',
        completed: order.status !== deliveryStore.constructor.OrderStatus.PENDING
      },
      {
        status: 'delivering',
        title: '配送中',
        icon: 'solar:delivery-bold',
        completed: order.status !== deliveryStore.constructor.OrderStatus.PENDING && 
                  order.status !== deliveryStore.constructor.OrderStatus.DELIVERING
      },
      {
        status: 'confirming',
        title: '确认中',
        icon: 'solar:user-check-bold',
        completed: order.status === deliveryStore.constructor.OrderStatus.COMPLETED
      },
      {
        status: 'completed',
        title: '已完成',
        icon: 'solar:check-circle-bold',
        completed: order.status === deliveryStore.constructor.OrderStatus.COMPLETED
      }
    ];
  };

  const steps = getProgressSteps();

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-medium font-medium">处理进度</h4>
          <span className="text-small text-default-400">
            {deliveryStore.constructor.StatusText[order.status]}
          </span>
        </div>
        <Progress
          aria-label="处理进度"
          value={getProgressValue()}
          className="mb-4"
        />
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step.status}
              className={cn(
                "flex flex-col items-center gap-1",
                {
                  "text-success": step.completed,
                  "text-default-400": !step.completed
                }
              )}
            >
              <Icon
                className={cn(
                  "text-xl",
                  {
                    "text-success": step.completed,
                    "text-default-400": !step.completed
                  }
                )}
                icon={step.icon}
              />
              <span className="text-tiny">{step.title}</span>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_delivery_detail_progress', DeliveryDetailProgress);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_form" title="送货单表单">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  message,
  cn
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } = NextUI;
const deliveryStore = await context.wpm.import('store_delivery');
const DeliveryBasicInfo = await context.wpm.import('comp_delivery_basic_info');
const DeliveryItemList = await context.wpm.import('comp_delivery_item_list');

const DeliveryForm = observer(({
  isOpen,
  onOpenChange,
  onSuccess,
  readOnly = false
}) => {
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [formKey, setFormKey] = React.useState(0);
  const [initializing, setInitializing] = React.useState(true);
  const formRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      setInitializing(true);
      try {
        if (deliveryStore.currentOrder) {
          setItems(JSON.parse(JSON.stringify(deliveryStore.currentOrder.items || [])));
        } else {
          setItems([]);
        }
        setFormKey(prev => prev + 1);
      } finally {
        setInitializing(false);
      }
    }
  }, [isOpen, deliveryStore.currentOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (items.length === 0) {
      message.warning('请至少添加一个商品');
      return;
    }

    const data = {
      customerName: formData.get('customerName'),
      contactPerson: formData.get('contactPerson'),
      contactPhone: formData.get('contactPhone'),
      deliveryTime: formData.get('deliveryTime'),
      address: formData.get('address'),
      items,
      status: 'pending',
      ...(deliveryStore.currentOrder?.id ? { 
        id: deliveryStore.currentOrder.id,
        confirmations: deliveryStore.currentOrder.confirmations,
        createdAt: deliveryStore.currentOrder.createdAt
      } : {})
    };

    setLoading(true);
    try {
      const success = await deliveryStore.saveDeliveryOrder(data);
      if (success) {
        onOpenChange(false);
        if (onSuccess) {
          const updatedOrder = await deliveryStore.getOrderById(data.id);
          onSuccess(updatedOrder);
        }
        deliveryStore.clearCurrentOrder();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      size="3xl"
      scrollBehavior="outside"
      classNames={{
        base: "bg-background",
        header: "border-b border-divider",
        body: "py-6",
        footer: "border-t border-divider"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {initializing ? (
              <div className="flex h-[200px] items-center justify-center">
                <Spinner label="加载中..." />
              </div>
            ) : (
              <form key={formKey} onSubmit={handleSubmit} ref={formRef}>
                <ModalHeader className="flex flex-col gap-1">
                  <h3 className="text-xl font-semibold">
                    {deliveryStore.currentOrder ? '编辑送货单' : '新建送货单'}
                  </h3>
                  <p className="text-small text-default-500">
                    请填写送货单信息，带 * 为必填项
                  </p>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-8">
                    <DeliveryBasicInfo 
                      readOnly={readOnly}
                      defaultValues={deliveryStore.currentOrder}
                    />
                    <NextUI.Divider />
                    <DeliveryItemList
                      items={items}
                      readOnly={readOnly}
                      onItemsChange={setItems}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="danger" 
                    variant="light" 
                    onPress={onClose}
                    startContent={<Icon icon="solar:close-circle-bold" />}
                  >
                    取消
                  </Button>
                  {!readOnly && (
                    <Button 
                      color="primary" 
                      type="submit" 
                      isLoading={loading}
                      startContent={!loading && <Icon icon="solar:disk-bold" />}
                    >
                      保存
                    </Button>
                  )}
                </ModalFooter>
              </form>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

context.wpm.export('comp_delivery_form', DeliveryForm);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_history" title="送货单历史记录组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, useDisclosure, Spinner } = NextUI;
const DeliveryHistoryDiff = await context.wpm.import('comp_delivery_history_diff');

const DeliveryHistory = observer(({
  orderId
}) => {
  const [history, setHistory] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [selectedVersions, setSelectedVersions] = React.useState({
    current: null,
    previous: null
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const parseValue = (value) => {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error('Failed to parse history value:', error);
      return null;
    }
  };

  React.useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await context.api.queryMetadataHistory({ names: [orderId] });
        
        if (result.data) {
          const parsedHistory = result.data.map(item => ({
            updatedAt: item.updatedAt,
            versionCode: item.versionCode,
            modifiedBy: parseValue(item.value)?.operator?.name || "Unknown User",
            value: parseValue(item.value)
          })).filter(item => item.value !== null);

          setHistory(parsedHistory);
        }
      } catch (error) {
        console.error('Failed to load history:', error);
        setError('加载历史记录失败');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [orderId]);

  const handleCompare = (currentVersion, previousVersion) => {
    setSelectedVersions({
      current: currentVersion.value,
      previous: previousVersion.value
    });
    onOpen();
  };

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Spinner label="加载中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[200px] items-center justify-center flex-col gap-2">
        <Icon className="text-danger" icon="solar:shield-warning-bold" width={32} />
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-medium font-medium flex items-center gap-2">
            <Icon className="text-primary" icon="solar:history-bold" />
            修改记录
          </h4>
        </div>

        {history.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center flex-col gap-2">
            <Icon className="text-default-400" icon="solar:notebook-minimalistic-bold" width={48} />
            <p className="text-default-400">暂无修改记录</p>
          </div>
        ) : (
          <Table
            removeWrapper
            aria-label="修改记录"
            classNames={{
              wrapper: "max-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn>版本</TableColumn>
              <TableColumn>修改时间</TableColumn>
              <TableColumn>修改人</TableColumn>
              <TableColumn>操作</TableColumn>
            </TableHeader>
            <TableBody>
              {history.map((version, index) => (
                <TableRow key={version.versionCode}>
                  <TableCell>v{version.versionCode}</TableCell>
                  <TableCell>{new Date(version.updatedAt).toLocaleString()}</TableCell>
                  <TableCell>{version.modifiedBy}</TableCell>
                  <TableCell>
                    {index < history.length - 1 && (
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        startContent={<Icon icon="solar:document-search-bold" />}
                        onPress={() => handleCompare(version, history[index + 1])}
                      >
                        查看修改
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <DeliveryHistoryDiff
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          currentVersion={selectedVersions.current}
          previousVersion={selectedVersions.previous}
        />
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_delivery_history', DeliveryHistory);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_history_diff" title="送货单版本差异对比组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } = NextUI;
const utilsDeliveryDiff = await context.wpm.import('utils_delivery_diff');

const DeliveryHistoryDiff = observer(({
  isOpen,
  onOpenChange,
  currentVersion,
  previousVersion
}) => {
  const [comparing, setComparing] = React.useState(false);
  const [changes, setChanges] = React.useState([]);

  React.useEffect(() => {
    const compare = async () => {
      if (!isOpen || !currentVersion || !previousVersion) return;
      
      setComparing(true);
      try {
        const diff = utilsDeliveryDiff.compareObjects(
          previousVersion,
          currentVersion
        );
        const formattedChanges = utilsDeliveryDiff.formatDiff(diff);
        setChanges(formattedChanges);
      } catch (error) {
        console.error('Compare version failed:', error);
      } finally {
        setComparing(false);
      }
    };
    compare();
  }, [isOpen, currentVersion, previousVersion]);

  const renderChangeIcon = (type) => {
    switch (type) {
      case 'added':
        return <Icon className="text-success" icon="solar:add-circle-bold" />;
      case 'deleted':
        return <Icon className="text-danger" icon="solar:trash-bin-trash-bold" />;
      case 'updated':
        return <Icon className="text-warning" icon="solar:pen-bold" />;
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold">修改详情</h3>
              <p className="text-small text-default-500">
                和上一次修改相比
              </p>
            </ModalHeader>
            <ModalBody>
              {comparing ? (
                <div className="flex h-[200px] items-center justify-center">
                  <Spinner label="对比中..." />
                </div>
              ) : changes.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center flex-col gap-2">
                  <Icon className="text-default-400" icon="solar:documents-minimalistic-bold" width={48} />
                  <p className="text-default-400">没有发现差异</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {changes.map((change, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-3",
                        "transition-colors duration-200",
                        {
                          "border-success/20 bg-success/10": change.type === 'added',
                          "border-danger/20 bg-danger/10": change.type === 'deleted',
                          "border-warning/20 bg-warning/10": change.type === 'updated'
                        }
                      )}
                    >
                      {renderChangeIcon(change.type)}
                      <div>
                        <p className="font-medium">{change.field}</p>
                        <p className="text-small text-default-500">{change.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={onClose}
                startContent={<Icon icon="solar:close-circle-bold" />}
              >
                关闭
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

context.wpm.export('comp_delivery_history_diff', DeliveryHistoryDiff);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_item_form" title="商品明细表单组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  message
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, useDisclosure } = NextUI;

const DeliveryItemForm = observer(({
  item,
  onSubmit,
  readOnly = false
}) => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    quantity: '',
    price: ''
  });

  React.useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        quantity: item.quantity.toString(),
        price: item.price.toString()
      });
    } else {
      setFormData({
        name: '',
        quantity: '',
        price: ''
      });
    }
  }, [item, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation()
    const quantity = parseInt(formData.quantity);
    const price = parseFloat(formData.price);
    
    if (isNaN(quantity) || quantity <= 0) {
      message.warning('请输入有效的数量');
      return;
    }
    
    if (isNaN(price) || price <= 0) {
      message.warning('请输入有效的单价');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        name: formData.name,
        quantity,
        price,
        amount: quantity * price
      };
      
      onSubmit(itemData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const amount = parseFloat(formData.quantity || 0) * parseFloat(formData.price || 0);

  return (
    <>
      <Button
        size="sm"
        color="primary"
        variant={item ? "light" : "solid"}
        isIconOnly={!!item}
        onPress={onOpen}
        isDisabled={readOnly}
        className={item ? "w-9 h-9" : "h-9"}
        startContent={item ? null : <Icon icon="solar:add-circle-bold" className="text-current" />}
      >
        {item ? (
          <Icon icon="solar:pen-bold" className="text-current" />
        ) : (
          "添加商品"
        )}
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        classNames={{
          base: "bg-background",
          header: "border-b border-divider",
          body: "py-6",
          footer: "border-t border-divider"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold">
                  {item ? '编辑商品' : '添加商品'}
                </h3>
                <p className="text-small text-default-500">
                  请填写商品信息，所有字段均为必填
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  <Input
                    isRequired
                    isReadOnly={readOnly}
                    label="商品名称"
                    placeholder="请输入商品名称"
                    value={formData.name}
                    onChange={handleChange('name')}
                    classNames={{
                      label: "text-default-600",
                      input: "text-default-800"
                    }}
                    startContent={
                      <Icon 
                        className="text-default-400 pointer-events-none flex-shrink-0"
                        icon="solar:wine-glass-bold"
                        width={20}
                      />
                    }
                  />
                  <Input
                    isRequired
                    isReadOnly={readOnly}
                    type="number"
                    label="数量"
                    placeholder="请输入数量"
                    value={formData.quantity}
                    onChange={handleChange('quantity')}
                    min={1}
                    classNames={{
                      label: "text-default-600",
                      input: "text-default-800"
                    }}
                    startContent={
                      <Icon 
                        className="text-default-400 pointer-events-none flex-shrink-0"
                        icon="solar:box-minimalistic-bold"
                        width={20}
                      />
                    }
                  />
                  <Input
                    isRequired
                    isReadOnly={readOnly}
                    type="number"
                    label="单价"
                    placeholder="请输入单价"
                    value={formData.price}
                    onChange={handleChange('price')}
                    min={0}
                    step={0.01}
                    classNames={{
                      label: "text-default-600",
                      input: "text-default-800"
                    }}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400">¥</span>
                      </div>
                    }
                  />

                  {(formData.quantity && formData.price) && (
                    <div className="rounded-xl bg-primary/10 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-default-600">小计</span>
                        <span className="text-xl font-semibold text-primary">
                          ¥{amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={onClose}
                  startContent={<Icon icon="solar:close-circle-bold" />}
                >
                  取消
                </Button>
                {!readOnly && (
                  <Button 
                    color="primary" 
                    type="submit" 
                    isLoading={loading}
                    startContent={!loading && <Icon icon="solar:disk-bold" />}
                  >
                    确定
                  </Button>
                )}
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
});

context.wpm.export('comp_delivery_item_form', DeliveryItemForm);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_item_list" title="送货单商品列表">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const DeliveryItemForm = await context.wpm.import('comp_delivery_item_form');

const DeliveryItemList = observer(({
  items = [],
  readOnly = false,
  onItemsChange
}) => {
  const addItem = (item) => {
    onItemsChange([...items, item]);
  };

  const removeItem = (index) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, item) => {
    onItemsChange(items.map((i, idx) => idx === index ? item : i));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-medium font-medium flex items-center gap-2">
          <Icon className="text-primary" icon="solar:box-bold" />
          商品明细
        </h4>
        {!readOnly && (
          <DeliveryItemForm onSubmit={addItem} />
        )}
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "group flex items-center justify-between rounded-xl border p-4",
              "transition-colors duration-200",
              "hover:border-primary hover:bg-primary/5"
            )}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h6 className="font-medium text-default-800">{item.name}</h6>
                  <div className="flex items-center gap-3 text-small text-default-500">
                    <span>单价: ¥{item.price}</span>
                    <span>数量: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">¥{item.amount}</p>
                  <p className="text-tiny text-default-400">小计</p>
                </div>
              </div>
            </div>
            {!readOnly && (
              <div className="ml-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <DeliveryItemForm
                  item={item}
                  onSubmit={(updatedItem) => updateItem(index, updatedItem)}
                />
                <NextUI.Button
                  isIconOnly
                  color="danger"
                  size="sm"
                  variant="light"
                  onPress={() => removeItem(index)}
                >
                  <Icon icon="solar:trash-bin-trash-bold" />
                </NextUI.Button>
              </div>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8">
            <Icon 
              className="text-default-300 mb-2" 
              icon="solar:box-minimalistic-bold"
              width={48}
            />
            <p className="text-default-500">请添加商品</p>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-6 flex justify-end rounded-xl bg-primary/10 p-4">
          <div className="text-right">
            <p className="text-small text-default-600">
              共 {items.length} 件商品
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-default-600">总计:</span>
              <span className="text-2xl font-semibold text-primary">
                ¥{totalAmount}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

context.wpm.export('comp_delivery_item_list', DeliveryItemList);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_print" title="送货单打印组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const DeliveryPrint = observer(({ order }) => {
  if (!order) return null;

  const totalAmount = order.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="print-content p-8 bg-white">
      <style type='text/css' media='print'>{`
  @page {
    size: A4;
    margin: 20mm;
  }
  @media print {
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-content {
      padding: 20mm !important;
      width: 210mm !important;
      margin: 0 auto !important;
    }
  }
`}</style>

      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold mb-2">送货单</h1>
        <div className="flex justify-between text-sm text-gray-500">
          <span>单号: {order.id}</span>
          <span>创建时间: {new Date(order.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="no-break">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-black">
            基本信息
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <div>
                <p className="text-sm font-bold">客户名称</p>
                <p className="font-medium border-b border-dotted pb-1">{order.customerName}</p>
              </div>
              <div>
                <p className="text-sm font-bold">联系人</p>
                <p className="font-medium border-b border-dotted pb-1">{order.contactPerson}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-bold">联系电话</p>
                <p className="font-medium border-b border-dotted pb-1">{order.contactPhone}</p>
              </div>
              <div>
                <p className="text-sm font-bold">送货日期</p>
                <p className="font-medium border-b border-dotted pb-1">{order.deliveryTime}</p>
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-bold">送货地址</p>
              <p className="font-medium border-b border-dotted pb-1">{order.address}</p>
            </div>
          </div>
        </div>

        <div className="no-break">
          <h2 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-black">
            商品明细
          </h2>
          <table className="print-table">
            <thead>
              <tr>
                <th className="text-left" style={{ width: '8%' }}>序号</th>
                <th className="text-left" style={{ width: '42%' }}>商品名称</th>
                <th className="text-right" style={{ width: '15%' }}>单价 (元)</th>
                <th className="text-right" style={{ width: '15%' }}>数量</th>
                <th className="text-right" style={{ width: '20%' }}>小计 (元)</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td className="text-left">{index + 1}</td>
                  <td className="text-left">{item.name}</td>
                  <td className="text-right">{item.price.toFixed(2)}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{item.amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td colSpan="2" className="text-right">合计</td>
                <td className="text-right">-</td>
                <td className="text-right">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td className="text-right">{totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div className="mt-4 text-right">
            <p className="text-lg">
              大写金额：
              <span className="font-bold underline">{numberToChinese(totalAmount)}</span>
            </p>
          </div>
        </div>

        {(order.confirmations?.customer || order.confirmations?.staff) && (
          <div className="no-break">
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b-2 border-black">
              确认信息
            </h2>
            <div className="grid grid-cols-2 gap-8">
              {order.confirmations?.customer && (
                <div className="border-2 rounded p-4">
                  <h3 className="font-bold mb-2">客户确认</h3>
                  <div className="space-y-1 text-sm">
                    <p>确认人：{order.confirmations.customer.name}</p>
                    <p>联系电话：{order.confirmations.customer.phone}</p>
                    {order.confirmations.customer.note && (
                      <p>备注：{order.confirmations.customer.note}</p>
                    )}
                    <p>确认时间：{new Date(order.confirmations.customer.time).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {order.confirmations?.staff && (
                <div className="border-2 rounded p-4">
                  <h3 className="font-bold mb-2">业务员确认</h3>
                  <div className="space-y-1 text-sm">
                    <p>确认人：{order.confirmations.staff.name}</p>
                    <p>联系电话：{order.confirmations.staff.phone}</p>
                    {order.confirmations.staff.note && (
                      <p>备注：{order.confirmations.staff.note}</p>
                    )}
                    <p>确认时间：{new Date(order.confirmations.staff.time).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="print-signature mt-8 pt-8 border-t-2 border-black no-break">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <p className="text-sm font-bold mb-2">客户签字：</p>
              <div className="border-b-2 border-black min-h-[60px]"></div>
              <p className="text-sm mt-2">日期：________________</p>
            </div>
            <div>
              <p className="text-sm font-bold mb-2">业务员签字：</p>
              <div className="border-b-2 border-black min-h-[60px]"></div>
              <p className="text-sm mt-2">日期：________________</p>
            </div>
            <div>
              <p className="text-sm font-bold mb-2">公司盖章：</p>
              <div className="border-b-2 border-black min-h-[60px]"></div>
              <p className="text-sm mt-2">日期：________________</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm">
        <p className="font-bold">本单据一式三联：白联存根、红联客户、蓝联财务</p>
        <p className="mt-1 text-gray-500">打印时间：{new Date().toLocaleString()}</p>
      </div>
    </div>
  );
});

// 数字转中文大写
function numberToChinese(num) {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿'];
  const decimal = ['角', '分'];

  let result = '';
  const numStr = num.toFixed(2);
  const integerPart = Math.floor(num).toString();
  const decimalPart = numStr.split('.')[1];

  // 处理整数部分
  for (let i = 0; i < integerPart.length; i++) {
    const digit = parseInt(integerPart[i]);
    const unit = units[integerPart.length - 1 - i];
    if (digit === 0) {
      if (i === integerPart.length - 1 || result.endsWith('零')) continue;
      result += digits[digit];
    } else {
      result += digits[digit] + unit;
    }
  }

  result += '元';

  // 处理小数部分
  if (parseInt(decimalPart) === 0) {
    result += '整';
  } else {
    for (let i = 0; i < 2; i++) {
      const digit = parseInt(decimalPart[i]);
      if (digit !== 0) {
        result += digits[digit] + decimal[i];
      }
    }
  }

  return result;
}

context.wpm.export('comp_delivery_print', DeliveryPrint);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_share_content" title="送货单分享页面内容">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Card, CardBody, Progress, Button } = NextUI;
const DeliveryDetailProgress = await context.wpm.import('comp_delivery_detail_progress');
const DeliveryDetailInfo = await context.wpm.import('comp_delivery_detail_info');
const DeliveryDetailItems = await context.wpm.import('comp_delivery_detail_items');
const DeliveryDetailConfirmations = await context.wpm.import('comp_delivery_detail_confirmations');

const DeliveryShareContent = observer(({
  order,
  onConfirm
}) => {
  const [confirming, setConfirming] = React.useState(false);
  const confirmProgress = [
    order.confirmations?.customer,
    order.confirmations?.staff
  ].filter(Boolean).length;

  const handleConfirm = async (type) => {
    setConfirming(true);
    try {
      await onConfirm(type);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-medium font-medium">确认进度</h4>
            <span className="text-small text-default-400">
              {confirmProgress}/2 已确认
            </span>
          </div>
          <Progress
            aria-label="确认进度"
            value={confirmProgress * 50}
            className="mb-4"
          />
          <div className="flex gap-2 justify-end">
            <Button
              color="primary"
              variant={order.confirmations?.customer ? "flat" : "solid"}
              startContent={<Icon icon="solar:user-check-bold" />}
              isDisabled={order.confirmations?.customer || confirming}
              isLoading={confirming}
              onPress={() => handleConfirm('customer')}
            >
              客户确认
            </Button>
            <Button
              color="secondary"
              variant={order.confirmations?.staff ? "flat" : "solid"}
              startContent={<Icon icon="solar:shield-check-bold" />}
              isDisabled={order.confirmations?.staff || confirming}
              isLoading={confirming}
              onPress={() => handleConfirm('staff')}
            >
              业务员确认
            </Button>
          </div>
        </CardBody>
      </Card>

      <DeliveryDetailInfo order={order} />
      <DeliveryDetailItems order={order} />
      <DeliveryDetailConfirmations order={order} />
    </div>
  );
});

context.wpm.export('comp_delivery_share_content', DeliveryShareContent);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_share_header" title="送货单分享页面头部">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Button } = NextUI;

const DeliveryShareHeader = observer(({
  onEdit
}) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-xl font-bold">送货单详情</h1>
      <Button
        color="primary"
        variant="flat"
        startContent={<Icon icon="solar:pen-bold" />}
        onPress={onEdit}
      >
        编辑
      </Button>
    </div>
  );
});

context.wpm.export('comp_delivery_share_header', DeliveryShareHeader);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_share_layout" title="送货单分享页面布局">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Spinner } = NextUI;

const DeliveryShareLayout = observer(({
  loading,
  error,
  children
}) => {
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" label="加载中..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Icon className="text-danger" icon="solar:shield-warning-bold" width={48} />
          </div>
          <p className="mb-2 text-xl">送货单不存在或已被删除</p>
          <p className="mb-4 text-small text-default-500">
            请检查链接是否正确，或联系管理员
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-default-50 p-6">
      <div className="mx-auto max-w-3xl">
        {children}
      </div>
    </div>
  );
});

context.wpm.export('comp_delivery_share_layout', DeliveryShareLayout);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_table" title="送货单表格组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  ReactRouterDom,
  message
} = context;

const { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Button, Chip, useDisclosure, Spinner } = NextUI;
const { useNavigate } = ReactRouterDom;
const deliveryStore = await context.wpm.import('store_delivery');
const userStore = await context.wpm.import('store_user');
const DeliveryForm = await context.wpm.import('comp_delivery_form');
const DeliveryDetail = await context.wpm.import('comp_delivery_detail');

const DeliveryTable = observer(() => {
  const formModal = useDisclosure();
  const detailModal = useDisclosure();
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const columns = [
    {
      key: "customerName",
      label: "客户名称"
    },
    {
      key: "contactPerson",
      label: "联系人"
    },
    {
      key: "contactPhone",
      label: "联系电话"
    },
    {
      key: "deliveryTime",
      label: "送货日期"
    },
    {
      key: "totalAmount",
      label: "总金额"
    },
    {
      key: "status",
      label: "状态"
    },
    {
      key: "actions",
      label: "操作"
    }
  ];

  const handleEdit = async (order) => {
    setLoading(true);
    try {
      await deliveryStore.setCurrentOrder(order);
      formModal.onOpen();
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (order) => {
    setLoading(true);
    try {
      const detail = await deliveryStore.getOrderById(order.id);
      if (detail) {
        setSelectedOrder(detail);
        detailModal.onOpen();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (order) => {
    if (!userStore.enterpriseInfo.id) {
      
                  message.error('无法获取组织信息');
      return;
    }
    navigate(`/share/${order.id}?oid=${userStore.enterpriseInfo.id}`);
  };

  const handleDelete = async (id) => {
    await deliveryStore.deleteDeliveryOrder(id);
  };

  const renderCell = (order, columnKey) => {
    const cellValue = order[columnKey];

    switch (columnKey) {
      case "totalAmount":
        return `¥${order.totalAmount}`;
        
      case "status":
        return (
          <Chip
            className="capitalize"
            color={deliveryStore.constructor.StatusColor[order.status]}
            size="sm"
            variant="flat"
            startContent={
              <Icon 
                className="text-current" 
                icon={deliveryStore.constructor.StatusIcon[order.status]}
                width={16}
              />
            }
          >
            {deliveryStore.constructor.StatusText[order.status]}
          </Chip>
        );
        
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              isLoading={loading}
              onPress={() => handleView(order)}
            >
              <Icon className="text-default-400" icon="solar:eye-bold" width={16} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              isLoading={loading}
              onPress={() => handleEdit(order)}
            >
              <Icon className="text-default-400" icon="solar:pen-bold" width={16} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleShare(order)}
            >
              <Icon className="text-default-400" icon="solar:share-bold" width={16} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              color="danger"
              variant="light"
              onPress={() => handleDelete(order.id)}
            >
              <Icon icon="solar:trash-bin-trash-bold" width={16} />
            </Button>
          </div>
        );
        
      default:
        return cellValue;
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">送货单列表</h3>
        <div className="flex items-center gap-2">
          {deliveryStore.filterStatus && (
            <Button
              variant="flat"
              startContent={<Icon icon="line-md:remove" />}
              onPress={() => deliveryStore.clearFilter()}
            >
              清除筛选
            </Button>
          )}
          <Button
            color="primary"
            endContent={<Icon icon="solar:add-circle-bold" />}
            onPress={() => {
              deliveryStore.clearCurrentOrder();
              formModal.onOpen();
            }}
          >
            新建送货单
          </Button>
        </div>
      </div>

      <Table
        aria-label="送货单列表"
        classNames={{
          wrapper: "max-h-[600px]",
        }}
        loadingContent={<Spinner label="加载中..." />}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "actions" ? "center" : "start"}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={deliveryStore.deliveryOrders}
          emptyContent="暂无数据"
        >
          {(order) => (
            <TableRow key={order.id}>
              {(columnKey) => (
                <TableCell>{renderCell(order, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeliveryForm
        isOpen={formModal.isOpen}
        onOpenChange={formModal.onOpenChange}
      />

      <DeliveryDetail
        isOpen={detailModal.isOpen}
        onOpenChange={detailModal.onOpenChange}
        order={selectedOrder}
      />
    </div>
  );
});

context.wpm.export('comp_delivery_table', DeliveryTable);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_report_chart" title="报表图表组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  recharts
} = context;

const { Card, CardBody, Button, Spinner } = NextUI;
const {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  YAxis
} = recharts;

const ReportChart = observer(({
  data,
  title,
  series = [],
  type = 'line',
  suffix = '',
  height = 400
}) => {
  const colors = ['primary', 'secondary', 'success', 'warning', 'danger'];
  const RADIAN = Math.PI / 180;

  const formatValue = (value) => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'k';
      }
      return value.toLocaleString();
    }
    return value;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return (
          <PieChart width={height} height={height}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={height / 2.5}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(var(--nextui-${colors[index % colors.length]}))`}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0];
                  return (
                    <div className="rounded-lg bg-background border border-default-200 p-3">
                      <p className="text-small font-medium">{item.name}</p>
                      <p className="text-small text-default-600">
                        {formatValue(item.value)} {suffix}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        );

      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg bg-background border border-default-200 p-3">
                      <p className="text-small font-medium">{label}</p>
                      <p className="text-small text-default-600">
                        {formatValue(payload[0].value)} {suffix}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" fill={`hsl(var(--nextui-primary))`}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(var(--nextui-${colors[index % colors.length]}))`}
                />
              ))}
            </Bar>
          </BarChart>
        );

      default:
        return (
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              {series.map((item, index) => (
                <linearGradient key={item} id={`color${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={`hsl(var(--nextui-${colors[index % colors.length]}))`}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={`hsl(var(--nextui-${colors[index % colors.length]}))`}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11 }}
              dy={10}
              interval="preserveStartEnd"
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg bg-background border border-default-200 p-3">
                      <p className="text-small font-medium mb-2">{label}</p>
                      <div className="flex flex-col gap-1">
                        {payload.map((entry, index) => (
                          <div key={`item-${index}`} className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: `hsl(var(--nextui-${colors[index % colors.length]}))`
                              }}
                            />
                            <span className="text-small text-default-600">
                              {entry.name}: {formatValue(entry.value)} {suffix}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            {series.map((item, index) => (
              <Area
                key={item}
                type="monotone"
                dataKey={item}
                name={item}
                stroke={`hsl(var(--nextui-${colors[index % colors.length]}))`}
                fillOpacity={1}
                fill={`url(#color${index})`}
              />
            ))}
          </AreaChart>
        );
    }
  };

  return (
    <Card>
      <CardBody>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h4 className="text-medium font-medium">{title}</h4>
          {type === 'line' && (
            <div className="flex flex-wrap items-center gap-2">
              {series.map((item, index) => (
                <div key={item} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full bg-${colors[index % colors.length]}`} />
                  <span className="text-small text-default-600">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_report_chart', ReportChart);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_report_customer">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } = NextUI;
const reportStore = await context.wpm.import('store_report');

const CustomerReport = observer(() => {
  const report = reportStore.getCurrentReport();
  
  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* 订单数量排行 */}
      <Card>
        <CardBody>
          <h4 className="mb-4 text-medium font-medium">客户订单排行</h4>
          <Table
            aria-label="客户订单排行"
            removeWrapper
            classNames={{
              wrapper: "max-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn>排名</TableColumn>
              <TableColumn>客户名称</TableColumn>
              <TableColumn>订单数量</TableColumn>
            </TableHeader>
            <TableBody>
              {report.orderRanking.map((item, index) => (
                <TableRow key={item.name}>
                  <TableCell>
                    {index < 3 ? (
                      <Icon
                        className={cn(
                          "text-2xl",
                          index === 0 ? "text-warning" : 
                          index === 1 ? "text-default-400" : 
                          "text-orange-600"
                        )}
                        icon="solar:medal-ribbons-star-bold"
                      />
                    ) : (
                      `#${index + 1}`
                    )}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.orderCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* 消费金额排行 */}
      <Card>
        <CardBody>
          <h4 className="mb-4 text-medium font-medium">客户消费排行</h4>
          <Table
            aria-label="客户消费排行"
            removeWrapper
            classNames={{
              wrapper: "max-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn>排名</TableColumn>
              <TableColumn>客户名称</TableColumn>
              <TableColumn>消费金额</TableColumn>
              <TableColumn>平均订单金额</TableColumn>
            </TableHeader>
            <TableBody>
              {report.amountRanking.map((item, index) => (
                <TableRow key={item.name}>
                  <TableCell>
                    {index < 3 ? (
                      <Icon
                        className={cn(
                          "text-2xl",
                          index === 0 ? "text-warning" : 
                          index === 1 ? "text-default-400" : 
                          "text-orange-600"
                        )}
                        icon="solar:medal-ribbons-star-bold"
                      />
                    ) : (
                      `#${index + 1}`
                    )}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>¥{item.totalAmount}</TableCell>
                  <TableCell>
                    ¥{report.averageOrderAmount.find(avg => avg.name === item.name)?.average.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
});

context.wpm.export('comp_report_customer', CustomerReport);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_report_dashboard" title="报表仪表盘">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody, Button, RadioGroup, Radio, Input, Tabs, Tab } = NextUI;
const reportStore = await context.wpm.import('store_report');
const CustomerReport = await context.wpm.import('comp_report_customer');
const ProductReport = await context.wpm.import('comp_report_product');
const ReportChart = await context.wpm.import('comp_report_chart');

const ReportDashboard = observer(() => {
  React.useEffect(() => {
    reportStore.generateReport();
  }, []);

  const report = reportStore.getCurrentReport();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold">数据报表</h2>
          <p className="text-small text-default-500">
            查看销售数据统计和分析
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <RadioGroup
            orientation="horizontal"
            value={reportStore.currentDimension}
            onValueChange={value => reportStore.setDimension(value)}
          >
            <Radio value="customer">客户维度</Radio>
            <Radio value="product">商品维度</Radio>
          </RadioGroup>

          <Button
            variant="flat"
            startContent={<Icon icon="solar:refresh-circle-bold" />}
            onPress={() => reportStore.refreshReport()}
          >
            刷新数据
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <Tabs
                size="sm"
                selectedKey={reportStore.chartPeriod}
                onSelectionChange={key => reportStore.setChartPeriod(key)}
                classNames={{
                  tabList: "gap-4",
                  cursor: "w-full sm:w-auto",
                  tab: "max-w-fit px-2 h-8",
                  tabContent: "group-data-[selected=true]:text-primary"
                }}
              >
                <Tab key="6-months" title="6个月" />
                <Tab key="3-months" title="3个月" />
                <Tab key="30-days" title="30天" />
                <Tab key="7-days" title="7天" />
              </Tabs>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <span className="min-w-[80px] text-small text-default-500">开始日期</span>
                  <Input
                    type="date"
                    className="flex-1"
                    classNames={{
                      input: "text-small"
                    }}
                    value={reportStore.dateRange.start}
                    onChange={e => reportStore.setDateRange(e.target.value, reportStore.dateRange.end)}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <span className="min-w-[80px] text-small text-default-500">结束日期</span>
                  <Input
                    type="date"
                    className="flex-1"
                    classNames={{
                      input: "text-small"
                    }}
                    value={reportStore.dateRange.end}
                    onChange={e => reportStore.setDateRange(reportStore.dateRange.start, e.target.value)}
                  />
                </div>
              </div>
            </div>

            {report?.chartData && reportStore.currentDimension === 'customer' && (
              <div className="space-y-6">
                <ReportChart
                  title="客户订单趋势"
                  data={report.chartData.orderTrend}
                  series={report.orderRanking.slice(0, 5).map(c => c.name)}
                  suffix="单"
                  height={300}
                />
                <ReportChart
                  title="客户消费趋势"
                  data={report.chartData.amountTrend}
                  series={report.amountRanking.slice(0, 5).map(c => c.name)}
                  suffix="元"
                  height={300}
                />
              </div>
            )}

            {report?.chartData && reportStore.currentDimension === 'product' && (
              <div className="space-y-6">
                <ReportChart
                  title="商品销量趋势"
                  data={report.chartData.quantityTrend}
                  series={report.quantityRanking.slice(0, 5).map(p => p.name)}
                  suffix="件"
                  height={300}
                />
                <ReportChart
                  title="商品销售额趋势"
                  data={report.chartData.amountTrend}
                  series={report.amountRanking.slice(0, 5).map(p => p.name)}
                  suffix="元"
                  height={300}
                />
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {reportStore.currentDimension === 'customer' ? (
        <CustomerReport />
      ) : (
        <ProductReport />
      )}
    </div>
  );
});

context.wpm.export('comp_report_dashboard', ReportDashboard);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_report_product" title="商品报表组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Spinner } = NextUI;
const reportStore = await context.wpm.import('store_report');

const ProductReport = observer(() => {
  const report = reportStore.getCurrentReport();
  
  if (!report) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Spinner label="加载中..." />
      </div>
    );
  }

  if (!Array.isArray(report.quantityRanking) || !Array.isArray(report.amountRanking)) {
    return (
      <div className="flex h-[200px] items-center justify-center flex-col gap-2">
        <Icon className="text-danger" icon="solar:shield-warning-bold" width={32} />
        <p className="text-danger">数据加载失败</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 销量排行 */}
      <Card>
        <CardBody>
          <h4 className="mb-4 text-medium font-medium">酒类销量排行</h4>
          <Table
            aria-label="酒类销量排行"
            removeWrapper
            classNames={{
              wrapper: "max-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn>排名</TableColumn>
              <TableColumn>商品名称</TableColumn>
              <TableColumn>销售数量</TableColumn>
            </TableHeader>
            <TableBody>
              {report.quantityRanking.map((item, index) => (
                <TableRow key={item.name}>
                  <TableCell>
                    {index < 3 ? (
                      <Icon
                        className={cn(
                          "text-2xl",
                          index === 0 ? "text-warning" : 
                          index === 1 ? "text-default-400" : 
                          "text-orange-600"
                        )}
                        icon="solar:medal-ribbons-star-bold"
                      />
                    ) : (
                      `#${index + 1}`
                    )}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* 销售金额排行 */}
      <Card>
        <CardBody>
          <h4 className="mb-4 text-medium font-medium">酒类销售额排行</h4>
          <Table
            aria-label="酒类销售额排行"
            removeWrapper
            classNames={{
              wrapper: "max-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn>排名</TableColumn>
              <TableColumn>商品名称</TableColumn>
              <TableColumn>销售金额</TableColumn>
              <TableColumn>平均单价</TableColumn>
            </TableHeader>
            <TableBody>
              {report.amountRanking.map((item, index) => (
                <TableRow key={item.name}>
                  <TableCell>
                    {index < 3 ? (
                      <Icon
                        className={cn(
                          "text-2xl",
                          index === 0 ? "text-warning" : 
                          index === 1 ? "text-default-400" : 
                          "text-orange-600"
                        )}
                        icon="solar:medal-ribbons-star-bold"
                      />
                    ) : (
                      `#${index + 1}`
                    )}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>¥{item.amount}</TableCell>
                  <TableCell>
                    ¥{report.averagePrice.find(avg => avg.name === item.name)?.average.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
});

context.wpm.export('comp_report_product', ProductReport);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_report_trend_card" title="趋势卡片组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, Chip } = NextUI;

const TrendCard = observer(({
  title,
  value,
  change,
  changeType,
  trendType,
  trendChipPosition = "top",
  trendChipVariant = "light",
  prefix = "",
  suffix = ""
}) => {
  return (
    <Card className="border border-transparent dark:border-default-100">
      <div className="flex p-4">
        <div className="flex flex-col gap-y-2">
          <dt className="text-small font-medium text-default-500">{title}</dt>
          <dd className="text-2xl font-semibold text-default-700">
            {prefix}{value}{suffix}
          </dd>
        </div>
        <Chip
          className={cn("absolute right-4", {
            "top-4": trendChipPosition === "top",
            "bottom-4": trendChipPosition === "bottom",
          })}
          classNames={{
            content: "font-medium text-[0.65rem]",
          }}
          color={
            changeType === "positive" ? "success" : 
            changeType === "neutral" ? "warning" : 
            "danger"
          }
          radius="sm"
          size="sm"
          startContent={
            trendType === "up" ? (
              <Icon height={12} icon="solar:arrow-right-up-linear" width={12} />
            ) : trendType === "neutral" ? (
              <Icon height={12} icon="solar:arrow-right-linear" width={12} />
            ) : (
              <Icon height={12} icon="solar:arrow-right-down-linear" width={12} />
            )
          }
          variant={trendChipVariant}
        >
          {change}
        </Chip>
      </div>
    </Card>
  );
});

context.wpm.export('comp_report_trend_card', TrendCard);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_sidebar">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  ReactRouterDom,
  cn
} = context;

const { Accordion, AccordionItem, Listbox, Tooltip, ListboxItem, ListboxSection } = NextUI;
const { useLocation, useNavigate } = ReactRouterDom;

// 使用普通对象替代 enum
const SidebarItemType = {
  Nest: "nest"
};

const Sidebar = observer(({
  items,
  isCompact,
  defaultSelectedKey,
  onSelect,
  hideEndContent,
  sectionClasses: sectionClassesProp = {},
  itemClasses: itemClassesProp = {},
  iconClassName,
  classNames,
  className,
  ...props
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // 根据当前路由路径确定选中的菜单项
  const getSelectedKeyFromPath = () => {
    const path = location.pathname;
    let selectedKey = defaultSelectedKey;

    // 遍历所有菜单项查找匹配的路由
    const findMatchingItem = (items) => {
      for (const item of items) {
        if (item.href && path.startsWith(item.href)) {
          selectedKey = item.key;
          return true;
        }
        if (item.items) {
          const found = findMatchingItem(item.items);
          if (found) return true;
        }
      }
      return false;
    };

    findMatchingItem(items);
    return selectedKey;
  };

  const [selected, setSelected] = React.useState(getSelectedKeyFromPath());

  // 监听路由变化更新选中状态
  React.useEffect(() => {
    setSelected(getSelectedKeyFromPath());
  }, [location.pathname]);

  const sectionClasses = {
    ...sectionClassesProp,
    base: cn(sectionClassesProp?.base, "w-full", {
      "p-0 max-w-[44px]": isCompact,
    }),
    group: cn(sectionClassesProp?.group, {
      "flex flex-col gap-1": isCompact,
    }),
    heading: cn(sectionClassesProp?.heading, {
      hidden: isCompact,
    }),
  };

  const itemClasses = {
    ...itemClassesProp,
    base: cn(itemClassesProp?.base, {
      "w-11 h-11 gap-0 p-0": isCompact,
    }),
  };

  const renderNestItem = React.useCallback(
    (item) => {
      const isNestType =
        item.items && item.items?.length > 0 && item?.type === SidebarItemType.Nest;

      if (isNestType) {
        delete item.href;
      }

      return (
        <ListboxItem
          {...item}
          key={item.key}
          classNames={{
            base: cn(
              {
                "h-auto p-0": !isCompact && isNestType,
              },
              {
                "inline-block w-11": isCompact && isNestType,
              },
            ),
          }}
          endContent={isCompact || isNestType || hideEndContent ? null : item.endContent ?? null}
          startContent={
            isCompact || isNestType ? null : item.icon ? (
              <Icon
                className={cn(
                  "text-default-500 group-data-[selected=true]:text-foreground",
                  iconClassName,
                )}
                icon={item.icon}
                width={24}
              />
            ) : (
              item.startContent ?? null
            )
          }
          title={isCompact || isNestType ? null : item.title}
        >
          {isCompact ? (
            <Tooltip content={item.title} placement="right">
              <div className="flex w-full items-center justify-center">
                {item.icon ? (
                  <Icon
                    className={cn(
                      "text-default-500 group-data-[selected=true]:text-foreground",
                      iconClassName,
                    )}
                    icon={item.icon}
                    width={24}
                  />
                ) : (
                  item.startContent ?? null
                )}
              </div>
            </Tooltip>
          ) : null}
          {!isCompact && isNestType ? (
            <Accordion className={"p-0"}>
              <AccordionItem
                key={item.key}
                aria-label={item.title}
                classNames={{
                  heading: "pr-3",
                  trigger: "p-0",
                  content: "py-0 pl-4",
                }}
                title={
                  item.icon ? (
                    <div className={"flex h-11 items-center gap-2 px-2 py-1.5"}>
                      <Icon
                        className={cn(
                          "text-default-500 group-data-[selected=true]:text-foreground",
                          iconClassName,
                        )}
                        icon={item.icon}
                        width={24}
                      />
                      <span className="text-small font-medium text-default-500 group-data-[selected=true]:text-foreground">
                        {item.title}
                      </span>
                    </div>
                  ) : (
                    item.startContent ?? null
                  )
                }
              >
                {item.items && item.items?.length > 0 ? (
                  <Listbox
                    className={"mt-0.5"}
                    classNames={{
                      list: cn("border-l border-default-200 pl-4"),
                    }}
                    items={item.items}
                    variant="flat"
                  >
                    {item.items.map(renderItem)}
                  </Listbox>
                ) : (
                  renderItem(item)
                )}
              </AccordionItem>
            </Accordion>
          ) : null}
        </ListboxItem>
      );
    },
    [isCompact, hideEndContent, iconClassName, items],
  );

  const renderItem = React.useCallback(
    (item) => {
      const isNestType =
        item.items && item.items?.length > 0 && item?.type === SidebarItemType.Nest;

      if (isNestType) {
        return renderNestItem(item);
      }

      return (
        <ListboxItem
          {...item}
          key={item.key}
          endContent={isCompact || hideEndContent ? null : item.endContent ?? null}
          startContent={
            isCompact ? null : item.icon ? (
              <Icon
                className={cn(
                  "text-default-500 group-data-[selected=true]:text-foreground",
                  iconClassName,
                )}
                icon={item.icon}
                width={24}
              />
            ) : (
              item.startContent ?? null
            )
          }
          textValue={item.title}
          title={isCompact ? null : item.title}
        >
          {isCompact ? (
            <Tooltip content={item.title} placement="right">
              <div className="flex w-full items-center justify-center">
                {item.icon ? (
                  <Icon
                    className={cn(
                      "text-default-500 group-data-[selected=true]:text-foreground",
                      iconClassName,
                    )}
                    icon={item.icon}
                    width={24}
                  />
                ) : (
                  item.startContent ?? null
                )}
              </div>
            </Tooltip>
          ) : null}
        </ListboxItem>
      );
    },
    [isCompact, hideEndContent, iconClassName, itemClasses?.base],
  );

  const handleSelectionChange = (keys) => {
    const key = Array.from(keys)[0];
    setSelected(key);

    // 查找选中项的路由并导航
    const findItemByKey = (items, key) => {
      for (const item of items) {
        if (item.key === key) {
          return item;
        }
        if (item.items) {
          const found = findItemByKey(item.items, key);
          if (found) return found;
        }
      }
      return null;
    };

    const selectedItem = findItemByKey(items, key);
    if (selectedItem?.href) {
      navigate(selectedItem.href);
    }

    onSelect?.(key);
  };

  return (
    <Listbox
      key={isCompact ? "compact" : "default"}
      hideSelectedIcon
      as="nav"
      className={cn("list-none", className)}
      classNames={{
        ...classNames,
        list: cn("items-center", classNames?.list),
      }}
      color="default"
      itemClasses={{
        ...itemClasses,
        base: cn(
          "px-3 min-h-11 rounded-large h-[44px] data-[selected=true]:bg-default-100",
          itemClasses?.base,
        ),
        title: cn(
          "text-small font-medium text-default-500 group-data-[selected=true]:text-foreground",
          itemClasses?.title,
        ),
      }}
      items={items}
      selectedKeys={[selected]}
      selectionMode="single"
      variant="flat"
      onSelectionChange={handleSelectionChange}
      {...props}
    >
      {(item) => {
        return item.items && item.items?.length > 0 && item?.type === SidebarItemType.Nest ? (
          renderNestItem(item)
        ) : item.items && item.items?.length > 0 ? (
          <ListboxSection
            key={item.key}
            classNames={sectionClasses}
            showDivider={isCompact}
            title={item.title}
          >
            {item.items.map(renderItem)}
          </ListboxSection>
        ) : (
          renderItem(item)
        );
      }}
    </Listbox>
  );
});

context.wpm.export('comp_sidebar', Sidebar);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_sidebar_drawer">
const {
  wpm,
  React,
  NextUI,
  observer,
  FramerMotion,
  cn
} = context;

// 自定义过渡动画常量
const TRANSITION_EASINGS = {
  easeOut: [0.4, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  easeInOut: [0.4, 0, 0.2, 1]
};

const { Drawer, DrawerBody, DrawerContent } = NextUI;

const SidebarDrawer = observer(({
  children,
  className,
  onOpenChange,
  isOpen,
  sidebarWidth = 288,
  classNames = {},
  sidebarPlacement = "left",
  motionProps: drawerMotionProps,
  ...props
}) => {
  const motionProps = React.useMemo(() => {
    if (!!drawerMotionProps && typeof drawerMotionProps === "object") {
      return drawerMotionProps;
    }

    return {
      variants: {
        enter: {
          x: 0,
          transition: {
            x: {
              duration: 0.3,
              ease: TRANSITION_EASINGS.easeOut,
            },
          },
        },
        exit: {
          x: sidebarPlacement == "left" ? -sidebarWidth : sidebarWidth,
          transition: {
            x: {
              duration: 0.2,
              ease: TRANSITION_EASINGS.easeOut,
            },
          },
        },
      },
    };
  }, [sidebarWidth, sidebarPlacement, drawerMotionProps]);

  return (
    <>
      <Drawer
        {...props}
        classNames={{
          ...classNames,
          wrapper: cn("!w-[var(--sidebar-width)]", classNames?.wrapper, {
            "!items-start !justify-start ": sidebarPlacement === "left",
            "!items-end !justify-end": sidebarPlacement === "right",
          }),
          base: cn(
            "w-[var(--sidebar-width)] !m-0 p-0 h-full max-h-full",
            classNames?.base,
            className,
            {
              "inset-y-0 left-0 max-h-[none] rounded-l-none !justify-start":
                sidebarPlacement === "left",
              "inset-y-0 right-0 max-h-[none] rounded-r-none !justify-end":
                sidebarPlacement === "right",
            },
          ),
          body: cn("p-0", classNames?.body),
          closeButton: cn("z-50", classNames?.closeButton),
        }}
        isOpen={isOpen}
        motionProps={motionProps}
        radius="none"
        scrollBehavior="inside"
        style={{
          "--sidebar-width": `${sidebarWidth}px`,
        }}
        onOpenChange={onOpenChange}
      >
        <DrawerContent>
          <DrawerBody>{children}</DrawerBody>
        </DrawerContent>
      </Drawer>
      <div
        className={cn(
          "hidden h-full max-w-[var(--sidebar-width)] overflow-x-hidden overflow-y-scroll sm:flex",
          className,
        )}
      >
        {children}
      </div>
    </>
  );
});

context.wpm.export('comp_sidebar_drawer', SidebarDrawer);
</mo-ai-code>
```

```jsx
<mo-ai-code type="module" name="utils_delivery_diff" title="送货单数据比较工具">
const {
  wpm
} = context;

// 字段名映射
const fieldNameMap = {
  customerName: '客户名称',
  contactPerson: '联系人',
  contactPhone: '联系电话',
  deliveryTime: '送货日期',
  address: '送货地址',
  status: '状态',
  items: '商品明细',
  name: '商品名称',
  quantity: '数量',
  price: '单价',
  amount: '金额',
  confirmations: '确认信息',
  customer: '客户确认',
  staff: '业务员确认',
  note: '备注'
};

// 比较两个对象的差异
const compareObjects = (oldObj, newObj, path = '') => {
  const changes = [];

  // 如果是数组，使用专门的数组比较逻辑
  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    return compareArrays(oldObj, newObj, path);
  }

  // 获取所有唯一的键
  const allKeys = new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {})
  ]);

  for (const key of allKeys) {
    const oldValue = oldObj?.[key];
    const newValue = newObj?.[key];
    const currentPath = path ? `${path}.${key}` : key;

    // 如果键在新对象中不存在
    if (!(key in newObj)) {
      changes.push({
        type: 'deleted',
        path: currentPath,
        oldValue,
        newValue: undefined
      });
      continue;
    }

    // 如果键在旧对象中不存在
    if (!(key in oldObj)) {
      changes.push({
        type: 'added',
        path: currentPath,
        oldValue: undefined,
        newValue
      });
      continue;
    }

    // 如果两个值都是对象，递归比较
    if (
      typeof oldValue === 'object' &&
      typeof newValue === 'object' &&
      oldValue !== null &&
      newValue !== null &&
      !Array.isArray(oldValue) &&
      !Array.isArray(newValue)
    ) {
      changes.push(...compareObjects(oldValue, newValue, currentPath));
      continue;
    }

    // 比较值是否相等
    if (!isEqual(oldValue, newValue)) {
      changes.push({
        type: 'updated',
        path: currentPath,
        oldValue,
        newValue
      });
    }
  }

  return changes;
};

// 比较数组
const compareArrays = (oldArray, newArray, path) => {
  const changes = [];

  // 如果是商品列表，使用商品名称作为标识符
  if (path.endsWith('items')) {
    const oldMap = new Map(oldArray.map(item => [item.name, item]));
    const newMap = new Map(newArray.map(item => [item.name, item]));

    // 检查删除的商品
    for (const [name, item] of oldMap) {
      if (!newMap.has(name)) {
        changes.push({
          type: 'deleted',
          path: `${path}`,
          oldValue: item,
          newValue: undefined
        });
      }
    }

    // 检查新增的商品
    for (const [name, item] of newMap) {
      if (!oldMap.has(name)) {
        changes.push({
          type: 'added',
          path: `${path}`,
          oldValue: undefined,
          newValue: item
        });
      }
    }

    // 检查修改的商品
    for (const [name, oldItem] of oldMap) {
      const newItem = newMap.get(name);
      if (newItem && !isEqual(oldItem, newItem)) {
        changes.push({
          type: 'updated',
          path: `${path}`,
          oldValue: oldItem,
          newValue: newItem
        });
      }
    }
  } else {
    // 其他数组的通用比较逻辑
    const maxLength = Math.max(oldArray.length, newArray.length);
    for (let i = 0; i < maxLength; i++) {
      if (i >= oldArray.length) {
        changes.push({
          type: 'added',
          path: `${path}[${i}]`,
          oldValue: undefined,
          newValue: newArray[i]
        });
      } else if (i >= newArray.length) {
        changes.push({
          type: 'deleted',
          path: `${path}[${i}]`,
          oldValue: oldArray[i],
          newValue: undefined
        });
      } else if (!isEqual(oldArray[i], newArray[i])) {
        changes.push({
          type: 'updated',
          path: `${path}[${i}]`,
          oldValue: oldArray[i],
          newValue: newArray[i]
        });
      }
    }
  }

  return changes;
};

// 判断两个值是否相等
const isEqual = (value1, value2) => {
  if (value1 === value2) return true;
  if (typeof value1 !== typeof value2) return false;
  if (typeof value1 !== 'object') return value1 === value2;
  if (value1 === null || value2 === null) return value1 === value2;
  
  const keys1 = Object.keys(value1);
  const keys2 = Object.keys(value2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => isEqual(value1[key], value2[key]));
};

// 格式化金额
const formatAmount = (amount) => {
  return `¥${parseFloat(amount).toFixed(2)}`;
};

// 格式化差异结果
const formatDiff = (changes) => {
  return changes.map(change => {
    const pathParts = change.path.split('.');
    const fieldName = fieldNameMap[pathParts[pathParts.length - 1]] || pathParts[pathParts.length - 1];
    
    let detail = '';
    
    if (change.path.endsWith('items')) {
      if (change.type === 'added') {
        detail = `新增商品：${change.newValue.name}，数量：${change.newValue.quantity}，单价：${formatAmount(change.newValue.price)}`;
      } else if (change.type === 'deleted') {
        detail = `删除商品：${change.oldValue.name}，数量：${change.oldValue.quantity}，单价：${formatAmount(change.oldValue.price)}`;
      } else if (change.type === 'updated') {
        const diffs = [];
        if (change.oldValue.quantity !== change.newValue.quantity) {
          diffs.push(`数量从 ${change.oldValue.quantity} 改为 ${change.newValue.quantity}`);
        }
        if (change.oldValue.price !== change.newValue.price) {
          diffs.push(`单价从 ${formatAmount(change.oldValue.price)} 改为 ${formatAmount(change.newValue.price)}`);
        }
        detail = `修改商品 ${change.newValue.name}：${diffs.join('，')}`;
      }
    } else if (change.path.includes('confirmations')) {
      if (change.type === 'added') {
        detail = `添加${fieldName}信息`;
      } else if (change.type === 'deleted') {
        detail = `删除${fieldName}信息`;
      } else if (change.type === 'updated') {
        detail = `更新${fieldName}信息`;
      }
    } else {
      if (change.type === 'added') {
        detail = `添加${fieldName}：${change.newValue}`;
      } else if (change.type === 'deleted') {
        detail = `删除${fieldName}：${change.oldValue}`;
      } else if (change.type === 'updated') {
        detail = `${fieldName}从 ${change.oldValue} 改为 ${change.newValue}`;
      }
    }

    return {
      type: change.type,
      field: fieldName,
      detail
    };
  });
};

context.wpm.export('utils_delivery_diff', {
  compareObjects,
  formatDiff
});
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_ai" title="智能助手">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn,
  ReactRouterDom
} = context;

const { Card, CardBody, Button } = NextUI;
const { useNavigate } = ReactRouterDom;
const AIChat = await context.wpm.import('comp_ai_chat');

const AIPage = observer(() => {
  const navigate = useNavigate();

  const handleShare = () => {
    navigate('/ai-standalone');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-88px)]">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">智能助手</h1>
            <p className="mt-1 text-small text-default-500">
              您的专业送货顾问，随时为您解答问题
            </p>
          </div>
          <Button
            color="primary"
            variant="flat"
            startContent={<Icon icon="solar:share-bold" />}
            onPress={handleShare}
          >
            独立窗口
          </Button>
        </div>
      </div>

      <Card className="flex-1">
        <CardBody className="p-0">
          <AIChat />
        </CardBody>
      </Card>
    </div>
  );
});

context.wpm.export('page_ai', AIPage);
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_ai_standalone" title="独立智能助手">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  ReactRouterDom,
  cn
} = context;

const { Card, CardBody, Button } = NextUI;
const { useNavigate } = ReactRouterDom;
const AIChat = await context.wpm.import('comp_ai_chat');

const AIStandalonePage = observer(() => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-default-50 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">智能助手</h1>
          <div className="w-[88px]"></div>
        </div>

        <Card className="h-[calc(100vh-120px)]">
          <CardBody>
            <AIChat />
          </CardBody>
        </Card>
      </div>
    </div>
  );
});

context.wpm.export('page_ai_standalone', AIStandalonePage);
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_delivery" title="送货单管理页面">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody, Spinner } = NextUI;
const deliveryStore = await context.wpm.import('store_delivery');
const DeliveryTable = await context.wpm.import('comp_delivery_table');

const DeliveryPage = observer(() => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const init = async () => {
      try {
        await deliveryStore.loadOrderIndexes();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[200px] items-center justify-center">
        <Spinner label="加载中..." />
      </div>
    );
  }

  const stats = deliveryStore.getStatistics();

  const handleFilterClick = (status) => {
    if (deliveryStore.filterStatus === status) {
      deliveryStore.clearFilter();
    } else {
      deliveryStore.setFilterStatus(status);
    }
  };

  const statusCards = [
    {
      key: null,
      title: "总订单数",
      value: stats.total,
      icon: "solar:document-bold-duotone",
      color: "primary"
    },
    {
      key: deliveryStore.constructor.OrderStatus.PENDING,
      title: "待处理",
      value: stats[deliveryStore.constructor.OrderStatus.PENDING],
      icon: deliveryStore.constructor.StatusIcon[deliveryStore.constructor.OrderStatus.PENDING],
      color: "warning"
    },
    {
      key: deliveryStore.constructor.OrderStatus.DELIVERING,
      title: "配送中",
      value: stats[deliveryStore.constructor.OrderStatus.DELIVERING],
      icon: deliveryStore.constructor.StatusIcon[deliveryStore.constructor.OrderStatus.DELIVERING],
      color: "primary"
    },
    {
      key: deliveryStore.constructor.OrderStatus.CUSTOMER_CONFIRMED,
      title: "客户已确认",
      value: stats[deliveryStore.constructor.OrderStatus.CUSTOMER_CONFIRMED],
      icon: deliveryStore.constructor.StatusIcon[deliveryStore.constructor.OrderStatus.CUSTOMER_CONFIRMED],
      color: "secondary"
    },
    {
      key: deliveryStore.constructor.OrderStatus.STAFF_CONFIRMED,
      title: "业务员已确认",
      value: stats[deliveryStore.constructor.OrderStatus.STAFF_CONFIRMED],
      icon: deliveryStore.constructor.StatusIcon[deliveryStore.constructor.OrderStatus.STAFF_CONFIRMED],
      color: "secondary"
    },
    {
      key: deliveryStore.constructor.OrderStatus.COMPLETED,
      title: "已完成",
      value: stats[deliveryStore.constructor.OrderStatus.COMPLETED],
      icon: deliveryStore.constructor.StatusIcon[deliveryStore.constructor.OrderStatus.COMPLETED],
      color: "success"
    },
    {
      key: deliveryStore.constructor.OrderStatus.CANCELLED,
      title: "已取消",
      value: stats[deliveryStore.constructor.OrderStatus.CANCELLED],
      icon: deliveryStore.constructor.StatusIcon[deliveryStore.constructor.OrderStatus.CANCELLED],
      color: "danger"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">送货单管理</h1>
        <p className="mt-1 text-small text-default-500">
          管理和跟踪酒类配送订单
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statusCards.map((card) => (
          <Card 
            key={card.key ?? 'total'}
            isPressable
            onPress={() => handleFilterClick(card.key)}
            className={cn(
              "cursor-pointer transition-colors",
              deliveryStore.filterStatus === card.key && "border-primary"
            )}
          >
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-small font-medium text-default-500">{card.title}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold">{card.value}</span>
                    <span className="text-small text-default-400">单</span>
                  </div>
                </div>
                <div className={cn("rounded-lg p-2", `bg-${card.color}/10`)}>
                  <Icon
                    className={cn(`text-${card.color}`)}
                    icon={card.icon}
                    width={24}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody>
          <DeliveryTable />
        </CardBody>
      </Card>
    </div>
  );
});

context.wpm.export('page_delivery', DeliveryPage);
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_delivery_share" title="送货单分享页面">
const {
  wpm,
  React,
  observer,
  NextUI,
  ReactRouterDom,
  Icon
} = context;

const { useParams, useSearchParams } = ReactRouterDom;
const { useDisclosure } = NextUI;
const deliveryStore = await context.wpm.import('store_delivery');
const userStore = await context.wpm.import('store_user');
const DeliveryForm = await context.wpm.import('comp_delivery_form');
const DeliveryDetailConfirmModal = await context.wpm.import('comp_delivery_detail_confirm_modal');
const DeliveryShareHeader = await context.wpm.import('comp_delivery_share_header');
const DeliveryShareLayout = await context.wpm.import('comp_delivery_share_layout');
const DeliveryShareContent = await context.wpm.import('comp_delivery_share_content');

const DeliverySharePage = observer(() => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState(null);
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onOpenChange: onConfirmOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  React.useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      try {
        const oid = searchParams.get('oid');
        if (!oid) {
          throw new Error('缺少组织ID参数');
        }
        await deliveryStore.loadOrderIndexes();
        const foundOrder = await deliveryStore.getOrderById(id);
        setOrder(foundOrder);
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id, searchParams]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      note: formData.get('note')
    };

    setConfirmLoading(true);
    try {
      const success = await deliveryStore.confirmDelivery(id, confirmType, data);
      if (success) {
        onConfirmOpenChange(false);
        const updatedOrder = await deliveryStore.getOrderById(id);
        setOrder(updatedOrder);
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const openConfirmModal = (type) => {
    setConfirmType(type);
    onConfirmOpen();
  };

  const handleEdit = () => {
    deliveryStore.setCurrentOrder(order);
    onEditOpen();
  };

  return (
    <DeliveryShareLayout loading={loading} error={!order}>
      {order && (
        <>
          <DeliveryShareHeader onEdit={handleEdit} />
          <DeliveryShareContent 
            order={order}
            onConfirm={openConfirmModal}
          />

          <DeliveryDetailConfirmModal
            isOpen={isConfirmOpen}
            onOpenChange={onConfirmOpenChange}
            type={confirmType}
            onConfirm={handleConfirm}
          />

          <DeliveryForm
            isOpen={isEditOpen}
            onOpenChange={onEditOpenChange}
            onSuccess={(updatedOrder) => {
              setOrder(updatedOrder);
            }}
          />
        </>
      )}
    </DeliveryShareLayout>
  );
});

context.wpm.export('page_delivery_share', DeliverySharePage);
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_report" title="报表页面">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody, Spinner, Button } = NextUI;
const ReportDashboard = await context.wpm.import('comp_report_dashboard');
const TrendCard = await context.wpm.import('comp_report_trend_card');
const reportStore = await context.wpm.import('store_report');

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Report page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[200px] items-center justify-center">
          <div className="text-center">
            <p className="text-danger mb-2">加载报表时出错</p>
            <Button
              color="primary"
              variant="light"
              onPress={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
            >
              重试
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ReportPage = observer(() => {
  const report = reportStore.getCurrentReport();

  return (
    <ErrorBoundary>
      <React.Suspense
        fallback={
          <div className="flex h-[200px] items-center justify-center">
            <Spinner label="加载报表中..." />
          </div>
        }
      >
        <div className="space-y-6">
          {report?.stats && (
            <dl className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <TrendCard
                title="总订单数"
                value={report.stats.total.toString()}
                change={`${report.stats.totalChange}%`}
                changeType={report.stats.totalChange > 0 ? "positive" : report.stats.totalChange < 0 ? "negative" : "neutral"}
                trendType={report.stats.totalChange > 0 ? "up" : report.stats.totalChange < 0 ? "down" : "neutral"}
                suffix="单"
              />
              <TrendCard
                title="总销售额"
                value={report.stats.totalAmount.toFixed(2)}
                change={`${report.stats.amountChange}%`}
                changeType={report.stats.amountChange > 0 ? "positive" : report.stats.amountChange < 0 ? "negative" : "neutral"}
                trendType={report.stats.amountChange > 0 ? "up" : report.stats.amountChange < 0 ? "down" : "neutral"}
                prefix="¥"
              />
              <TrendCard
                title="客单价"
                value={report.stats.averageAmount.toFixed(2)}
                change={`${report.stats.averageChange}%`}
                changeType={report.stats.averageChange > 0 ? "positive" : report.stats.averageChange < 0 ? "negative" : "neutral"}
                trendType={report.stats.averageChange > 0 ? "up" : report.stats.averageChange < 0 ? "down" : "neutral"}
                prefix="¥"
              />
              <TrendCard
                title="活跃客户"
                value={report.stats.activeCustomers.toString()}
                change={`${report.stats.customerChange}%`}
                changeType={report.stats.customerChange > 0 ? "positive" : report.stats.customerChange < 0 ? "negative" : "neutral"}
                trendType={report.stats.customerChange > 0 ? "up" : report.stats.customerChange < 0 ? "down" : "neutral"}
                suffix="位"
              />
            </dl>
          )}
          <ReportDashboard />
        </div>
      </React.Suspense>
    </ErrorBoundary>
  );
});

context.wpm.export('page_report', ReportPage);
</mo-ai-code>
```

```jsx
<mo-ai-code type="service" name="service_delivery_confirm" title="送货单确认服务">
const {
  wpm,
  message,
  api
} = context;

const ConfirmService = {
  async startDelivering(orderId) {
    try {
      const order = await this.loadOrderDetail(orderId);
      if (!order) {
        message.error('订单不存在');
        return false;
      }

      if (order.status !== this.constructor.OrderStatus.PENDING) {
        message.error('只有待处理的订单可以开始配送');
        return false;
      }

      order.status = this.constructor.OrderStatus.DELIVERING;
      const success = await this.saveDeliveryOrder(order);
      
      if (success) {
        message.success('已开始配送');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to start delivering:', error);
      message.error('操作失败');
      return false;
    }
  },

  async confirmDelivery(orderId, type, data) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        message.error('获取用户信息失败，无法确认');
        return false;
      }

      const order = await this.loadOrderDetail(orderId);
      if (!order) {
        message.error('订单不存在');
        return false;
      }

      const now = new Date().toISOString();
      const confirmation = {
        time: now,
        name: data.name,
        phone: data.phone,
        note: data.note || '',
        location: data.location || null,
        operator: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          time: now
        }
      };

      if (type === 'customer') {
        order.confirmations.customer = confirmation;
        order.status = this.constructor.OrderStatus.CUSTOMER_CONFIRMED;
      } else if (type === 'staff') {
        order.confirmations.staff = confirmation;
        order.status = this.constructor.OrderStatus.STAFF_CONFIRMED;
      }

      if (order.confirmations.customer && order.confirmations.staff) {
        order.status = this.constructor.OrderStatus.COMPLETED;
      }

      const success = await this.saveDeliveryOrder(order);
      if (success) {
        message.success('确认成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to confirm delivery:', error);
      message.error('确认失败');
      return false;
    }
  }
};

context.wpm.export('service_delivery_confirm', ConfirmService);
</mo-ai-code>
```

```jsx
<mo-ai-code type="service" name="service_delivery_order" title="送货单基础操作服务">
const {
  wpm,
  message,
  api,
  appId
} = context;

const OrderService = {
  async loadOrderIndexes() {
    this.isLoading = true;
    try {
      const result = await api.getMetadata([`${appId}_order_indexes`]);
      if (result.data?.[0]?.value) {
        this.orderIndexes = JSON.parse(result.data[0].value);
      }
    } catch (error) {
      console.error('Failed to load order indexes:', error);
      message.error('加载订单列表失败');
    } finally {
      this.isLoading = false;
    }
  },

  async loadOrderDetail(orderId) {
    if (this.orderDetails.has(orderId)) {
      return this.orderDetails.get(orderId);
    }

    try {
      const result = await api.getMetadata([`${appId}_order_${orderId}`]);
      if (result.data?.[0]?.value) {
        const detail = JSON.parse(result.data[0].value);
        this.orderDetails.set(orderId, detail);
        return detail;
      }
      return null;
    } catch (error) {
      console.error('Failed to load order detail:', error);
      message.error('加载订单详情失败');
      return null;
    }
  },

  async saveDeliveryOrder(order) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        message.error('获取用户信息失败，无法保存');
        return false;
      }

      const orderId = order.id || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const orderData = {
        ...order,
        id: orderId,
        createdAt: order.createdAt || now,
        updatedAt: now,
        operator: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          time: now
        },
        confirmations: order.confirmations || {
          customer: null,
          staff: null
        }
      };

      const indexData = {
        id: orderId,
        customerName: order.customerName,
        contactPerson: order.contactPerson,
        contactPhone: order.contactPhone,
        deliveryTime: order.deliveryTime,
        status: order.status,
        totalAmount: order.items.reduce((sum, item) => sum + item.amount, 0),
        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt,
        operator: orderData.operator
      };

      await api.setMetadata(`${appId}_order_${orderId}`, JSON.stringify(orderData));

      if (order.id) {
        const index = this.orderIndexes.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orderIndexes[index] = indexData;
        }
      } else {
        this.orderIndexes.unshift(indexData);
      }

      await api.setMetadata(`${appId}_order_indexes`, JSON.stringify(this.orderIndexes));
      
      this.orderDetails.set(orderId, orderData);
      this.clearProductStatsCache();
      
      message.success('保存成功');
      return true;
    } catch (error) {
      console.error('Failed to save delivery order:', error);
      message.error('保存失败');
      return false;
    }
  },

  async deleteDeliveryOrder(id) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        message.error('获取用户信息失败，无法删除');
        return false;
      }

      await api.setMetadata(`${appId}_order_${id}`, null);
      this.orderIndexes = this.orderIndexes.filter(order => order.id !== id);
      await api.setMetadata(`${appId}_order_indexes`, JSON.stringify(this.orderIndexes));
      this.orderDetails.delete(id);
      this.clearProductStatsCache();
      message.success('删除成功');
      return true;
    } catch (error) {
      console.error('Failed to delete delivery order:', error);
      message.error('删除失败');
      return false;
    }
  },

  async setCurrentOrder(orderIndex) {
    const detail = await this.loadOrderDetail(orderIndex.id);
    this.currentOrder = detail;
  },

  clearCurrentOrder() {
    this.currentOrder = null;
  },

  async getOrderById(id) {
    return await this.loadOrderDetail(id);
  }
};

context.wpm.export('service_delivery_order', OrderService);
</mo-ai-code>
```

```jsx
<mo-ai-code type="service" name="service_delivery_statistics" title="送货单统计服务">
const {
  wpm
} = context;

const StatisticsService = {
  getStatistics() {
    const stats = {};
    Object.values(this.constructor.OrderStatus).forEach(status => {
      stats[status] = this.orderIndexes.filter(o => o.status === status).length;
    });
    stats.total = this.orderIndexes.length;
    return stats;
  },

  getCustomerStatistics() {
    const customerMap = new Map();
    
    this.orderIndexes.forEach(order => {
      const customer = customerMap.get(order.customerName) || {
        name: order.customerName,
        orderCount: 0,
        totalAmount: 0
      };
      
      customer.orderCount++;
      customer.totalAmount += order.totalAmount;
      
      customerMap.set(order.customerName, customer);
    });

    return Array.from(customerMap.values());
  },

  async getProductStatistics() {
    if (
      this.productStatsCache &&
      this.productStatsCacheTime &&
      Date.now() - this.productStatsCacheTime < this.CACHE_DURATION
    ) {
      return this.productStatsCache;
    }

    const productMap = new Map();
    
    try {
      for (const index of this.orderIndexes) {
        const detail = await this.loadOrderDetail(index.id);
        if (detail) {
          detail.items.forEach(item => {
            const product = productMap.get(item.name) || {
              name: item.name,
              quantity: 0,
              amount: 0
            };
            
            product.quantity += item.quantity;
            product.amount += item.amount;
            
            productMap.set(item.name, product);
          });
        }
      }

      const stats = Array.from(productMap.values());
      this.productStatsCache = stats;
      this.productStatsCacheTime = Date.now();
      return stats;
    } catch (error) {
      console.error('Failed to get product statistics:', error);
      return [];
    }
  },

  clearProductStatsCache() {
    this.productStatsCache = null;
    this.productStatsCacheTime = null;
  }
};

context.wpm.export('service_delivery_statistics', StatisticsService);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_delivery" title="送货单数据管理">
const {
  wpm,
  mobx,
  api
} = context;

const { makeAutoObservable } = mobx;

const OrderService = await context.wpm.import('service_delivery_order');
const ConfirmService = await context.wpm.import('service_delivery_confirm');
const StatisticsService = await context.wpm.import('service_delivery_statistics');

class DeliveryStore {
  orderIndexes = [];
  orderDetails = new Map();
  currentOrder = null;
  isLoading = false;
  productStatsCache = null;
  productStatsCacheTime = null;
  CACHE_DURATION = 5 * 60 * 1000;
  filterStatus = null;
  currentUser = null;

  constructor() {
    makeAutoObservable(this);

    // 绑定服务方法
    Object.assign(this, {
      ...Object.keys(OrderService).reduce((acc, key) => {
        acc[key] = OrderService[key].bind(this);
        return acc;
      }, {}),
      ...Object.keys(ConfirmService).reduce((acc, key) => {
        acc[key] = ConfirmService[key].bind(this);
        return acc;
      }, {}),
      ...Object.keys(StatisticsService).reduce((acc, key) => {
        acc[key] = StatisticsService[key].bind(this);
        return acc;
      }, {})
    });
  }

  // 统一的状态定义
  static OrderStatus = {
    PENDING: 'pending',                // 待处理
    DELIVERING: 'delivering',          // 配送中
    CUSTOMER_CONFIRMED: 'customer_confirmed',  // 客户已确认
    STAFF_CONFIRMED: 'staff_confirmed',        // 业务员已确认
    COMPLETED: 'completed',            // 已完成
    CANCELLED: 'cancelled'             // 已取消
  }

  // 状态显示文本
  static StatusText = {
    [DeliveryStore.OrderStatus.PENDING]: '待处理',
    [DeliveryStore.OrderStatus.DELIVERING]: '配送中',
    [DeliveryStore.OrderStatus.CUSTOMER_CONFIRMED]: '客户已确认',
    [DeliveryStore.OrderStatus.STAFF_CONFIRMED]: '业务员已确认',
    [DeliveryStore.OrderStatus.COMPLETED]: '已完成',
    [DeliveryStore.OrderStatus.CANCELLED]: '已取消'
  }

  // 状态颜色
  static StatusColor = {
    [DeliveryStore.OrderStatus.PENDING]: 'warning',
    [DeliveryStore.OrderStatus.DELIVERING]: 'primary',
    [DeliveryStore.OrderStatus.CUSTOMER_CONFIRMED]: 'secondary',
    [DeliveryStore.OrderStatus.STAFF_CONFIRMED]: 'secondary',
    [DeliveryStore.OrderStatus.COMPLETED]: 'success',
    [DeliveryStore.OrderStatus.CANCELLED]: 'danger'
  }

  // 状态图标
  static StatusIcon = {
    [DeliveryStore.OrderStatus.PENDING]: 'solar:clock-circle-bold',
    [DeliveryStore.OrderStatus.DELIVERING]: 'solar:delivery-bold',
    [DeliveryStore.OrderStatus.CUSTOMER_CONFIRMED]: 'solar:user-check-bold',
    [DeliveryStore.OrderStatus.STAFF_CONFIRMED]: 'solar:shield-check-bold',
    [DeliveryStore.OrderStatus.COMPLETED]: 'solar:check-circle-bold',
    [DeliveryStore.OrderStatus.CANCELLED]: 'solar:close-circle-bold'
  }

  async getCurrentUser() {
    if (!this.currentUser) {
      try {
        const userInfo = await api.getCurrentAccountInfo();
        this.currentUser = {
          id: userInfo.id,
          name: userInfo.name,
          role: userInfo.role
        };
      } catch (error) {
        console.error('Failed to get current user:', error);
        message.error('获取用户信息失败');
        return null;
      }
    }
    return this.currentUser;
  }

  setFilterStatus(status) {
    this.filterStatus = status;
  }

  clearFilter() {
    this.filterStatus = null;
  }

  get deliveryOrders() {
    if (!this.filterStatus) {
      return this.orderIndexes;
    }
    return this.orderIndexes.filter(order => order.status === this.filterStatus);
  }
}

const store = new DeliveryStore();
context.wpm.export('store_delivery', store);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_report" title="报表数据管理">
const {
  wpm,
  mobx,
  message
} = context;

const { makeAutoObservable } = mobx;
const deliveryStore = await context.wpm.import('store_delivery');

class ReportStore {
  currentDimension = 'customer';
  dateRange = {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  };
  reportCache = {
    customer: {
      stats: {
        total: 0,
        totalAmount: 0,
        averageAmount: 0,
        activeCustomers: 0,
        totalChange: "0.0",
        amountChange: "0.0",
        averageChange: "0.0",
        customerChange: "0.0"
      },
      orderRanking: [],
      amountRanking: [],
      averageOrderAmount: [],
      chartData: null
    },
    product: null
  };
  chartPeriod = '30-days';

  constructor() {
    makeAutoObservable(this);
  }

  setDimension(dimension) {
    this.currentDimension = dimension;
    this.generateReport();
  }

  setDateRange(start, end) {
    this.dateRange = { start, end };
    this.generateReport();
  }

  setChartPeriod(period) {
    this.chartPeriod = period;
    this.generateReport();
  }

  calculateTrends(currentStats, previousStats) {
    return {
      totalChange: previousStats.total ? 
        ((currentStats.total - previousStats.total) / previousStats.total * 100).toFixed(1) : 
        "0.0",
      amountChange: previousStats.totalAmount ? 
        ((currentStats.totalAmount - previousStats.totalAmount) / previousStats.totalAmount * 100).toFixed(1) : 
        "0.0",
      averageChange: previousStats.averageAmount ? 
        ((currentStats.averageAmount - previousStats.averageAmount) / previousStats.averageAmount * 100).toFixed(1) : 
        "0.0",
      customerChange: previousStats.activeCustomers ? 
        ((currentStats.activeCustomers - previousStats.activeCustomers) / previousStats.activeCustomers * 100).toFixed(1) : 
        "0.0"
    };
  }

  async generateReport() {
    if (this.currentDimension === 'customer') {
      this.reportCache.customer = await this.generateCustomerReport();
    } else {
      this.reportCache.product = await this.generateProductReport();
    }
  }

  async generateCustomerReport() {
    try {
      const customerStats = deliveryStore.getCustomerStatistics();
      const orderRanking = [...customerStats].sort((a, b) => b.orderCount - a.orderCount);
      const amountRanking = [...customerStats].sort((a, b) => b.totalAmount - a.totalAmount);
      const averageOrderAmount = customerStats.map(customer => ({
        name: customer.name,
        average: customer.totalAmount / customer.orderCount
      }));

      // 计算当前统计数据
      const currentStats = {
        total: deliveryStore.deliveryOrders.length,
        totalAmount: deliveryStore.deliveryOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        averageAmount: deliveryStore.deliveryOrders.length ? 
          deliveryStore.deliveryOrders.reduce((sum, order) => sum + order.totalAmount, 0) / deliveryStore.deliveryOrders.length : 
          0,
        activeCustomers: new Set(deliveryStore.deliveryOrders.map(order => order.customerName)).size
      };

      // 获取上一期数据进行对比
      const previousPeriod = this.getPreviousPeriod();
      const previousStats = this.calculatePreviousStats(previousPeriod);
      
      // 计算变化趋势
      const trends = this.calculateTrends(currentStats, previousStats);

      const stats = {
        ...currentStats,
        ...trends
      };

      const chartData = {
        orderTrend: this.generateTrendData(orderRanking.slice(0, 5).map(c => ({
          name: c.name,
          value: c.orderCount
        }))),
        amountTrend: this.generateTrendData(amountRanking.slice(0, 5).map(c => ({
          name: c.name,
          value: c.totalAmount
        })))
      };

      return {
        stats,
        orderRanking: orderRanking.slice(0, 10),
        amountRanking: amountRanking.slice(0, 10),
        averageOrderAmount,
        chartData
      };
    } catch (error) {
      console.error('Failed to generate customer report:', error);
      message.error('生成客户报表失败');
      return this.reportCache.customer;
    }
  }

  getPreviousPeriod() {
    const currentStart = new Date(this.dateRange.start);
    const currentEnd = new Date(this.dateRange.end);
    const duration = currentEnd.getTime() - currentStart.getTime();
    
    const previousStart = new Date(currentStart.getTime() - duration);
    const previousEnd = new Date(currentEnd.getTime() - duration);
    
    return {
      start: previousStart.toISOString().split('T')[0],
      end: previousEnd.toISOString().split('T')[0]
    };
  }

  calculatePreviousStats(period) {
    const previousOrders = deliveryStore.deliveryOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= new Date(period.start) && orderDate <= new Date(period.end);
    });

    return {
      total: previousOrders.length,
      totalAmount: previousOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      averageAmount: previousOrders.length ? 
        previousOrders.reduce((sum, order) => sum + order.totalAmount, 0) / previousOrders.length : 
        0,
      activeCustomers: new Set(previousOrders.map(order => order.customerName)).size
    };
  }

  async generateProductReport() {
    try {
      const productStats = await deliveryStore.getProductStatistics() || [];
      if (!Array.isArray(productStats)) {
        message.error('获取商品统计数据失败');
        return null;
      }

      const quantityRanking = [...productStats].sort((a, b) => b.quantity - a.quantity);
      const amountRanking = [...productStats].sort((a, b) => b.amount - a.amount);
      const averagePrice = productStats.map(product => ({
        name: product.name,
        average: product.amount / product.quantity
      }));

      const chartData = {
        quantityTrend: this.generateTrendData(quantityRanking.slice(0, 5).map(p => ({
          name: p.name,
          value: p.quantity
        }))),
        amountTrend: this.generateTrendData(amountRanking.slice(0, 5).map(p => ({
          name: p.name,
          value: p.amount
        })))
      };

      return {
        quantityRanking: quantityRanking.slice(0, 10),
        amountRanking: amountRanking.slice(0, 10),
        averagePrice,
        chartData
      };
    } catch (error) {
      console.error('Failed to generate product report:', error);
      message.error('生成商品报表失败');
      return null;
    }
  }

  generateTrendData(items) {
    const periods = {
      '7-days': 7,
      '30-days': 30,
      '3-months': 90,
      '6-months': 180
    };

    const days = periods[this.chartPeriod] || 30;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        ...items.reduce((acc, item) => {
          acc[item.name] = Math.round(item.value * (0.8 + Math.random() * 0.4));
          return acc;
        }, {})
      });
    }

    return data;
  }

  getCurrentReport() {
    return this.reportCache[this.currentDimension];
  }

  refreshReport() {
    this.reportCache = {
      customer: {
        stats: {
          total: 0,
          totalAmount: 0,
          averageAmount: 0,
          activeCustomers: 0,
          totalChange: "0.0",
          amountChange: "0.0",
          averageChange: "0.0",
          customerChange: "0.0"
        },
        orderRanking: [],
        amountRanking: [],
        averageOrderAmount: [],
        chartData: null
      },
      product: null
    };
    this.generateReport();
  }
}

const store = new ReportStore();
context.wpm.export('store_report', store);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_user" title="用户信息管理">
const {
  wpm,
  mobx,
  message,
  api
} = context;

const { makeAutoObservable } = mobx;

class UserStore {
  userInfo = null;
  enterpriseInfo = null;
  isLoading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadUserInfo() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.error = null;
    
    try {
      const [userInfo, enterpriseInfo] = await Promise.all([
        api.getCurrentAccountInfo(),
        api.queryCurrentEnterPrise()
      ]);
      
      this.userInfo = userInfo;
      this.enterpriseInfo = enterpriseInfo;
    } catch (error) {
      console.error('Failed to load user info:', error);
      this.error = error;
      message.error('获取用户信息失败');
    } finally {
      this.isLoading = false;
    }
  }

  get organizationId() {
    return this.enterpriseInfo?.organizationId;
  }

  get isAuthenticated() {
    return !!this.userInfo;
  }

  clearUserInfo() {
    this.userInfo = null;
    this.enterpriseInfo = null;
    this.error = null;
  }
}

const store = new UserStore();
context.wpm.export('store_user', store);
</mo-ai-code>
```

