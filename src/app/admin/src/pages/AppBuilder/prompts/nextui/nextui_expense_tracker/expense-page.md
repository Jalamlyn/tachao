```jsx
<mo-ai-code type="page" pageid="page_expense" title="智能记账助手">
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
  ai,
  mobx,
  appId
} = context;

const { useState, useEffect } = React;
const { Card, Input, Button, Spinner } = NextUI;

// 导入组件和store
const ExpenseForm = await wpm.import('comp_expense_form');
const expenseStore = await wpm.import('store_expense');
const expenseModule = await wpm.import('module_expense');

const ExpensePage = observer(() => {
  const [processing, setProcessing] = useState(false);
  const [textInput, setTextInput] = useState('');

  useEffect(() => {
    const init = async () => {
      await expenseStore.loadExpenseHistory();
    };
    init();
  }, []);

  const handleNaturalLanguageInput = async () => {
    if (!textInput.trim()) {
      message.warning('请输入消费记录');
      return;
    }

    setProcessing(true);
    try {
      await expenseModule.processNaturalLanguage(textInput);
      setTextInput('');
    } finally {
      setProcessing(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    setProcessing(true);
    try {
      await expenseModule.processReceiptImage(file);
    } finally {
      setProcessing(false);
    }
  };

  if (expenseStore.isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Spinner label="加载中..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">智能记账助手</h1>
          <p className="text-default-500">支持自然语言输入和小票识别</p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <Input
              value={textInput}
              label="自然语言输入"
              placeholder="例如: 昨天在星巴克买咖啡花了35元,用支付宝付的"
              variant="bordered"
              isDisabled={processing}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleNaturalLanguageInput();
                }
              }}
            />
            <Button
              color="primary"
              isLoading={processing}
              onPress={handleNaturalLanguageInput}
            >
              处理
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              id="receipt-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0])}
            />
            <Button
              as="label"
              htmlFor="receipt-upload"
              color="secondary"
              variant="flat"
              startContent={<Icon icon="solar:gallery-add-bold" />}
              isLoading={processing}
            >
              上传小票
            </Button>
            <span className="text-small text-default-500">
              支持图片格式: JPG, PNG
            </span>
          </div>
        </div>

        <ExpenseForm />

        {processing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="p-6">
              <div className="flex flex-col items-center gap-4">
                <Spinner />
                <p>正在处理中...</p>
              </div>
            </Card>
          </div>
        )}
      </Card>
    </div>
  );
});

wpm.export('page_expense', ExpensePage);
</mo-ai-code>
```