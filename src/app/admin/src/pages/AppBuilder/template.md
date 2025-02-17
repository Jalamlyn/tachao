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

const { Routes, Route, Navigate, useNavigate, useLocation } = ReactRouterDom;
const { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Image } = NextUI;

// 导入页面组件
const ChatPage = await context.wpm.import('page_chat');
const KnowledgePage = await context.wpm.import('page_knowledge');
const UserInfo = await context.wpm.import('comp_user_info');
const UserProfile = await context.wpm.import('page_user_profile');
const OperationLogPage = await context.wpm.import('page_operation_log');

api.log.info('应用初始化', {
  appId,
  availableModules: ['page_chat', 'page_knowledge', 'page_user_profile', 'page_operation_log']
});

const App = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <NextUI.NextUIProvider navigate={navigate}>
      <div className="min-h-screen bg-background font-sans">
        <Navbar
          className="bg-background/70 backdrop-blur-md border-b border-default-200"
          classNames={{
            wrapper: "px-6 max-w-full",
            item: [
              "flex",
              "relative",
              "h-full",
              "items-center",
              "data-[active=true]:after:content-['']",
              "data-[active=true]:after:absolute",
              "data-[active=true]:after:bottom-0",
              "data-[active=true]:after:left-0",
              "data-[active=true]:after:right-0",
              "data-[active=true]:after:h-[2px]",
              "data-[active=true]:after:rounded-[2px]",
              "data-[active=true]:after:bg-primary",
              "transition-all",
              "duration-200",
              "ease-in-out"
            ]
          }}
        >
          <NavbarBrand>
            <Image
              src="https://6d6f-mobenai-weapp-dev-2e8qhi3a963364-1259692580.tcb.qcloud.la/uploads/1739537211575-n3owu3.png"
              alt="AI助手"
              className="w-8 h-8"
            />
            <p className="font-bold text-inherit ml-2 text-lg">DeepSeek 企业版</p>
          </NavbarBrand>
          <NavbarContent className="hidden sm:flex gap-6" justify="center">
            <NavbarItem isActive={location.pathname === '/chat'}>
              <Link
                color={location.pathname === '/chat' ? "primary" : "foreground"}
                href="/chat"
                className="w-full font-medium"
                size="lg"
              >
                智能对话
              </Link>
            </NavbarItem>
            <NavbarItem isActive={location.pathname === '/knowledge'}>
              <Link
                color={location.pathname === '/knowledge' ? "primary" : "foreground"}
                href="/knowledge"
                className="w-full font-medium"
                size="lg"
              >
                知识库
              </Link>
            </NavbarItem>
          </NavbarContent>
          <NavbarContent justify="end">
            <NavbarItem>
              <UserInfo />
            </NavbarItem>
          </NavbarContent>
        </Navbar>

        <main className="px-6 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/chat" replace />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/logs" element={<OperationLogPage />} />
          </Routes>
        </main>
      </div>
    </NextUI.NextUIProvider>
  );
});

context.wpm.export(appId, App);
App.displayName = 'App';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_chat_history" title="对话历史记录组件">
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

const { Card, CardBody, Button, Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } = NextUI;
const { motion, AnimatePresence } = FramerMotion;

const chatHistoryStore = await context.wpm.import('store_chat_history');
const chatStore = await context.wpm.import('store_chat');

