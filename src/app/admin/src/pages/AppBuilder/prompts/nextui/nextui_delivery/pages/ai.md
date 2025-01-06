```jsx
<mo-ai-code type="page" name="page_ai" title="智能助手">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody } = NextUI;
const AIChat = await context.wpm.import('comp_ai_chat');

const AIPage = observer(() => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">智能助手</h1>
        <p className="mt-1 text-small text-default-500">
          您的专业送货顾问，随时为您解答问题
        </p>
      </div>

      <Card className="h-[calc(100vh-200px)]">
        <CardBody>
          <AIChat />
        </CardBody>
      </Card>
    </div>
  );
});

context.wpm.export('page_ai', AIPage);
</mo-ai-code>
```