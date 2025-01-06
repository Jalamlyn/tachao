export const initialAIResponse = `让我们开始创建一个简单的欢迎页面应用。

\`\`\`jsx
<mo-ai-code type="app">
const { 
  wpm, 
  React, 
  ReactRouterDom, 
  observer, 
  NextUI,
  appId 
} = context;

const { Routes, Route, Navigate } = ReactRouterDom;
const {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Card, CardHeader, CardBody, CardFooter
} = NextUI

// 导入首页模块
const HomePage = await context.wpm.import('page_home')

const App = observer(() => {
  return (
    <Routes>
      {/* 默认路由重定向到首页 */}
      <Route 
        path="/" 
        element={<Navigate to="home" replace />} 
      />

      {/* 首页路由 */}
      <Route
        path="home"
        element={<HomePage />}
      />
    </Routes>
  );
});

// 导出应用入口
context.wpm.export(appId, App);
</mo-ai-code>

<mo-ai-code type="page" name="page_home" title="欢迎页面">
const { 
  wpm, 
  React, 
  observer, 
  NextUI,
  Icon
} = context;

const { Card, CardBody, CardHeader } = NextUI;

const HomePage = observer(() => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex gap-3">
          <Icon icon="mdi:hand-wave" className="w-8 h-8 text-primary"/>
          <div className="flex flex-col">
            <p className="text-xl font-bold">欢迎使用</p>
            <p className="text-small text-default-500">Welcome to Your App</p>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-center text-default-600">
            这是一个使用AI助手创建的应用程序。您可以在左侧输入需求，让AI帮助您开发更多功能。
          </p>
        </CardBody>
      </Card>
    </div>
  );
});

// 导出首页组件
context.wpm.export('page_home', HomePage);
</mo-ai-code>
\`\`\`
`