const ChatHistory = observer(() => {
  const [deleteId, setDeleteId] = React.useState(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSelect = async (history: ChatHistory) => {
    try {
      api.log.info('选择历史对话', {
        historyId: history.id
      });

      // 如果当前有对话，先保存
      if (chatStore.messages.length > 0) {
        await chatStore.clearMessages();
      }

      // 加载历史对话
      chatStore.messages = history.messages;
      chatHistoryStore.setSelectedId(history.id);

      api.log.info('历史对话加载成功', {
        historyId: history.id,
        messageCount: history.messages.length
      });
    } catch (error) {
      api.log.error('加载历史对话失败', {
        historyId: history.id,
        error: error.message
      });
      message.error('加载失败');
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    setDeleteId(id);
    onOpen();
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleteLoading(true);
      api.log.info('开始删除对话历史', { deleteId });

      await chatHistoryStore.deleteHistory(deleteId);

      if (chatHistoryStore.selectedId === deleteId) {
        await chatStore.clearMessages();
      }

      message.success('删除成功');
      onClose();

      api.log.info('对话历史删除成功', { deleteId });
    } catch (error) {
      api.log.error('删除对话历史失败', {
        deleteId,
        error: error.message
      });
      message.error('删除失败');
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  if (chatHistoryStore.loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner size="sm" color="primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2 p-2">
        <AnimatePresence mode="popLayout">
          {chatHistoryStore.histories.map((history) => (
            <motion.div
              key={history.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card
                isPressable
                isHoverable
                className={cn(
                  "border-1",
                  chatHistoryStore.selectedId === history.id
                    ? "border-primary"
                    : "border-default-200"
                )}
                onPress={() => handleSelect(history)}
              >
                <CardBody className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-small font-medium truncate">
                        {history.title}
                      </h3>
                      <p className="text-tiny text-default-500">
                        {new Date(history.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onPress={(e) => handleDeleteClick(history.id, e)}
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {chatHistoryStore.histories.length === 0 && (
          <div className="text-center text-default-500 py-4">
            暂无历史对话
          </div>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        placement="center"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">确认删除</ModalHeader>
          <ModalBody>
            <p>确定要删除这条对话历史吗？此操作不可恢复。</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onClose}
              isDisabled={deleteLoading}
            >
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleDelete}
              isLoading={deleteLoading}
            >
              删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

context.wpm.export('comp_chat_history', ChatHistory);
ChatHistory.displayName = 'ChatHistory';
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

const { Input, Button, Switch, Card, CardBody, Tooltip, Chip } = NextUI;
const { motion, AnimatePresence } = FramerMotion;

const inputClassifierService = await context.wpm.import('service_input_classifier');

const ChatInput = observer(({ onSend, loading }) => {
  const [content, setContent] = React.useState('');
  const [webSearchEnabled, setWebSearchEnabled] = React.useState(inputClassifierService.isWebSearchEnabled());

  const handleSend = () => {
    if (!content.trim()) return;
    onSend(content);
    setContent('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleWebSearchToggle = (enabled) => {
    setWebSearchEnabled(enabled);
    inputClassifierService.setWebSearchEnabled(enabled);
    api.log.info('切换网络搜索状态', { enabled });
    message.success(enabled ? '已开启网络搜索' : '已关闭网络搜索');
  };

  return (
    <div className="space-y-4">
      <Card className="bg-default-50 border-none">
        <CardBody className="py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon
                icon="solar:globe-bold"
                className={cn(
                  "w-5 h-5 transition-colors duration-200",
                  webSearchEnabled ? "text-primary" : "text-default-400"
                )}
              />
              <div className="flex flex-col">
                <span className="text-sm font-medium">网络搜索</span>
                <span className="text-xs text-default-400">
                  {webSearchEnabled ? '已开启实时网络搜索' : '仅使用知识库回答'}
                </span>
              </div>
            </div>
            <Tooltip
              content={webSearchEnabled ? "关闭网络搜索" : "开启网络搜索"}
              placement="top"
            >
              <Switch
                size="sm"
                isSelected={webSearchEnabled}
                onValueChange={handleWebSearchToggle}
                classNames={{
                  wrapper: cn(
                    "group-data-[selected=true]:bg-primary",
                    "transition-colors duration-200"
                  ),
                  thumb: cn(
                    webSearchEnabled && "group-data-[selected=true]:ml-6",
                    "group-data-[pressed=true]:w-7",
                    "group-data-[selected=true]:group-data-[pressed=true]:ml-4",
                    "transition-all duration-200"
                  )
                }}
              />
            </Tooltip>
          </div>
        </CardBody>
      </Card>

      <div className="flex gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入问题，按Enter发送..."
          size="lg"
          radius="lg"
          classNames={{
            input: "text-base",
            inputWrapper: [
              "shadow-sm",
              "bg-default-100",
              "hover:bg-default-200",
              "group-data-[focused=true]:bg-default-100",
              "!duration-150",
              "transition-background"
            ]
          }}
          endContent={
            <Button
              isIconOnly
              color="primary"
              size="sm"
              isLoading={loading}
              onClick={handleSend}
              className="mr-1"
            >
              <Icon icon="solar:arrow-up-linear" className="w-4 h-4" />
            </Button>
          }
        />
      </div>
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

const { Card, CardBody, Avatar, Accordion, AccordionItem } = NextUI;
const { motion } = FramerMotion;

const MessageCard = await context.wpm.import('comp_message_card');
const KnowledgeSearchResult = await context.wpm.import('comp_knowledge_search_result');
const WebSearchResult = await context.wpm.import('comp_web_search_result');

const aiImage = 'https://6d6f-mobenai-weapp-dev-2e8qhi3a963364-1259692580.tcb.qcloud.la/uploads/1739662922563-2jaf8j.png?sign=432955dfab186ac8c5292360e457067f&t=1739672714';
const userImage = 'https://6d6f-mobenai-weapp-dev-2e8qhi3a963364-1259692580.tcb.qcloud.la/uploads/1739663772505-ssijn3.png?sign=efdf285487577911f338f45b0034c19e&t=1739672767';

const ChatMessage = observer(({ message, isAi }) => {
  const [showSources, setShowSources] = React.useState(false);

  const hasSearchResults = message.searchResult || message.webSearchResult;

  return (
    <div className={cn("flex gap-4 mb-6", {
      "flex-row-reverse": !isAi
    })}>
      <div className="flex-shrink-0">
        {isAi ? (
          <Avatar
            src={aiImage}
            size="sm"
            isBordered
            color="primary"
            className="w-10 h-10 ml-2"
          />
        ) : (
          <Avatar
            src={userImage}
            size="sm"
            className="w-10 h-10"
          />
        )}
      </div>

      <div className={cn("flex flex-col max-w-[80%]", {
        "items-end": !isAi
      })}>
        <Card className={cn("border-none", {
          "bg-primary text-white": !isAi,
          "bg-default-50": isAi
        })}>
          <CardBody className="py-3 px-4">
            {!isAi ? (
              <div className="text-sm whitespace-pre-wrap">
                {message.content}
              </div>
            ) : (
              <div className="space-y-2">
                {message.cards.map((card, index) => (
                  <MessageCard
                    key={card.id}
                    card={card}
                    isLast={index === message.cards.length - 1}
                  />
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {hasSearchResults && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="w-full mt-2"
          >
            <Accordion>
              <AccordionItem
                key="sources"
                aria-label="参考来源"
                title={
                  <div className="flex items-center gap-2 text-sm">
                    <Icon icon="solar:document-text-linear" className="w-4 h-4 text-default-400" />
                    <span>参考来源</span>
                  </div>
                }
              >
                <div className="space-y-2">
                  {message.searchResult && (
                    <KnowledgeSearchResult searchResult={message.searchResult} />
                  )}
                  {message.webSearchResult && (
                    <WebSearchResult searchResult={message.webSearchResult} />
                  )}
                </div>
              </AccordionItem>
            </Accordion>
          </motion.div>
        )}

        {message.error && (
          <div className="mt-2 flex items-center gap-2">
            <Icon
              icon="solar:danger-triangle-bold"
              className="w-4 h-4 text-danger"
            />
            <span className="text-danger text-sm">{message.errorMessage}</span>
          </div>
        )}

        <div className="mt-2 text-xs text-default-400">
          <time>{new Date(message.timestamp).toLocaleString()}</time>
        </div>
      </div>
    </div>
  );
});

context.wpm.export('comp_chat_message', ChatMessage);
ChatMessage.displayName = 'ChatMessage';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_chat_toolbar" title="对话工具栏组件">
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

const { Button, Divider } = NextUI;
const { motion } = FramerMotion;

const chatStore = await context.wpm.import('store_chat');
const ChatHistory = await context.wpm.import('comp_chat_history');

const ChatToolbar = observer(() => {
  const [expanded, setExpanded] = React.useState(false);

  const handleNewChat = async () => {
    try {
      api.log.info('点击开启新对话按钮');
      await chatStore.clearMessages();
      api.log.info('新对话开启成功');
    } catch (error) {
      api.log.error('开启新对话失败', {
        error: error.message
      });
      message.error('开启新对话失败');
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{
        width: expanded ? 180 : 48,
        transition: { duration: 0.2 }
      }}
      className="h-full bg-content1 border-r border-divider mr-2 relative"
    >
      <div className="h-full flex flex-col">
        <div className="p-2 flex items-center justify-between">
          {expanded ? (
            <Button
              fullWidth
              color="primary"
              startContent={<Icon icon="solar:restart-bold" className="w-4 h-4" />}
              onPress={handleNewChat}
            >
              开启新对话
            </Button>
          ) : (
            <Button
              isIconOnly
              color="primary"
              size="sm"
              onPress={handleNewChat}
              className="w-full"
            >
              <Icon icon="solar:restart-bold" className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="px-2">
          <Button
            isIconOnly
            variant="light"
            size="sm"
            className="w-full mb-2"
            onClick={() => setExpanded(!expanded)}
          >
            <Icon
              icon={expanded ? "solar:double-alt-arrow-left-bold" : "solar:double-alt-arrow-right-bold"}
              className="w-4 h-4"
            />
          </Button>
        </div>

        {expanded && (
          <>
            <Divider/>
            <div className="flex-1 overflow-y-auto">
              <ChatHistory />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
});

context.wpm.export('comp_chat_toolbar', ChatToolbar);
ChatToolbar.displayName = 'ChatToolbar';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_image_uploader" title="图片上传组件">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
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

const { Card, CardBody, Button, Progress, Modal, Image } = NextUI;
const { motion } = FramerMotion;

const ImageUploader = observer(({ images = [], onUpload, onRemove, onReorder, maxImages = 10 }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [uploadStatus, setUploadStatus] = React.useState(null);
  const [previewImage, setPreviewImage] = React.useState(null);
  const fileInputRef = React.useRef(null);
  const [draggedIndex, setDraggedIndex] = React.useState(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files) => {
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      message.error(`最多只能上传 ${maxImages} 张图片`);
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);

    for (const file of filesToUpload) {
      try {
        setUploadStatus({
          fileName: file.name,
          progress: 0
        });

        const result = await api.upload.uploadFile(file, {
          uploadType: 'image',
          maxSize: 5 * 1024 * 1024,
          cropOptions: { quality: 0.8 },
          onProgress: (percent) => {
            setUploadStatus(prev => ({
              ...prev,
              progress: percent
            }));
          }
        });

        onUpload(result.fileUrl);

        api.log.info('图片上传成功', {
          fileName: file.name,
          fileUrl: result.fileUrl,
          fileSize: file.size
        });

      } catch (error) {
        api.log.error('图片上传失败', {
          fileName: file.name,
          error: error.message
        });
        message.error(`上传失败: ${error.message}`);
      } finally {
        setUploadStatus(null);
      }
    }
  };

  const handleImageDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleImageDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleImageDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    onReorder?.(newImages);
    setDraggedIndex(index);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((url, index) => (
          <motion.div
            key={url}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={cn(
              "relative group",
              draggedIndex === index && "opacity-50"
            )}
            draggable
            onDragStart={() => handleImageDragStart(index)}
            onDragEnd={handleImageDragEnd}
            onDragOver={(e) => handleImageDragOver(e, index)}
          >
            <Card
              isPressable
              onPress={() => setPreviewImage(url)}
              className="overflow-hidden aspect-square"
            >
              <Image
                src={url}
                alt={`图片 ${index + 1}`}
                classNames={{
                  img: "object-cover w-full h-full transition-transform group-hover:scale-110"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
            <Button
              isIconOnly
              color="danger"
              variant="flat"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onPress={() => onRemove(index)}
            >
              <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
            </Button>
          </motion.div>
        ))}

        {images.length < maxImages && (
          <Card
            isPressable
            className={cn(
              "border-2 border-dashed transition-colors aspect-square",
              isDragging ? "border-primary" : "border-default-200"
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardBody className="flex items-center justify-center">
              <div className="text-center">
                <Icon
                  icon="solar:gallery-add-bold"
                  className={cn(
                    "w-8 h-8 mx-auto mb-2 transition-colors",
                    isDragging ? "text-primary" : "text-default-400"
                  )}
                />
                <p className="text-small text-default-500">
                  点击或拖拽上传
                </p>
                <p className="text-tiny text-default-400">
                  还可以上传 {maxImages - images.length} 张
                </p>
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(Array.from(e.target.files || []))}
      />

      {uploadStatus && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon icon="solar:file-bold" className="w-4 h-4 text-default-500" />
            <span className="text-small">{uploadStatus.fileName}</span>
          </div>
          <Progress
            size="sm"
            value={uploadStatus.progress}
            color="primary"
            className="max-w-md"
          />
        </div>
      )}

      <p className="text-small text-default-500">
        支持 jpg、png 格式，单张图片不超过 5MB，最多上传 {maxImages} 张
      </p>

      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        size="3xl"
      >
        <Modal.Body className="p-0">
          {previewImage && (
            <Image
              src={previewImage}
              alt="预览图片"
              className="w-full h-auto"
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
});

context.wpm.export('comp_image_uploader', ImageUploader);
ImageUploader.displayName = 'ImageUploader';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_knowledge_detail" title="知识块详情组件">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
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

const { Card, CardBody, Image, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } = NextUI;
const { motion } = FramerMotion;

const KnowledgeDetail = observer(({ block, loading }) => {
  const [previewImage, setPreviewImage] = React.useState(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner label="加载中..." color="primary" />
      </div>
    );
  }

  if (!block) {
    api.log.warn('KnowledgeDetail: block prop is null');
    return (
      <div className="p-8 text-center text-default-500">
        未找到知识块详情
      </div>
    );
  }

  api.log.info('渲染知识块详情', {
    blockId: block.id,
    title: block.title,
    type: block.type
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold">{block.title}</h2>
        <p className="text-default-500 mt-1">{block.description}</p>
      </div>

      <div className="space-y-6">
        {block.type === 'document' ? (
          <div className="prose prose-sm max-w-none">
            {block.content}
          </div>
        ) : (
          <Card
            isPressable
            className="overflow-hidden"
            onPress={() => setPreviewImage(block.imageUrl)}
          >
            <Image
              src={block.imageUrl}
              alt={block.title}
              className="w-full h-auto object-cover"
            />
          </Card>
        )}

        <div className="flex items-center gap-4 pt-4 border-t">
          <Chip
            variant="flat"
            size="sm"
            startContent={<Icon icon="solar:calendar-bold" className="w-3 h-3" />}
          >
            创建于 {new Date(block.createdAt).toLocaleDateString()}
          </Chip>
          <Chip
            variant="flat"
            size="sm"
            startContent={<Icon icon="solar:clock-circle-bold" className="w-3 h-3" />}
          >
            更新于 {new Date(block.updatedAt).toLocaleDateString()}
          </Chip>
          <Chip
            variant="flat"
            size="sm"
            color={block.type === 'document' ? 'primary' : 'secondary'}
            startContent={
              <Icon
                icon={block.type === 'document' ? 'solar:document-bold' : 'solar:gallery-bold'}
                className="w-3 h-3"
              />
            }
          >
            {block.type === 'document' ? '文档' : '图片'}
          </Chip>
        </div>
      </div>

      <Modal
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        size="3xl"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            图片预览
          </ModalHeader>
          <ModalBody className="p-0">
            {previewImage && (
              <Image
                src={previewImage}
                alt="预览图片"
                className="w-full h-auto"
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              variant="light"
              onPress={() => setPreviewImage(null)}
            >
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

context.wpm.export('comp_knowledge_detail', KnowledgeDetail);
KnowledgeDetail.displayName = 'KnowledgeDetail';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_knowledge_editor" title="知识编辑器组件">
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

const { Card, CardBody, Input, Button, Textarea, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, RadioGroup, Radio, Chip, Progress } = NextUI;
const { motion } = FramerMotion;

const knowledgeStore = await context.wpm.import('store_knowledge');
const ImageUploader = await context.wpm.import('comp_image_uploader');
const excelParserService = await context.wpm.import('service_excel_parser');

const KnowledgeEditor = observer(({ block, onSave, onCancel }) => {
  const [state, setState] = React.useState({
    type: block?.type || 'document',
    title: block?.title || '',
    description: block?.description || '',
    content: block?.content || '',
    imageUrl: block?.imageUrl || '',
    dirty: false
  });

  const [fileUploading, setFileUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [generatingDescription, setGeneratingDescription] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const excelInputRef = React.useRef(null);

  const handleChange = (field, value) => {
    setState(prev => ({
      ...prev,
      [field]: value,
      dirty: true
    }));
  };

  const handleGenerateDescription = async () => {
    // 校验内容
    if (state.type === 'document' && !state.content.trim()) {
      message.error('请先输入文档内容');
      return;
    }

    if (state.type === 'image' && !state.imageUrl) {
      message.error('请先上传图片');
      return;
    }

    try {
      setGeneratingDescription(true);
      api.log.info('开始生成AI简介', {
        type: state.type,
        hasContent: state.type === 'document' ? !!state.content : !!state.imageUrl
      });

      let prompt = '';
      if (state.type === 'document') {
        prompt = `请为以下文档内容生成一个简短的描述(50字以内):

${state.content}

要求:
1. 突出文档的主要内容和要点
2. 使用简洁专业的语言
3. 不超过50个字
4. 不要使用"本文"、"该文"等指代词
`;
      } else {
        prompt = `请为这个图片生成一个简短的描述(50字以内):

图片URL: ${state.imageUrl}

要求:
1. 描述图片的主要内容和特点
2. 使用简洁专业的语言
3. 不超过50个字
`;
      }

      let description = '';
      await ai.chat([
        {
          role: 'system',
          content: '你是一个专业的内容描述生成助手。'
        },
        {
          role: 'user',
          content: prompt
        }
      ], {
        onChunk: (chunk) => {
          description += chunk;
        },
        onError: (error) => {
          api.log.error('生成简介失败', {
            error: error.message,
            type: state.type
          });
          throw error;
        }
      });

      api.log.info('AI简介生成成功', {
        description: description.slice(0, 100)
      });

      setState(prev => ({
        ...prev,
        description: description.trim(),
        dirty: true
      }));

      message.success('简介生成成功');

    } catch (error) {
      api.log.error('生成简介失败', {
        error: error.message,
        type: state.type
      });
      message.error('生成简介失败: ' + error.message);
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleTypeChange = (value) => {
    setState(prev => ({
      ...prev,
      type: value,
      content: '',
      imageUrl: '',
      dirty: true
    }));
  };

  const handleImageUpload = async (imageUrl) => {
    setState(prev => ({
      ...prev,
      imageUrl,
      dirty: true
    }));
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      api.log.info('开始处理Excel文件', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // 验证文件
      excelParserService.validateExcel(file);

      setFileUploading(true);
      setUploadProgress(0);

      // 解析Excel
      const markdownContent = await excelParserService.parseExcel(file);

      // 更新状态
      setState(prev => ({
        ...prev,
        type: 'document',
        title: file.name.replace(/\.[^/.]+$/, ''),
        content: markdownContent,
        dirty: true
      }));

      message.success('Excel导入成功');
      api.log.info('Excel导入成功', {
        fileName: file.name,
        contentLength: markdownContent.length
      });

    } catch (error) {
      api.log.error('Excel导入失败', {
        fileName: file.name,
        error: error.message
      });
      message.error('Excel导入失败: ' + error.message);
    } finally {
      setFileUploading(false);
      setUploadProgress(0);
      if (excelInputRef.current) {
        excelInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      api.log.warn('不支持的文件类型', {
        fileType: file.type,
        fileName: file.name
      });
      message.error('仅支持 PDF 和 Word 文档格式');
      return;
    }

    // 检查文件大小 (10MB 限制)
    if (file.size > 10 * 1024 * 1024) {
      api.log.warn('文件过大', {
        fileSize: file.size,
        fileName: file.name
      });
      message.error('文件大小不能超过 10MB');
      return;
    }

    try {
      setFileUploading(true);
      setUploadProgress(0);

      api.log.info('开始处理文档', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // 转换文档
      const res = await api.toMarkdown(file, {
        onProgress: (percent) => {
          setUploadProgress(percent);
        }
      });

      api.log.info('文档转换成功', {
        fileName: file.name,
        markdownLength: res.result.markdown?.length
      });

      // 更新状态
      setState(prev => ({
        ...prev,
        type: 'document',
        title: file.name.replace(/\.[^/.]+$/, ''),
        content: res.result.markdown,
        dirty: true
      }));

      message.success('文档导入成功');

    } catch (error) {
      api.log.error('文档处理失败', {
        fileName: file.name,
        error: error.message
      });
      message.error('文档处理失败: ' + error.message);
    } finally {
      setFileUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSave = () => {
    if (!state.title.trim()) {
      message.error('请输入知识块标题');
      return;
    }

    if (!state.description.trim()) {
      message.error('请输入知识块简介');
      return;
    }

    if (state.type === 'document' && !state.content.trim()) {
      message.error('请输入文档内容');
      return;
    }

    if (state.type === 'image' && !state.imageUrl) {
      message.error('请上传图片');
      return;
    }

    onSave({
      ...block,
      ...state
    });
  };

  return (
    <div className="p-6">
      <div className="space-y-6">
        {!block && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon icon="solar:document-bold" className="w-5 h-5 text-primary"/>
              <h3 className="text-lg font-semibold">选择知识类型</h3>
            </div>
            <Card className="bg-default-50">
              <CardBody>
                <RadioGroup
                  orientation="horizontal"
                  value={state.type}
                  onValueChange={handleTypeChange}
                  isDisabled={knowledgeStore.saveLoading}
                  classNames={{
                    wrapper: "gap-8"
                  }}
                >
                  <Radio
                    value="document"
                    description="适用于文字型知识内容"
                    classNames={{
                      base: "inline-flex m-0",
                      wrapper: "group-data-[selected=true]:border-primary",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:document-bold" className="w-4 h-4 text-primary"/>
                      <span>文档</span>
                    </div>
                  </Radio>
                  <Radio
                    value="image"
                    description="适用于图片型知识内容"
                    classNames={{
                      base: "inline-flex m-0",
                      wrapper: "group-data-[selected=true]:border-primary",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:gallery-bold" className="w-4 h-4 text-secondary"/>
                      <span>图片</span>
                    </div>
                  </Radio>
                </RadioGroup>
              </CardBody>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon icon="solar:info-circle-bold" className="w-5 h-5 text-primary"/>
            <h3 className="text-lg font-semibold">基本信息</h3>
          </div>
          <Card className="bg-default-50">
            <CardBody className="space-y-6">
              <Input
                label="标题"
                placeholder="输入一个简洁明了的标题"
                value={state.title}
                onChange={(e) => handleChange('title', e.target.value)}
                variant="bordered"
                isRequired
                description="标题应简洁明了，便于快速理解内容"
                isDisabled={knowledgeStore.saveLoading}
                startContent={
                  <Icon icon="solar:pen-bold" className="text-default-400 pointer-events-none flex-shrink-0" />
                }
                classNames={{
                  label: "text-default-700 font-medium",
                  description: "text-default-500"
                }}
              />

              <div className="relative">
                <Textarea
                  label="简介"
                  placeholder="简要描述此知识的主要内容"
                  value={state.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  variant="bordered"
                  minRows={2}
                  isRequired
                  description="帮助其他人快速了解此知识的要点"
                  isDisabled={knowledgeStore.saveLoading || generatingDescription}
                  classNames={{
                    label: "text-default-700 font-medium",
                    description: "text-default-500",
                  }}
                  endContent={
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      className="absolute right-2 top-2"
                      onPress={handleGenerateDescription}
                      isLoading={generatingDescription}
                    >
                      <Icon icon="solar:star-shine-outline" className="w-4 h-4 text-primary" />
                    </Button>
                  }
                />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon
                icon={state.type === 'document' ? 'solar:document-bold' : 'solar:gallery-bold'}
                className={cn(
                  "w-5 h-5",
                  state.type === 'document' ? "text-primary" : "text-secondary"
                )}
              />
              <h3 className="text-lg font-semibold">
                {state.type === 'document' ? '文档内容' : '图片内容'}
              </h3>
            </div>
            {state.type === 'document' && (
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={fileUploading}
                />
                <input
                  type="file"
                  ref={excelInputRef}
                  className="hidden"
                  accept=".xls,.xlsx"
                  onChange={handleExcelUpload}
                  disabled={fileUploading}
                />
                <Button
                  color="primary"
                  variant="flat"
                  size="sm"
                  startContent={<Icon icon="solar:file-bold" className="w-4 h-4" />}
                  isLoading={fileUploading}
                  onPress={() => fileInputRef.current?.click()}
                >
                  导入文档
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  size="sm"
                  startContent={<Icon icon="solar:explicit-bold" className="w-4 h-4" />}
                  isLoading={fileUploading}
                  onPress={() => excelInputRef.current?.click()}
                >
                  导入Excel
                </Button>
              </div>
            )}
          </div>

          <Card className="bg-default-50">
            <CardBody>
              {fileUploading && (
                <div className="mb-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-default-600">正在处理文件...</span>
                    <span className="text-sm text-default-600">{uploadProgress}%</span>
                  </div>
                  <Progress
                    value={uploadProgress}
                    color="primary"
                    size="sm"
                    isStriped
                    isIndeterminate={uploadProgress === 0}
                  />
                </div>
              )}

              {state.type === 'document' ? (
                <Textarea
                  label="内容"
                  placeholder="输入详细的知识内容"
                  value={state.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  variant="bordered"
                  minRows={8}
                  isRequired
                  description="支持 Markdown 格式"
                  isDisabled={knowledgeStore.saveLoading || fileUploading}
                  classNames={{
                    label: "text-default-700 font-medium",
                    description: "text-default-500"
                  }}
                />
              ) : (
                <div className="space-y-2">
                  <label className="block text-default-700 font-medium mb-1">图片</label>
                  <ImageUploader
                    images={state.imageUrl ? [state.imageUrl] : []}
                    onUpload={handleImageUpload}
                    onRemove={() => handleChange('imageUrl', '')}
                    maxImages={1}
                    disabled={knowledgeStore.saveLoading}
                  />
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        <div className="flex justify-end gap-2 mt-8">
          <Button
            color="danger"
            variant="light"
            onPress={onCancel}
            startContent={<Icon icon="solar:close-circle-bold" className="w-4 h-4" />}
            isDisabled={knowledgeStore.saveLoading || fileUploading}
            size="lg"
          >
            取消
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isDisabled={!state.dirty || knowledgeStore.saveLoading || fileUploading}
            startContent={<Icon icon="solar:check-circle-broken" className="w-4 h-4" />}
            isLoading={knowledgeStore.saveLoading}
            size="lg"
          >
            保存
          </Button>
        </div>
      </div>
    </div>
  );
});

context.wpm.export('comp_knowledge_editor', KnowledgeEditor);
KnowledgeEditor.displayName = 'KnowledgeEditor';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_knowledge_search_result" title="知识搜索结果组件">
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
  ReactMarkdown,
  remarkGfm,
} = context;

const { Card, CardBody, Chip, Accordion, AccordionItem, Image } = NextUI;
const { motion } = FramerMotion;

const KnowledgeSearchResult = observer(({ searchResult }) => {
  if (!searchResult) return null;

  const { found, details } = searchResult;

  api.log.info('渲染知识搜索结果', {
    found,
    detailsCount: details?.length
  });

  if (!found) {
    return (
      <div className="mt-2">
        <Chip
          color="warning"
          variant="flat"
          startContent={<Icon icon="solar:info-circle-bold" className="w-3 h-3" />}
        >
          未找到相关知识
        </Chip>
      </div>
    );
  }

  if (!details || details.length === 0) {
    api.log.warn('知识搜索结果为空');
    return null;
  }

  const renderKnowledgeContent = (detail) => {
    if (!detail) {
      api.log.warn('知识详情为空');
      return null;
    }

    api.log.info('渲染知识内容', {
      id: detail.id,
      type: detail.type,
      title: detail.title
    });

    if (detail.type === 'document') {
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                return (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {detail.content || '暂无内容'}
          </ReactMarkdown>
        </div>
      );
    } else if (detail.type === 'image') {
      return (
        <div className="space-y-4">
          <div className="relative aspect-video">
            <Image
              src={detail.imageUrl}
              alt={detail.title}
              className="rounded-lg object-cover w-full h-full"
              onError={(e) => {
                api.log.error('图片加载失败', {
                  imageUrl: detail.imageUrl
                });
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?fit=crop&w=300&h=300';
              }}
            />
          </div>
          <div className="text-sm text-default-500">
            <p>图片地址：{detail.imageUrl}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderKnowledgeMetadata = (detail) => {
    return (
      <div className="grid grid-cols-2 gap-2 text-sm text-default-500 mt-2">
        <div>
          <span className="font-medium">创建时间：</span>
          {new Date(detail.createdAt).toLocaleString()}
        </div>
        <div>
          <span className="font-medium">更新时间：</span>
          {new Date(detail.updatedAt).toLocaleString()}
        </div>
        <div>
          <span className="font-medium">创建者：</span>
          {detail.createdBy?.name || '未知'}
        </div>
        <div>
          <span className="font-medium">知识ID：</span>
          {detail.id}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-4">
      <Accordion
        variant="shadow"
        className="bg-default-50"
      >
        <AccordionItem
          key="knowledge"
          aria-label="检索到的知识"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:documents-bold" className="w-4 h-4 text-primary" />
              <span>检索到 {details.length} 条相关知识</span>
            </div>
          }
        >
          <div className="space-y-4 p-2">
            {details.map((detail, index) => (
              <Card key={detail.id} className="bg-background">
                <CardBody className="gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon
                        icon={detail.type === 'document' ? 'solar:document-bold' : 'solar:gallery-bold'}
                        className={cn(
                          "w-4 h-4",
                          detail.type === 'document' ? "text-primary" : "text-secondary"
                        )}
                      />
                      <h3 className="text-sm font-semibold">{detail.title}</h3>
                    </div>
                    <Chip
                      size="sm"
                      variant="flat"
                      color={detail.type === 'document' ? 'primary' : 'secondary'}
                    >
                      {detail.type === 'document' ? '文档' : '图片'}
                    </Chip>
                  </div>

                  <p className="text-small text-default-500">{detail.description}</p>

                  <Accordion>
                    <AccordionItem
                      key="content"
                      aria-label="知识内容"
                      title={
                        <div className="flex items-center gap-2">
                          <Icon icon="solar:info-circle-bold" className="w-4 h-4 text-primary" />
                          <span className="text-sm">查看详细内容</span>
                        </div>
                      }
                    >
                      <div className="mt-2">
                        {renderKnowledgeContent(detail)}
                        {renderKnowledgeMetadata(detail)}
                      </div>
                    </AccordionItem>
                  </Accordion>
                </CardBody>
              </Card>
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
});

context.wpm.export('comp_knowledge_search_result', KnowledgeSearchResult);
KnowledgeSearchResult.displayName = 'KnowledgeSearchResult';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_message_card" title="消息卡片组件">
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
  remarkGfm,
  ReactMarkdown
} = context;

const { Card, CardBody, Chip, Accordion, AccordionItem } = NextUI;
const { motion } = FramerMotion;

const MessageCard = observer(({ card, isLast }) => {
  const [expanded, setExpanded] = React.useState(false);

  // 根据卡片类型返回加载文本
  const getLoadingText = () => {
    switch (card.type) {
      case 'search':
        return '知识库检索中...';
      case 'think':
        return '思考中...';
      case 'web_search':
        return '网络检索中...';
      default:
        return '处理中...';
    }
  };

  // 渲染加载状态
  if (!card.completed && card.type !== 'answer') {
    return (
      <div className="flex items-center gap-2 text-default-500 text-sm">
        <span className="animate-pulse">{getLoadingText()}</span>
      </div>
    );
  }

  // 渲染思考内容
  if (card.type === 'think' && card.completed) {
    const thinkMatch = card.content.match(/<think>([\s\S]*?)<\/think>/);
    if (thinkMatch) {
      return (
        <div className="text-sm text-default-500 whitespace-pre-wrap">
          {thinkMatch[1].trim()}
        </div>
      );
    }
  }

  // 渲染回答内容
  if (card.type === 'answer') {
    return (
      <div className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        "transition-opacity duration-200",
        !card.completed && "opacity-80"
      )}>
        {card.content ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                return (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {card.content}
          </ReactMarkdown>
        ) : (
          <div className="flex items-center gap-2 text-default-500">
            <span className="animate-pulse">生成回答中...</span>
          </div>
        )}
      </div>
    );
  }

  return null;
});

context.wpm.export('comp_message_card', MessageCard);
MessageCard.displayName = 'MessageCard';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_operation_log" title="操作日志组件">
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

const { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Chip } = NextUI;

const userStore = await context.wpm.import('store_user');

const OperationLog = observer(() => {
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [logs, setLogs] = React.useState<LogQueryResult>({
    logs: [],
    total: 0,
    page: 1,
    pageSize: 10
  });

  const loadLogs = React.useCallback(async () => {
    try {
      setLoading(true);
      const result = await userStore.getLogs({
        page,
        pageSize: 10
      });
      setLogs(result);
    } catch (error) {
      message.error('加载日志失败');
    } finally {
      setLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const renderCell = React.useCallback((log: OperationLog, columnKey: string) => {
    switch (columnKey) {
      case 'operation':
        return (
          <Chip
            color="primary"
            variant="flat"
            size="sm"
          >
            {log.operation}
          </Chip>
        );
      case 'createdAt':
        return new Date(log.createdAt).toLocaleString();
      default:
        return log[columnKey];
    }
  }, []);

  return (
    <div className="space-y-4">
      <Table
        aria-label="操作日志"
        bottomContent={
          <div className="flex justify-center">
            <Pagination
              total={Math.ceil(logs.total / logs.pageSize)}
              page={page}
              onChange={setPage}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[400px]",
        }}
      >
        <TableHeader>
          <TableColumn key="operation">操作类型</TableColumn>
          <TableColumn key="userName">操作人</TableColumn>
          <TableColumn key="target">操作对象</TableColumn>
          <TableColumn key="detail">详情</TableColumn>
          <TableColumn key="createdAt">操作时间</TableColumn>
        </TableHeader>
        <TableBody
          items={logs.logs}
          loadingContent={<div>加载中...</div>}
          loadingState={loading ? "loading" : "idle"}
        >
          {(log) => (
            <TableRow key={log.id}>
              {(columnKey) => (
                <TableCell>{renderCell(log, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
});

context.wpm.export('comp_operation_log', OperationLog);
OperationLog.displayName = 'OperationLog';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_user_info" title="用户信息组件">
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

const { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } = NextUI;
const { useNavigate } = ReactRouterDom;

const userStore = await context.wpm.import('store_user');

const UserInfo = observer(() => {
  const { currentUser, loading } = userStore;
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-default-100 animate-pulse" />
        <div className="h-4 w-20 bg-default-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          variant="light"
          className="p-0 bg-transparent data-[hover=true]:bg-transparent"
          startContent={
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon icon="solar:user-circle-bold" className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {currentUser.name}
              </span>
            </div>
          }
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="用户菜单">
        <DropdownItem
          key="profile"
          startContent={<Icon icon="solar:user-circle-bold" className="w-4 h-4" />}
          onPress={() => navigate('/profile')}
        >
          个人信息
        </DropdownItem>
        <DropdownItem
          key="logs"
          startContent={<Icon icon="solar:history-bold" className="w-4 h-4" />}
          onPress={() => navigate('/logs')}
        >
          操作日志
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
});

context.wpm.export('comp_user_info', UserInfo);
UserInfo.displayName = 'UserInfo';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_web_search_result" title="网络搜索结果组件">
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

const { Card, CardBody, Chip, Accordion, AccordionItem, Link } = NextUI;

const WebSearchResult = observer(({ searchResult }) => {
  if (!searchResult) return null;

  const { query, results, timestamp } = searchResult;

  api.log.info('渲染网络搜索结果', {
    query,
    resultsCount: results?.length
  });

  if (!results || results.length === 0) {
    return (
      <div className="mt-1">
        <Chip
          color="warning"
          variant="flat"
          size="sm"
          startContent={<Icon icon="solar:info-circle-bold" className="w-3 h-3" />}
        >
          未找到相关网络内容
        </Chip>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <Accordion
        variant="shadow"
        className="bg-default-50"
      >
        <AccordionItem
          key="web-search"
          aria-label="网络搜索结果"
          title={
            <div className="flex items-center gap-2">
              <Icon icon="solar:globe-bold" className="w-3 h-3 text-primary" />
              <span className="text-xs">找到 {results.length} 条网络内容</span>
            </div>
          }
        >
          <div className="space-y-2 p-2">
            {results.map((result, index) => (
              <Card key={index} className="bg-background">
                <CardBody className="py-2 px-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium">{result.title}</h3>
                    <Chip
                      size="sm"
                      variant="flat"
                      color="primary"
                      classNames={{
                        base: "h-5",
                        content: "text-xs px-2"
                      }}
                      startContent={<Icon icon="solar:link-circle-bold" className="w-3 h-3" />}
                    >
                      网页
                    </Chip>
                  </div>

                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="text-xs text-default-500 line-clamp-2">{result.content}</p>
                  </div>

                  <div className="flex items-center gap-1 text-tiny text-default-400">
                    <Icon icon="solar:link-minimalistic-bold" className="w-3 h-3" />
                    <Link
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      className="text-xs hover:text-primary"
                    >
                      {result.url}
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </AccordionItem>
      </Accordion>
    </div>
  );
});

context.wpm.export('comp_web_search_result', WebSearchResult);
WebSearchResult.displayName = 'WebSearchResult';
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_welcome_screen" title="欢迎界面组件">
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

const { motion } = FramerMotion;
const { Button, Image } = NextUI;

const WelcomeScreen = observer(({ onStartChat }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Image
          src="https://www.deepseek.com/_next/image?url=https%3A%2F%2Fcdn.deepseek.com%2Flogo.png&w=1920&q=75"
          alt="AI助手"
          className="w-48"
        />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-4xl font-bold mb-4"
      >
        DeepSeek 企业版
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-default-500 text-lg mb-8 max-w-md"
      >
        我是你的 AI 同事，有关公司的任何问题都可以问我哟，然后我可以协助你完成工作
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          color="primary"
          size="lg"
          onPress={onStartChat}
          startContent={<Icon icon="solar:chat-round-dots-bold-duotone" className="w-5 h-5" />}
        >
          开始对话
        </Button>
      </motion.div>
    </motion.div>
  );
});

context.wpm.export('comp_welcome_screen', WelcomeScreen);
WelcomeScreen.displayName = 'WelcomeScreen';
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_chat" title="对话页面">
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
const { motion, AnimatePresence } = FramerMotion;

// 导入组件
const ChatInput = await context.wpm.import('comp_chat_input');
const ChatMessage = await context.wpm.import('comp_chat_message');
const WelcomeScreen = await context.wpm.import('comp_welcome_screen');
const ChatToolbar = await context.wpm.import('comp_chat_toolbar');
const chatStore = await context.wpm.import('store_chat');
const knowledgeStore = await context.wpm.import('store_knowledge');

const ChatPage = observer(() => {
  const [showChat, setShowChat] = React.useState(false);
  const messagesEndRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    const initializeKnowledge = async () => {
      try {
        api.log.info('开始初始化知识库数据');
        await knowledgeStore.initialize();
        api.log.info('知识库数据初始化完成', {
          indicesCount: knowledgeStore.indices.length
        });
      } catch (error) {
        api.log.error('知识库数据初始化失败', {
          error: error.message
        });
        message.error('加载知识库失败');
      }
    };

    initializeKnowledge();
  }, []);

  React.useEffect(() => {
    if (showChat) {
      scrollToBottom();
    }
  }, [chatStore.messages, showChat]);

  const handleStartChat = () => {
    api.log.info('开始对话');
    setShowChat(true);
  };

  const handleSendMessage = async (content: string) => {
    try {
      api.log.info('发送消息', { content });

      // 确保知识库已初始化
      if (!knowledgeStore.initialized) {
        api.log.warn('知识库未初始化，正在初始化');
        await knowledgeStore.initialize();
      }

      await chatStore.sendMessage(content);
    } catch (error) {
      api.log.error('发送消息失败', {
        content,
        error: error.message
      });
      message.error('发送失败');
    }
  };

  return (
    <div className="px-4">
      <AnimatePresence mode="wait">
        {!showChat ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <WelcomeScreen onStartChat={handleStartChat} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-[calc(100vh-8rem)]"
          >
            <div className="h-full flex">
              <ChatToolbar />

              <Card className="flex-1">
                <CardBody className="p-4 flex flex-col relative">
                  <div className="flex-1 overflow-y-auto">
                    {chatStore.messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isAi={message.role === 'ai'}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="pt-4 border-t">
                    <ChatInput
                      onSend={handleSendMessage}
                      loading={chatStore.loading}
                    />
                  </div>
                </CardBody>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

context.wpm.export('page_chat', ChatPage);
ChatPage.displayName = 'ChatPage';
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_knowledge" title="知识库页面">
const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
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

const { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Chip, Pagination } = NextUI;

// 导入组件
const KnowledgeEditor = await context.wpm.import('comp_knowledge_editor');
const KnowledgeDetail = await context.wpm.import('comp_knowledge_detail');
const knowledgeStore = await context.wpm.import('store_knowledge');

// 定义表格列配置
const columns = [
  {
    key: "title",
    label: "标题",
  },
  {
    key: "type",
    label: "类型",
  },
  {
    key: "description",
    label: "描述",
  },
  {
    key: "updatedAt",
    label: "更新时间",
  },
  {
    key: "actions",
    label: "操作",
  }
];

const KnowledgePage = observer(() => {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = React.useState(new Set(["title", "type", "description", "updatedAt", "actions"]));
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [sortDescriptor, setSortDescriptor] = React.useState({
    column: "updatedAt",
    direction: "descending"
  });
  const [page, setPage] = React.useState(1);
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const { isOpen: isEditorOpen, onOpen: onEditorOpen, onClose: onEditorClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [viewLoading, setViewLoading] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(null);

  React.useEffect(() => {
    knowledgeStore.initialize();
  }, []);

  React.useEffect(() => {
    knowledgeStore.setSelectedIds(Array.from(selectedKeys));
  }, [selectedKeys]);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => Array.from(visibleColumns).includes(column.key));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let filtered = [...knowledgeStore.indices];

    if (hasSearchFilter) {
      filtered = filtered.filter((item) =>
        item.title.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.description.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filtered;
  }, [knowledgeStore.indices, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const handleAdd = () => {
    api.log.info('点击新建知识按钮');
    knowledgeStore.currentDetail = null;
    onEditorOpen();
  };

  const handleEdit = (id) => {
    api.log.info('点击编辑按钮', { id });
    knowledgeStore.loadDetail(id).then(() => {
      onEditorOpen();
    });
  };

  const handleView = async (id) => {
    try {
      api.log.info('点击查看按钮', { id });
      setViewLoading(true);
      await knowledgeStore.loadDetail(id);
      onDetailOpen();
    } catch (error) {
      api.log.error('查看知识块失败', { id, error: error.message });
      message.error('加载失败');
    } finally {
      setViewLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      api.log.info('开始删除知识块', { id });
      setDeleteLoading(id);
      await knowledgeStore.deleteKnowledge(id);
      message.success('删除成功');
      api.log.info('知识块删除成功', { id });
    } catch (error) {
      api.log.error('删除知识块失败', { id, error: error.message });
      message.error('删除失败');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleCopyMetadataKey = async (id) => {
    try {
      const metadataKey = `${appId}_knowledge_${id}`;
      await navigator.clipboard.writeText(metadataKey);
      api.log.info('复制知识块元数据key成功', { id, metadataKey });
      message.success('元数据key已复制到剪贴板');
    } catch (error) {
      api.log.error('复制知识块元数据key失败', {
        id,
        error: error.message
      });
      message.error('复制失败');
    }
  };

  const handleBatchDelete = async () => {
    try {
      api.log.info('开始批量删除', {
        selectedCount: selectedKeys.size
      });

      await knowledgeStore.batchDeleteKnowledge();

      // 重置选择状态
      setSelectedKeys(new Set());

      onDeleteClose();

      api.log.info('批量删除完成，已重置选择状态');
    } catch (error) {
      api.log.error('批量删除失败', { error: error.message });
    }
  };

  const handleSave = async (block) => {
    try {
      api.log.info('保存知识块', { id: block.id });
      if (block.id) {
        await knowledgeStore.updateKnowledge(block.id, block);
      } else {
        await knowledgeStore.createKnowledge(block);
      }
      onEditorClose();
    } catch (error) {
      api.log.error('保存知识块失败', { error: error.message });
    }
  };

  const renderCell = React.useCallback((item, columnKey) => {
    switch (columnKey) {
      case "title":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize">{item.title}</p>
          </div>
        );
      case "type":
        return (
          <Chip
            className="capitalize"
            color={item.type === 'document' ? "primary" : "secondary"}
            size="sm"
            variant="flat"
            startContent={
              <Icon
                icon={item.type === 'document' ? 'solar:document-bold' : 'solar:gallery-bold'}
                className="text-lg"
              />
            }
          >
            {item.type === 'document' ? '文档' : '图片'}
          </Chip>
        );
      case "description":
        return (
          <div className="flex flex-col max-w-xs">
            <p className="text-bold text-small text-default-400 truncate">
              {item.description}
            </p>
          </div>
        );
      case "updatedAt":
        return (
          <div className="flex items-center gap-1">
            <Icon icon="solar:calendar-bold" className="text-default-400" />
            <span className="text-small">
              {new Date(item.updatedAt).toLocaleString()}
            </span>
          </div>
        );
      case "actions":
        return (
          <div className="flex justify-end">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                >
                  <Icon icon="solar:menu-dots-bold" className="text-lg" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="操作菜单">
                <DropdownItem
                  key="view"
                  startContent={<Icon icon="solar:eye-bold" className="text-lg" />}
                  onPress={() => handleView(item.id)}
                >
                  查看
                </DropdownItem>
                <DropdownItem
                  key="edit"
                  startContent={<Icon icon="solar:pen-bold" className="text-lg" />}
                  onPress={() => handleEdit(item.id)}
                >
                  编辑
                </DropdownItem>
                <DropdownItem
                  key="copy"
                  startContent={<Icon icon="solar:copy-bold" className="text-lg" />}
                  onPress={() => handleCopyMetadataKey(item.id)}
                >
                  复制元数据Key
                </DropdownItem>
                <DropdownItem
                  key="delete"
                  className="text-danger"
                  color="danger"
                  startContent={<Icon icon="solar:trash-bin-trash-bold" className="text-lg" />}
                  onPress={() => handleDelete(item.id)}
                >
                  删除
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return item[columnKey];
    }
  }, [viewLoading, deleteLoading]);

  const onRowsPerPageChange = React.useCallback((e) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="搜索知识..."
            startContent={<Icon icon="solar:magnifer-linear" className="text-default-400" />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<Icon icon="solar:alt-arrow-down-bold" className="text-small" />}
                  variant="flat"
                >
                  显示列
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="表格列"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.key} className="capitalize">
                    {column.label}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            {selectedKeys === 'all' > 0 && (
              <Button
                color="danger"
                variant="flat"
                onPress={onDeleteOpen}
                startContent={<Icon icon="solar:trash-bin-trash-bold" className="text-lg" />}
                isLoading={knowledgeStore.batchDeleting}
              >
                删除全部
              </Button>
            )}
            {selectedKeys.size > 0 && (
              <Button
                color="danger"
                variant="flat"
                onPress={onDeleteOpen}
                startContent={<Icon icon="solar:trash-bin-trash-bold" className="text-lg" />}
                isLoading={knowledgeStore.batchDeleting}
              >
                删除选中 ({selectedKeys.size})
              </Button>
            )}
            <Button
              color="primary"
              onPress={handleAdd}
              startContent={<Icon icon="solar:add-circle-bold" className="text-lg" />}
            >
              新建知识
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            共 {filteredItems.length} 条知识
          </span>
          <label className="flex items-center text-default-400 text-small">
            每页显示:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              onChange={onRowsPerPageChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [filterValue, visibleColumns, filteredItems.length, onRowsPerPageChange, selectedKeys.size, knowledgeStore.batchDeleting]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="primary"
          isDisabled={hasSearchFilter}
          page={page}
          total={pages}
          variant="light"
          onChange={setPage}
        />
        {selectedKeys.size > 0 && (
          <span className="text-small text-default-400">
            已选择 {selectedKeys.size} 项
          </span>
        )}
      </div>
    );
  }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

  return (
    <div className="space-y-4">
      <Table
        aria-label="知识库列表"
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "max-h-[600px]",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys}
        onSortChange={setSortDescriptor}
        loadingContent={<div>加载中...</div>}
        loadingState={knowledgeStore.loading ? "loading" : "idle"}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.key}
              align={column.key === "actions" ? "center" : "start"}
              allowsSorting={column.sortable}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          emptyContent={hasSearchFilter ? "未找到相关知识" : "知识库为空"}
          items={sortedItems}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal
        isOpen={isDetailOpen}
        onClose={onDetailClose}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            查看知识
          </ModalHeader>
          <ModalBody className="p-0">
            {knowledgeStore.currentDetail && (
              <KnowledgeDetail
                block={knowledgeStore.currentDetail}
                loading={viewLoading}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              variant="light"
              onPress={onDetailClose}
            >
              关闭
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isEditorOpen}
        onClose={onEditorClose}
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            {knowledgeStore.currentDetail ? '编辑知识' : '新建知识'}
          </ModalHeader>
          <ModalBody className="p-0">
            <KnowledgeEditor
              block={knowledgeStore.currentDetail}
              onSave={handleSave}
              onCancel={onEditorClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            批量删除知识
          </ModalHeader>
          <ModalBody>
            <p>确定要删除选中的 {selectedKeys.size} 条知识吗？此操作不可恢复。</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={onDeleteClose}
            >
              取消
            </Button>
            <Button
              color="danger"
              onPress={handleBatchDelete}
              isLoading={knowledgeStore.batchDeleting}
            >
              确认删除
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

context.wpm.export('page_knowledge', KnowledgePage);
KnowledgePage.displayName = 'KnowledgePage';
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_operation_log" title="操作日志页面">
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

const { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Chip, Card, CardHeader, CardBody } = NextUI;

const userStore = await context.wpm.import('store_user');

const OperationLogPage = observer(() => {
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [logs, setLogs] = React.useState<LogQueryResult>({
    logs: [],
    total: 0,
    page: 1,
    pageSize: 10
  });

  const loadLogs = React.useCallback(async () => {
    try {
      setLoading(true);
      api.log.info('开始加载操作日志', { page });

      const result = await userStore.getLogs({
        page,
        pageSize: 10
      });

      setLogs(result);

      api.log.info('操作日志加载完成', {
        total: result.total,
        page: result.page
      });

    } catch (error) {
      api.log.error('加载操作日志失败', {
        error: error.message,
        page
      });
      message.error('加载日志失败');
    } finally {
      setLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const renderCell = React.useCallback((log: OperationLog, columnKey: string) => {
    switch (columnKey) {
      case 'operation':
        return (
          <Chip
            color="primary"
            variant="flat"
            size="sm"
            startContent={<Icon icon="solar:history-bold" className="w-3 h-3" />}
          >
            {log.operation}
          </Chip>
        );
      case 'createdAt':
        return (
          <div className="flex items-center gap-1">
            <Icon icon="solar:calendar-bold" className="w-4 h-4 text-default-400" />
            <span>{new Date(log.createdAt).toLocaleString()}</span>
          </div>
        );
      case 'userName':
        return (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon icon="solar:user-circle-bold" className="w-4 h-4 text-primary" />
            </div>
            <span>{log.userName}</span>
          </div>
        );
      default:
        return log[columnKey];
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex gap-3">
          <Icon icon="solar:history-bold" className="w-6 h-6 text-primary" />
          <div className="flex flex-col">
            <p className="text-md font-semibold">操作日志</p>
            <p className="text-small text-default-500">查看系统操作记录</p>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            aria-label="操作日志"
            bottomContent={
              <div className="flex justify-center">
                <Pagination
                  total={Math.ceil(logs.total / logs.pageSize)}
                  page={page}
                  onChange={setPage}
                />
              </div>
            }
            classNames={{
              wrapper: "min-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn key="operation">操作类型</TableColumn>
              <TableColumn key="userName">操作人</TableColumn>
              <TableColumn key="target">操作对象</TableColumn>
              <TableColumn key="detail">详情</TableColumn>
              <TableColumn key="createdAt">操作时间</TableColumn>
            </TableHeader>
            <TableBody
              items={logs.logs}
              loadingContent={<div>加载中...</div>}
              loadingState={loading ? "loading" : "idle"}
              emptyContent={<div>暂无操作记录</div>}
            >
              {(log) => (
                <TableRow key={log.id}>
                  {(columnKey) => (
                    <TableCell>{renderCell(log, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
});

context.wpm.export('page_operation_log', OperationLogPage);
OperationLogPage.displayName = 'OperationLogPage';
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_user_profile" title="用户信息页面">
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

const { Card, CardBody, CardHeader, Divider } = NextUI;

const userStore = await context.wpm.import('store_user');

const UserProfile = observer(() => {
  const { currentUser, loading } = userStore;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-default-100 rounded animate-pulse" />
        <Card>
          <CardBody className="gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 bg-default-100 rounded animate-pulse" />
            ))}
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon icon="solar:user-circle-bold" className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{currentUser.name}</h1>
          <p className="text-default-500">{currentUser.account}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex gap-3">
          <Icon icon="solar:info-circle-bold" className="w-6 h-6 text-primary" />
          <div className="flex flex-col">
            <p className="text-md font-semibold">基本信息</p>
            <p className="text-small text-default-500">查看您的账户信息</p>
          </div>
        </CardHeader>
        <Divider/>
        <CardBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-small text-default-500">账号</p>
                <p className="text-medium">{currentUser.account}</p>
              </div>
              <div>
                <p className="text-small text-default-500">姓名</p>
                <p className="text-medium">{currentUser.name}</p>
              </div>
              <div>
                <p className="text-small text-default-500">手机号</p>
                <p className="text-medium">{currentUser.phone || '-'}</p>
              </div>
              <div>
                <p className="text-small text-default-500">组织ID</p>
                <p className="text-medium">{currentUser.organizationId}</p>
              </div>
              <div>
                <p className="text-small text-default-500">创建时间</p>
                <p className="text-medium">
                  {new Date(currentUser.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-small text-default-500">最后更新</p>
                <p className="text-medium">
                  {new Date(currentUser.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
});

context.wpm.export('page_user_profile', UserProfile);
UserProfile.displayName = 'UserProfile';
</mo-ai-code>
```

```jsx
<mo-ai-code type="service" name="service_chat_history" title="对话历史记录服务">
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

class ChatHistoryService {
  private STORAGE_KEY = `${appId}_chat_histories`;
  private MAX_HISTORIES = 50;

  async saveHistory(messages: ChatMessage[]): Promise<string> {
    try {
      api.log.info('开始保存对话历史', {
        messageCount: messages.length
      });

      const history: ChatHistory = {
        id: `chat_${Date.now()}`,
        title: this.generateTitle(messages),
        messages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const histories = await this.getHistories();

      // 限制历史记录数量
      if (histories.length >= this.MAX_HISTORIES) {
        histories.pop();
      }

      const updatedHistories = [history, ...histories];
      await api.setMetadata(this.STORAGE_KEY, {
        histories: updatedHistories
      });

      api.log.info('对话历史保存成功', {
        historyId: history.id,
        messageCount: messages.length,
        totalHistories: updatedHistories.length
      });

      return history.id;
    } catch (error) {
      api.log.error('保存对话历史失败', {
        error: error.message,
        messageCount: messages.length
      });
      throw error;
    }
  }

  async getHistories(): Promise<ChatHistory[]> {
    try {
      api.log.info('开始获取对话历史列表');

      const result = await api.getMetadata([this.STORAGE_KEY]);
      const data = result.data?.[0]?.value;
      const histories = data ? JSON.parse(data).histories : [];

      api.log.info('获取对话历史列表成功', {
        historyCount: histories.length
      });

      return histories;
    } catch (error) {
      api.log.error('获取对话历史列表失败', {
        error: error.message
      });
      return [];
    }
  }

  async deleteHistory(id: string): Promise<void> {
    try {
      api.log.info('开始删除对话历史', { id });

      const histories = await this.getHistories();
      const historyToDelete = histories.find(h => h.id === id);

      if (!historyToDelete) {
        api.log.warn('要删除的对话历史不存在', { id });
        throw new Error('对话历史不存在');
      }

      const updatedHistories = histories.filter(h => h.id !== id);

      await api.setMetadata(this.STORAGE_KEY, {
        histories: updatedHistories
      });

      api.log.info('删除对话历史成功', {
        id,
        remainingHistories: updatedHistories.length
      });
    } catch (error) {
      api.log.error('删除对话历史失败', {
        id,
        error: error.message
      });
      throw error;
    }
  }

  private generateTitle(messages: ChatMessage[]): string {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
      const title = firstUserMessage.content.slice(0, 20);
      return title + (title.length >= 20 ? '...' : '');
    }
    return `对话记录 ${new Date().toLocaleString()}`;
  }
}

const chatHistoryService = new ChatHistoryService();
context.wpm.export('service_chat_history', chatHistoryService);
</mo-ai-code>
```

```jsx
<mo-ai-code type="service" name="service_excel_parser" title="Excel解析服务">
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

class ExcelParserService {
  async parseExcel(file) {
    try {
      api.log.info('开始解析Excel文件', {
        fileName: file.name,
        fileSize: file.size
      });

      const arrayBuffer = await file.arrayBuffer();
      const workbook = xlsx.read(arrayBuffer);

      // 获取第一个工作表
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      // 转换为数组
      const data = xlsx.utils.sheet_to_json(firstSheet, { header: 1 });

      api.log.info('Excel解析成功', {
        sheetName: workbook.SheetNames[0],
        rowCount: data.length
      });

      // 转换为Markdown表格
      const markdownTable = this.convertToMarkdown(data);

      api.log.info('转换为Markdown完成', {
        markdownLength: markdownTable.length
      });

      return markdownTable;

    } catch (error) {
      api.log.error('Excel解析失败', {
        error: error.message,
        fileName: file.name
      });
      throw error;
    }
  }

  private convertToMarkdown(data) {
    if (!data || data.length === 0) {
      return '';
    }

    try {
      api.log.info('开始转换为Markdown表格', {
        rowCount: data.length
      });

      // 获取表头
      const headers = data[0];

      // 生成表头行
      let markdown = '| ' + headers.join(' | ') + ' |\n';

      // 生成分隔行
      markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

      // 生成数据行
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        // 确保每行的列数与表头一致
        while (row.length < headers.length) {
          row.push('');
        }
        markdown += '| ' + row.join(' | ') + ' |\n';
      }

      api.log.info('Markdown表格生成成功', {
        headerCount: headers.length,
        dataRowCount: data.length - 1
      });

      return markdown;

    } catch (error) {
      api.log.error('Markdown转换失败', {
        error: error.message,
        dataLength: data.length
      });
      throw error;
    }
  }

  validateExcel(file) {
    // 检查文件类型
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(file.type)) {
      api.log.warn('不支持的文件类型', {
        fileType: file.type,
        fileName: file.name
      });
      throw new Error('只支持.xls和.xlsx格式的Excel文件');
    }

    // 检查文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      api.log.warn('文件过大', {
        fileSize: file.size,
        maxSize,
        fileName: file.name
      });
      throw new Error('文件大小不能超过5MB');
    }

    api.log.info('Excel文件验证通过', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    return true;
  }
}

const excelParserService = new ExcelParserService();
context.wpm.export('service_excel_parser', excelParserService);
</mo-ai-code>
```

```jsx
<mo-ai-code type="service" name="service_input_classifier" title="输入分类器服务">
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

class InputClassifierService {
  private config: ClassifierConfig = {
    minConfidence: 0.7,
    enabledActions: ['direct_answer', 'search_knowledge', 'web_search'],
    webSearchEnabled: true
  };

  async classifyInput(input: string): Promise<ClassificationResult> {
    try {
      api.log.info('开始分类用户输入', {
        input,
        webSearchEnabled: this.config.webSearchEnabled
      });

      let response = '';

      await ai.chat([
        {
          role: 'system',
          content: `你是一个输入分类器。根据用户输入判断需要执行的操作。

规则：
1. 如果是日常问候、闲聊、简单计算等可以直接回答的问题，包含 direct_answer
2. 如果涉及专业知识、具体业务等需要知识支持的问题，包含 search_knowledge
3. 如果涉及实时信息、新闻、市场数据等需要联网查询的问题，包含 web_search
4. 一个问题可能需要多种类型的知识支持
5. 分析时要考虑上下文和语义

请返回JSON格式结果，包含:
<ai-ctx-json>
{
  "types": ["direct_answer", "search_knowledge", "web_search"],
  "confidence": 0-1 的置信度,
  "reasoning": 分类原因,
  "searchQuery": 如果需要搜索，提供优化后的搜索关键词
}
</ai-ctx-json>
必须使用 <ai-ctx-json> 标签包裹 JSON 结果。`
        },
        {
          role: 'user',
          content: input
        }
      ], {
        onChunk: (chunk) => {
          response += chunk;
        },
        model: 'google/gemini-2.0-flash-001'
      });

      // 移除思考内容
      response = response.replace(/<think>[\s\S]*?<\/think>/g, '');

      api.log.info('移除思考内容后的响应', {
        cleanedResponse: response
      });

      const match = response.match(/<ai-ctx-json>(.*?)<\/ai-ctx-json>/s);
      if (!match) {
        api.log.warn('AI响应中未找到JSON标记', {
          originalResponse: response
        });
        return this.getDefaultResult();
      }

      try {
        const result = JSON.parse(match[1]);

        // 如果网络搜索未启用，移除 web_search 类型
        if (!this.config.webSearchEnabled) {
          result.types = result.types.filter(type => type !== 'web_search');
          result.reasoning += ' (网络搜索未启用)';
        }

        api.log.info('输入分类完成', {
          input,
          result,
          webSearchEnabled: this.config.webSearchEnabled
        });

        return {
          types: result.types,
          confidence: result.confidence,
          requiredActions: result.types,
          reasoning: result.reasoning,
          searchQuery: result.searchQuery
        };
      } catch (parseError) {
        api.log.error('JSON解析失败', {
          error: parseError.message,
          jsonContent: match[1]
        });
        return this.getDefaultResult();
      }

    } catch (error) {
      api.log.error('输入分类失败', {
        input,
        error: error.message
      });
      return this.getDefaultResult();
    }
  }

  private getDefaultResult(): ClassificationResult {
    return {
      types: ['search_knowledge'],
      confidence: 1,
      requiredActions: ['search_knowledge'],
      reasoning: '默认使用知识库检索',
      searchQuery: ''
    };
  }

  updateConfig(newConfig: Partial<ClassifierConfig>) {
    this.config = {
      ...this.config,
      ...newConfig
    };
    api.log.info('更新分类器配置', { newConfig });
  }

  setWebSearchEnabled(enabled: boolean) {
    this.config.webSearchEnabled = enabled;
    api.log.info('更新网络搜索状态', { enabled });
  }

  isWebSearchEnabled() {
    return this.config.webSearchEnabled;
  }
}

const inputClassifierService = new InputClassifierService();
context.wpm.export('service_input_classifier', inputClassifierService);
</mo-ai-code>
```

```jsx
<mo-ai-code type="service" name="service_knowledge" title="知识库服务">
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

const { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Modal, ModalBody, ModalContent, useDisclosure } = NextUI;

class KnowledgeService {
  static INDEX_KEY = `${appId}_knowledge_indices`;
  static DETAIL_KEY = `${appId}_knowledge_details`;

  async getIndices() {
    try {
      api.log.info('开始获取知识块索引');
      const result = await api.getMetadata([KnowledgeService.INDEX_KEY]);
      const data = JSON.parse(result.data?.[0]?.value);

      if (!data?.indices) {
        api.log.info('知识库为空，初始化空索引');
        return [];
      }

      api.log.info('成功获取知识块索引', {
        count: data.indices.length
      });

      return data.indices;
    } catch (error) {
      api.log.error('获取知识块索引失败', { error: error.message });
      throw error;
    }
  }

  async getDetail(id) {
    try {
      api.log.info('获取知识块详情', { id });
      const result = await api.getMetadata([`${KnowledgeService.DETAIL_KEY}_${id}`]);
      const detail = JSON.parse(result.data?.[0]?.value);

      if (!detail) {
        api.log.warn('未找到知识块详情', { id });
        return null;
      }

      api.log.info('成功获取知识块详情', { id, type: detail.type });
      return detail;
    } catch (error) {
      api.log.error('获取知识块详情失败', { id, error: error.message });
      throw error;
    }
  }

  async saveKnowledge(detail) {
    try {
      api.log.info('开始保存知识块', { id: detail.id, type: detail.type });

      const currentIndices = await this.getIndices();

      await api.setMetadata(`${KnowledgeService.DETAIL_KEY}_${detail.id}`, detail);

      const index = {
        id: detail.id,
        title: detail.title,
        description: detail.description,
        type: detail.type,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
        createdBy: detail.createdBy
      };

      const indexPosition = currentIndices.findIndex(i => i.id === detail.id);
      let newIndices;

      if (indexPosition >= 0) {
        newIndices = [
          ...currentIndices.slice(0, indexPosition),
          index,
          ...currentIndices.slice(indexPosition + 1)
        ];
      } else {
        newIndices = [...currentIndices, index];
      }

      await api.setMetadata(KnowledgeService.INDEX_KEY, { indices: newIndices });

      api.log.info('知识块保存成功', {
        id: detail.id,
        type: detail.type,
        totalIndices: newIndices.length
      });

      return detail;
    } catch (error) {
      api.log.error('保存知识块失败', { id: detail.id, error: error.message });
      throw error;
    }
  }

  async deleteKnowledge(id) {
    try {
      api.log.info('开始删除知识块', { id });

      const currentIndices = await this.getIndices();
      await api.setMetadata(`${KnowledgeService.DETAIL_KEY}_${id}`, null);
      const newIndices = currentIndices.filter(i => i.id !== id);
      await api.setMetadata(KnowledgeService.INDEX_KEY, { indices: newIndices });

      api.log.info('知识块删除成功', {
        id,
        remainingIndices: newIndices.length
      });

      return true;
    } catch (error) {
      api.log.error('删除知识块失败', { id, error: error.message });
      throw error;
    }
  }

  async batchDeleteKnowledge(ids) {
    try {
      api.log.info('开始批量删除知识块', { ids });

      const currentIndices = await this.getIndices();
      await Promise.all(
        ids.map(id => api.setMetadata(`${KnowledgeService.DETAIL_KEY}_${id}`, null))
      );

      const newIndices = currentIndices.filter(i => !ids.includes(i.id));
      await api.setMetadata(KnowledgeService.INDEX_KEY, { indices: newIndices });

      api.log.info('批量删除知识块成功', {
        deletedCount: ids.length,
        remainingIndices: newIndices.length
      });

      return true;
    } catch (error) {
      api.log.error('批量删除知识块失败', {
        ids,
        error: error.message
      });
      throw error;
    }
  }

  async uploadImage(file) {
    try {
      api.log.info('开始上传图片', { fileName: file.name });
      const result = await api.upload.uploadFile(file, {
        uploadType: 'image',
        maxSize: 5 * 1024 * 1024,
        cropOptions: { quality: 0.8 }
      });
      api.log.info('图片上传成功', { fileUrl: result.fileUrl });
      return result.fileUrl;
    } catch (error) {
      api.log.error('图片上传失败', { fileName: file.name, error: error.message });
      throw error;
    }
  }

  generateIndexText(indices) {
    api.log.info('生成知识库索引文本', { indexCount: indices.length });

    return indices.map(index =>
      `[${index.id}] ${index.title} (${index.type}): ${index.description}`
    ).join('\n');
  }
}

const knowledgeService = new KnowledgeService();
context.wpm.export('service_knowledge', knowledgeService);
</mo-ai-code>
```

```jsx
<mo-ai-code type="service" name="service_user" title="用户服务">
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

class UserService {
  // 元数据键名
  static LOG_KEY = `${appId}_operation_logs`;

  // 获取当前用户信息
  async getCurrentUser() {
    try {
      api.log.info('开始获取当前用户信息');
      const userInfo = await api.getCurrentAccountInfo();

      api.log.info('获取当前用户信息成功', {
        userId: userInfo.id,
        account: userInfo.account
      });

      return userInfo;
    } catch (error) {
      api.log.error('获取当前用户信息失败', {
        error: error.message
      });
      throw error;
    }
  }

  // 记录操作日志
  async logOperation(operation: string, target: string, targetId: string, detail: string) {
    try {
      api.log.info('开始记录操作日志', {
        operation,
        target,
        targetId
      });

      const userInfo = await this.getCurrentUser();
      const logs = await this.getLogs();

      const newLog = {
        id: `log_${Date.now()}`,
        userId: userInfo.id,
        userName: userInfo.name,
        operation,
        target,
        targetId,
        detail,
        createdAt: new Date().toISOString(),
        ip: await this.getClientIP()
      };

      await api.setMetadata(UserService.LOG_KEY, {
        logs: [newLog, ...logs]
      });

      api.log.info('操作日志记录成功', {
        logId: newLog.id,
        userId: userInfo.id
      });

      return newLog;
    } catch (error) {
      api.log.error('记录操作日志失败', {
        error: error.message,
        operation,
        target,
        targetId
      });
      throw error;
    }
  }

  // 获取操作日志
  async getLogs(params?: LogQueryParams): Promise<LogQueryResult> {
    try {
      api.log.info('开始获取操作日志', { params });

      const result = await api.getMetadata([UserService.LOG_KEY]);
      let logs = (JSON.parse(result.data?.[0]?.value || '{"logs":[]}').logs || []) as OperationLog[];

      // 过滤
      if (params) {
        if (params.userId) {
          logs = logs.filter(log => log.userId === params.userId);
        }
        if (params.operation) {
          logs = logs.filter(log => log.operation === params.operation);
        }
        if (params.startTime) {
          logs = logs.filter(log => log.createdAt >= params.startTime);
        }
        if (params.endTime) {
          logs = logs.filter(log => log.createdAt <= params.endTime);
        }
      }

      // 分页
      const total = logs.length;
      const start = (params?.page - 1) * params?.pageSize || 0;
      const end = start + (params?.pageSize || 10);
      logs = logs.slice(start, end);

      api.log.info('获取操作日志成功', {
        total,
        filteredCount: logs.length
      });

      return {
        logs,
        total,
        page: params?.page || 1,
        pageSize: params?.pageSize || 10
      };
    } catch (error) {
      api.log.error('获取操作日志失败', {
        error: error.message,
        params
      });
      throw error;
    }
  }

  // 获取客户端IP
  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      api.log.warn('获取客户端IP失败', {
        error: error.message
      });
      return 'unknown';
    }
  }
}

const userService = new UserService();
context.wpm.export('service_user', userService);
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

const chatHistoryService = await context.wpm.import('service_chat_history');
const knowledgeStore = await context.wpm.import('store_knowledge');
const inputClassifierService = await context.wpm.import('service_input_classifier');
const chatHistoryStore = await context.wpm.import('store_chat_history');

class ChatStore {
  messages = [];
  loading = false;
  searching = false;
  messageIdCounter = 0;
  cardIdCounter = 0;
  tempResponse = '';

  constructor() {
    makeAutoObservable(this);
  }

  generateMessageId = () => {
    return `msg_${Date.now()}_${this.messageIdCounter++}`;
  }

  generateCardId = () => {
    return `card_${Date.now()}_${this.cardIdCounter++}`;
  }

  addMessage = (message) => {
    const messageId = this.generateMessageId();
    this.messages.push({
      ...message,
      id: messageId,
      timestamp: new Date().toISOString(),
      cards: []
    });

    api.log.info('添加新消息', {
      messageId,
      role: message.role,
      phase: message.phase
    });

    return messageId;
  }

  addCard = (messageId, card) => {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      const cardId = this.generateCardId();
      message.cards.push({
        ...card,
        id: cardId,
        completed: false
      });

      api.log.info('添加消息卡片', {
        messageId,
        cardId,
        type: card.type
      });

      return cardId;
    }
  }

  updateCard = (messageId, cardId, updates) => {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      const card = message.cards.find(c => c.id === cardId);
      if (card) {
        Object.assign(card, updates);
      }
    }
  }

  updateMessage = (messageId, updates) => {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      Object.assign(message, updates);
    }
  }

  clearMessages = async () => {
    try {
      api.log.info('开始清空对话', {
        messageCount: this.messages.length
      });

      if (this.messages.length > 0) {
        await chatHistoryService.saveHistory(this.messages);
        await chatHistoryStore.loadHistories();
      }

      runInAction(() => {
        this.messages = [];
        this.messageIdCounter = 0;
        this.cardIdCounter = 0;
        this.tempResponse = '';
      });

      api.log.info('对话已清空');
    } catch (error) {
      api.log.error('清空对话失败', {
        error: error.message
      });
      message.error('清空对话失败');
      throw error;
    }
  }

  searchWeb = async (query) => {
    try {
      api.log.info('开始网络搜索', { query });

      const { results } = await api.searchExa(query);

      if (!results || !Array.isArray(results)) {
        api.log.warn('网络搜索结果格式异常', {
          results
        });
        throw new Error('搜索结果格式异常');
      }

      const formattedResults = results.map(result => ({
        title: result.title || '网页内容',
        content: result.text || result.content || '',
        url: result.url || '#'
      }));

      api.log.info('格式化后的搜索结果', {
        formattedResults
      });

      return {
        query,
        results: formattedResults,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      api.log.error('网络搜索失败', {
        query,
        error: error.message
      });
      throw error;
    }
  }

  sendMessage = async (content) => {
    try {
      this.loading = true;

      api.log.info('发送新消息', { content });

      const userMessageId = this.addMessage({
        role: 'user',
        content,
        phase: 'completed'
      });

      const aiMessageId = this.addMessage({
        role: 'ai',
        content: '',
        phase: 'thinking'
      });

      // 添加思考卡片
      const thinkCardId = this.addCard(aiMessageId, {
        type: 'think',
        content: '正在思考...'
      });

      // 对输入进行分类
      const classification = await inputClassifierService.classifyInput(content);

      api.log.info('输入分类结果', {
        messageId: aiMessageId,
        classification
      });

      let context = '';
      let searchResult = null;
      let webSearchResult = null;

      // 并行执行知识库搜索和网络搜索
      const searchTasks = [];

      // 知识库搜索
      if (classification.types.includes('search_knowledge')) {
        const searchCardId = this.addCard(aiMessageId, {
          type: 'search',
          content: '正在检索知识库...'
        });

        searchTasks.push(
          this.searchKnowledge(content).then(result => {
            searchResult = result;
            this.updateCard(aiMessageId, searchCardId, {
              content: result.found
                ? `找到 ${result.details.length} 条相关知识`
                : '未找到相关知识',
              completed: true
            });
            runInAction(() => {
              const message = this.messages.find(m => m.id === aiMessageId);
              if (message) {
                message.searchResult = searchResult;
              }
            });
          })
        );
      }

      // 网络搜索
      if (classification.types.includes('web_search') && inputClassifierService.isWebSearchEnabled()) {
        const webSearchCardId = this.addCard(aiMessageId, {
          type: 'web_search',
          content: '正在搜索网络...'
        });

        searchTasks.push(
          this.searchWeb(classification.searchQuery || content).then(result => {
            webSearchResult = result;
            this.updateCard(aiMessageId, webSearchCardId, {
              content: `找到 ${result.results.length} 条网络内容`,
              completed: true
            });
            runInAction(() => {
              const message = this.messages.find(m => m.id === aiMessageId);
              if (message) {
                message.webSearchResult = webSearchResult;
                api.log.info('更新网络搜索结果', {
                  messageId: aiMessageId,
                  webSearchResult
                });
              }
            });
          }).catch(error => {
            api.log.error('网络搜索失败', {
              error: error.message,
              query: classification.searchQuery
            });
            this.updateCard(aiMessageId, webSearchCardId, {
              content: '网络搜索失败',
              completed: true,
              error: true,
              errorMessage: error.message
            });
          })
        );
      }

      // 等待所有搜索任务完成
      await Promise.all(searchTasks);

      // 构建上下文
      if (searchResult?.found) {
        context += `基于以下知识来回答问题:
${searchResult.details.map(detail => `
标题: ${detail.title}
内容: ${detail.content || detail.imageUrl}
`).join('\n')}`;
      }

      if (webSearchResult?.results.length > 0) {
        context += `\n基于以下网络内容来回答问题:
${webSearchResult.results.map(result => `
标题: ${result.title}
内容: ${result.content}
来源: ${result.url}
`).join('\n')}`;
      }

      this.updateCard(aiMessageId, thinkCardId, {
        content: '思考完成',
        completed: true
      });

      // 添加回答卡片
      const answerCardId = this.addCard(aiMessageId, {
        type: 'answer',
        content: ''
      });

      if (!context) {
        context = classification.types.includes('direct_answer')
          ? '请直接回答用户的问题。'
          : '我没有找到相关的信息，我将基于我的基础知识来回答。';
      }

      let currentContent = '';

      await ai.chat([
        {
          role: 'system',
          content: `你是一个企业知识助手。今天是${new Date()} ${context}`
        },
        {
          role: 'user',
          content
        }
      ], {
        onChunk: (chunk) => {
          runInAction(() => {
            currentContent += chunk;
            this.updateCard(aiMessageId, answerCardId, {
              content: currentContent
            });
          });
        },
        onResult: () => {
          api.log.info('AI对话完成', {
            messageId: aiMessageId
          });

          runInAction(() => {
            this.updateCard(aiMessageId, answerCardId, {
              completed: true
            });
          });
        },
        onError: (error) => {
          api.log.error('AI对话失败', {
            error: error.message,
            messageId: aiMessageId
          });

          runInAction(() => {
            this.updateCard(aiMessageId, answerCardId, {
              error: true,
              errorMessage: error.message
            });
          });
        },
        model:'hs/deepseek-r1'
      });

    } catch (error) {
      api.log.error('发送消息失败', {
        error: error.message,
        content
      });
      message.error('发送失败');
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  searchKnowledge = async (query) => {
    try {
      this.searching = true;
      this.tempResponse = '';

      if (!knowledgeStore.initialized) {
        await knowledgeStore.initialize();
      }

      const indexText = knowledgeStore.getIndexText();

      api.log.info('开始搜索知识库', {
        query,
        indexCount: knowledgeStore.indices.length
      });

      let knowledgeIds = [];

      await ai.chat([
        {
          role: 'system',
          content: `你是一个知识库检索助手。根据用户的问题，从下面的知识库索引中找出相关的知识ID:
知识库索引:
${indexText}

请返回一个JSON数组，包含相关知识的ID。如果没有找到相关知识，返回空数组。
格式要求：必须使用 <ai-ctx-json> 标签包裹 JSON 数组。
示例：<ai-ctx-json>["id1", "id2"]</ai-ctx-json>`
        },
        {
          role: 'user',
          content: query
        }
      ], {
        onChunk: (chunk) => {
          runInAction(() => {
            this.tempResponse += chunk;
          });
        },
        onResult: async () => {
          try {
            const match = this.tempResponse.match(/<ai-ctx-json>(.*?)<\/ai-ctx-json>/s);
            if (match) {
              knowledgeIds = JSON.parse(match[1]);
            }
          } catch (error) {
            api.log.error('解析知识ID失败', {
              error: error.message,
              response: this.tempResponse
            });
            throw new Error('解析知识ID失败: ' + error.message);
          }
        },
        model:"hs/deepseek-r1"
      });

      const details = await Promise.all(
        knowledgeIds.map(id => knowledgeStore.loadDetail(id))
      ).then(results => results.filter(Boolean));

      return {
        found: details.length > 0,
        details
      };

    } catch (error) {
      api.log.error('知识库检索失败', {
        error: error.message,
        query
      });
      throw error;
    } finally {
      runInAction(() => {
        this.searching = false;
        this.tempResponse = '';
      });
    }
  }
}

const chatStore = new ChatStore();
context.wpm.export('store_chat', chatStore);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_chat_history" title="对话历史记录状态管理">
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

const chatHistoryService = await context.wpm.import('service_chat_history');

class ChatHistoryStore {
  histories = [];
  loading = false;
  error = null;
  selectedId = null;

  constructor() {
    makeAutoObservable(this);
    this.loadHistories();
  }

  async loadHistories() {
    try {
      this.loading = true;
      api.log.info('开始加载对话历史列表');

      const histories = await chatHistoryService.getHistories();

      runInAction(() => {
        this.histories = histories;
        this.error = null;
      });

      api.log.info('对话历史列表加载成功', {
        historyCount: histories.length
      });
    } catch (error) {
      api.log.error('加载对话历史列表失败', {
        error: error.message
      });
      runInAction(() => {
        this.error = error.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async saveHistory(messages) {
    try {
      api.log.info('开始保存当前对话');
      const historyId = await chatHistoryService.saveHistory(messages);
      await this.loadHistories();

      api.log.info('当前对话保存成功', { historyId });
      return historyId;
    } catch (error) {
      api.log.error('保存当前对话失败', {
        error: error.message
      });
      throw error;
    }
  }

  async deleteHistory(id) {
    try {
      api.log.info('开始删除对话历史', { id });

      await chatHistoryService.deleteHistory(id);
      await this.loadHistories();

      if (this.selectedId === id) {
        this.selectedId = null;
      }

      api.log.info('对话历史删除成功', { id });
    } catch (error) {
      api.log.error('删除对话历史失败', {
        id,
        error: error.message
      });
      throw error;
    }
  }

  setSelectedId(id) {
    this.selectedId = id;
  }
}

const chatHistoryStore = new ChatHistoryStore();
context.wpm.export('store_chat_history', chatHistoryStore);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_knowledge" title="知识库状态管理">
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

const knowledgeService = await context.wpm.import('service_knowledge');

class KnowledgeStore {
  indices = [];
  currentDetail = null;
  loading = false;
  error = null;
  initialized = false;
  selectedIds = new Set();
  batchDeleting = false;
  filterType = 'all';
  saveLoading = false;
  deleteLoading = null;
  tableLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async initialize() {
    if (this.initialized) {
      api.log.info('知识库已初始化，跳过');
      return;
    }

    try {
      this.tableLoading = true;
      api.log.info('开始初始化知识库');

      const indices = await knowledgeService.getIndices();

      runInAction(() => {
        this.indices = indices;
        this.initialized = true;
        this.error = null;
      });

      api.log.info('知识库初始化完成', {
        indicesCount: indices.length
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.initialized = false;
      });
      api.log.error('知识库初始化失败', { error: error.message });
      message.error('加载知识库失败');
    } finally {
      runInAction(() => {
        this.tableLoading = false;
      });
    }
  }

  async loadDetail(id) {
    if (!id) {
      api.log.warn('loadDetail: id is empty');
      return null;
    }

    try {
      this.loading = true;
      api.log.info('开始加载知识详情', { id });

      const detail = await knowledgeService.getDetail(id);

      runInAction(() => {
        this.currentDetail = detail;
        this.error = null;
      });

      api.log.info('知识详情加载完成', {
        id,
        type: detail?.type,
        hasDetail: !!detail
      });

      return detail; // 返回加载的详情数据

    } catch (error) {
      runInAction(() => this.error = error.message);
      api.log.error('加载知识详情失败', {
        id,
        error: error.message
      });
      message.error('加载详情失败');
      return null;
    } finally {
      runInAction(() => this.loading = false);
    }
  }

  async createKnowledge(data) {
    try {
      this.saveLoading = true;
      const detail = {
        ...data,
        id: `kb_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const saved = await knowledgeService.saveKnowledge(detail);

      runInAction(() => {
        this.indices = [...this.indices, {
          id: saved.id,
          title: saved.title,
          description: saved.description,
          type: saved.type,
          createdAt: saved.createdAt,
          updatedAt: saved.updatedAt
        }];
        this.currentDetail = saved;
      });

      message.success('创建成功');
    } catch (error) {
      message.error('创建失败');
      throw error;
    } finally {
      runInAction(() => this.saveLoading = false);
    }
  }

  async updateKnowledge(id, updates) {
    try {
      this.saveLoading = true;
      const detail = {
        ...this.currentDetail,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      const saved = await knowledgeService.saveKnowledge(detail);

      runInAction(() => {
        const index = this.indices.findIndex(i => i.id === id);
        if (index >= 0) {
          this.indices[index] = {
            id: saved.id,
            title: saved.title,
            description: saved.description,
            type: saved.type,
            createdAt: saved.createdAt,
            updatedAt: saved.updatedAt
          };
        }
        this.currentDetail = saved;
      });

      message.success('更新成功');
    } catch (error) {
      message.error('更新失败');
      throw error;
    } finally {
      runInAction(() => this.saveLoading = false);
    }
  }

  async deleteKnowledge(id) {
    try {
      this.deleteLoading = id;
      api.log.info('开始删除知识块', { id });

      await knowledgeService.deleteKnowledge(id);

      runInAction(() => {
        this.indices = this.indices.filter(i => i.id !== id);
        if (this.currentDetail?.id === id) {
          this.currentDetail = null;
        }
      });

      message.success('删除成功');
      api.log.info('知识块删除成功', { id });
    } catch (error) {
      api.log.error('删除知识块失败', { id, error: error.message });
      message.error('删除失败');
    } finally {
      runInAction(() => {
        this.deleteLoading = null;
      });
    }
  }

  async batchDeleteKnowledge() {
    if (this.selectedIds.size === 0) return;

    try {
      this.batchDeleting = true;
      const ids = Array.from(this.selectedIds);

      api.log.info('开始批量删除知识块', {
        selectedCount: ids.length
      });

      await knowledgeService.batchDeleteKnowledge(ids);

      runInAction(() => {
        this.indices = this.indices.filter(i => !ids.includes(i.id));
        if (this.currentDetail && ids.includes(this.currentDetail.id)) {
          this.currentDetail = null;
        }
        this.selectedIds.clear();
      });

      message.success(`成功删除 ${ids.length} 条记录`);

      api.log.info('批量删除完成', {
        deletedCount: ids.length,
        remainingCount: this.indices.length
      });

    } catch (error) {
      api.log.error('批量删除失败', {
        error: error.message,
        selectedCount: this.selectedIds.size
      });
      message.error('批量删除失败');
    } finally {
      runInAction(() => {
        this.batchDeleting = false;
      });
    }
  }

  setSelectedIds(ids) {
    this.selectedIds = new Set(ids);
  }

  setFilterType(type) {
    this.filterType = type;
  }

  get filteredIndices() {
    if (this.filterType === 'all') {
      return this.indices;
    }
    return this.indices.filter(index => index.type === this.filterType);
  }

  getIndexText() {
    return knowledgeService.generateIndexText(this.indices);
  }
}

const knowledgeStore = new KnowledgeStore();
context.wpm.export('store_knowledge', knowledgeStore);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_user" title="用户状态管理">
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

// 导入服务
const userService = await context.wpm.import('service_user');

class UserStore {
  currentUser: UserInfo | null = null;
  loading = false;
  initialized = false;

  constructor() {
    makeAutoObservable(this);
    this.initialize();
  }

  // 初始化用户信息
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      this.loading = true;
      const userInfo = await userService.getCurrentUser();

      runInAction(() => {
        this.currentUser = userInfo;
        this.initialized = true;
      });

      api.log.info('用户信息初始化成功', {
        userId: userInfo.id,
        account: userInfo.account
      });
    } catch (error) {
      api.log.error('用户信息初始化失败', {
        error: error.message
      });
      message.error('获取用户信息失败');
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // 记录操作日志
  async logOperation(operation: string, target: string, targetId: string, detail: string) {
    try {
      await userService.logOperation(operation, target, targetId, detail);
    } catch (error) {
      api.log.error('记录操作日志失败', {
        error: error.message,
        operation,
        target,
        targetId
      });
    }
  }

  // 获取操作日志
  async getLogs(params: LogQueryParams) {
    try {
      return await userService.getLogs(params);
    } catch (error) {
      api.log.error('获取操作日志失败', {
        error: error.message,
        params
      });
      throw error;
    }
  }
}

const userStore = new UserStore();
context.wpm.export('store_user', userStore);
</mo-ai-code>
```

```jsx
<mo-ai-code type="ts-type" name="types_chat" title="对话类型定义">
// 消息阶段类型
type MessagePhase =
  | 'searching'   // 检索知识库
  | 'thinking'    // 思考中
  | 'answering'   // 回答中
  | 'completed'   // 已完成
  | 'error'       // 错误

// 消息卡片类型
type MessageCard = {
  id: string
  type: 'search' | 'think' | 'answer'
  content: string
  completed: boolean
  error?: boolean
  errorMessage?: string
}

// 消息类型
type ChatMessage = {
  id: string
  role: 'user' | 'ai'
  content: string
  phase: MessagePhase
  timestamp: string
  cards: MessageCard[]
  error?: boolean
  errorMessage?: string
  searchResult?: {
    found: boolean
    details?: any[]
  }
}

// 历史对话记录
type ChatHistory = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}
</mo-ai-code>
```

```jsx
<mo-ai-code type="ts-type" name="types_chat_history" title="对话历史记录类型定义">
// 对话历史记录类型
type ChatHistory = {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

// 历史记录列表状态
type ChatHistoryState = {
  histories: ChatHistory[]
  loading: boolean
  error: string | null
  selectedId: string | null
}

// 工具栏状态
type ToolbarState = {
  expanded: boolean
  saving: boolean
  clearing: boolean
}
</mo-ai-code>
```

```jsx
<mo-ai-code type="ts-type" name="types_input_classifier" title="输入分类器类型定义">
// 行为类型枚举
type ActionType =
  | 'direct_answer'    // 直接回答
  | 'search_knowledge' // 检索知识库
  | 'web_search'      // 网络搜索
  | 'read_data'       // 读取数据
  | 'unknown'         // 未知类型

// 分类结果
type ClassificationResult = {
  types: ActionType[]         // 支持多个行为类型
  confidence: number         // 置信度 0-1
  requiredActions: string[]  // 需要执行的行为列表
  reasoning: string         // 分类原因
  searchQuery?: string      // 搜索关键词
}

// 分类器配置
type ClassifierConfig = {
  minConfidence: number    // 最小置信度
  enabledActions: string[] // 启用的行为列表
  webSearchEnabled: boolean // 是否启用网络搜索
}

// 网络搜索结果
type WebSearchResult = {
  query: string
  results: {
    title: string
    content: string
    url: string
  }[]
  timestamp: string
}
</mo-ai-code>
```

```jsx
<mo-ai-code type="ts-type" name="types_knowledge" title="知识库类型定义">
// 知识类型枚举
type KnowledgeType = 'document' | 'image'

// 知识块索引类型
type KnowledgeIndex = {
  id: string
  title: string
  description: string
  type: KnowledgeType
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    avatar?: string
  }
}

// 文档类型知识
type DocumentKnowledge = {
  id: string
  type: 'document'
  title: string
  description: string
  content: string
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    avatar?: string
  }
}

// 图片类型知识
type ImageKnowledge = {
  id: string
  type: 'image'
  title: string
  description: string
  imageUrl: string
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    avatar?: string
  }
}

// 知识详情联合类型
type KnowledgeDetail = DocumentKnowledge | ImageKnowledge

// 知识库状态类型
type KnowledgeState = {
  indices: KnowledgeIndex[]
  currentDetail: KnowledgeDetail | null
  loading: boolean
  error: string | null
}

// 编辑器状态类型
type EditorState = {
  type: KnowledgeType
  title: string
  description: string
  content?: string
  imageUrl?: string
  dirty: boolean
}
</mo-ai-code>
```

```jsx
<mo-ai-code type="ts-type" name="types_user" title="用户类型定义">
// 用户信息类型
type UserInfo = {
  id: string
  name: string
  account: string
  avatar?: string
  organizationId: string
  groupId: string | null
  phone: string
  createdAt: string
  updatedAt: string
  active: boolean
}

// 操作日志类型
type OperationLog = {
  id: string
  userId: string
  userName: string
  operation: string
  target: string
  targetId: string
  detail: string
  createdAt: string
  ip?: string
}

// 操作日志查询参数
type LogQueryParams = {
  userId?: string
  operation?: string
  startTime?: string
  endTime?: string
  page: number
  pageSize: number
}

// 操作日志查询结果
type LogQueryResult = {
  logs: OperationLog[]
  total: number
  page: number
  pageSize: number
}
</mo-ai-code>
```
