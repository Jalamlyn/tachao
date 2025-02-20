import { context } from "@/lib/context";

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

const { Card, CardBody, Input, Button, Avatar } = NextUI;
const { motion } = FramerMotion;

const ChatBox = observer(({ messages = [], onSend, loading, onTransferToHuman, needsHumanSupport }) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef(null);
  const chatContainerRef = React.useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  React.useEffect(() => {
    if (chatContainerRef.current) {
      api.log.info('聊天框尺寸', {
        height: chatContainerRef.current.offsetHeight,
        scrollHeight: chatContainerRef.current.scrollHeight
      });
    }
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="w-full h-full">
      <CardBody className="p-4 flex flex-col gap-4">
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-4 min-h-0"
        >
          {Array.isArray(messages) && messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-3",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.sender === 'ai' && (
                <Avatar
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=34&h=34"
                  size="sm"
                />
              )}
              <div className={cn(
                "max-w-[80%] p-3 rounded-lg",
                message.sender === 'user' 
                  ? "bg-primary text-white rounded-br-none"
                  : "bg-default-100 rounded-bl-none"
              )}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
              {message.sender === 'user' && (
                <Avatar
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=34&h=34"
                  size="sm"
                />
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {needsHumanSupport && (
          <Button
            color="primary"
            variant="flat"
            onPress={onTransferToHuman}
            startContent={<Icon icon="solar:user-rounded-bold-duotone" className="w-4 h-4" />}
            className="flex-shrink-0"
          >
            转接人工客服
          </Button>
        )}

        <div className="flex gap-2 flex-shrink-0">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            variant="bordered"
            size="lg"
            disabled={loading}
            className="flex-1"
          />
          <Button
            isIconOnly
            color="primary"
            size="lg"
            isLoading={loading}
            onPress={handleSend}
          >
            <Icon icon="solar:arrow-up-bold-duotone" className="w-5 h-5" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_chat_box', ChatBox);
ChatBox.displayName = 'ChatBox';