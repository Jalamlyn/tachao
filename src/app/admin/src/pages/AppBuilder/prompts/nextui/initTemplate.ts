// 多页应用模板（带路由）
export const multiPageTemplate = `让我们开始创建一个多页应用。

<mo-ai-code type="markdown" name="readme" title="应用说明文档">
# 多页应用说明文档

## 简介
这是一个使用 AI 助手创建的多页应用程序。该应用采用现代化的技术栈和组件库，提供了良好的用户界面和交互体验。

## 功能特性
- 多页面路由：使用 React Router 进行页面导航
- 响应式设计：适配不同屏幕尺寸
- 现代化UI：使用 NextUI 组件库
- 状态管理：采用 MobX 进行状态管理

## 项目结构
\`\`\`
├── App.jsx          # 应用入口（包含路由配置）
└── pages/
    └── HomePage/    # 首页模块
\`\`\`

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
欢迎提供建议和反馈，一起改进这个应用！
</mo-ai-code>

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
  Card, CardHeader, CardBody, CardFooter,
  useToast
} = NextUI;

// 导入首页模块
const HomePage = await context.wpm.import('page_home');

// 序列化错误对象，确保只包含可序列化的信息
const serializeError = (error) => {
  if (!error) {
    return { message: "Unknown error" };
  }

  // 如果是普通的错误信息字符串
  if (typeof error === 'string') {
    return { message: error };
  }

  // 如果是 Error 对象，提取关键信息
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  // 如果是其他类型的对象，尝试安全地序列化
  try {
    const serialized = JSON.parse(JSON.stringify(error));
    return {
      type: typeof error,
      value: serialized
    };
  } catch {
    // 如果无法序列化，返回基本信息
    return {
      type: typeof error,
      message: String(error)
    };
  }
};

// 创建错误处理函数
const handleError = (error, errorInfo = {}) => {
  // 序列化错误信息
  const serializedError = serializeError(error);
  const serializedInfo = serializeError(errorInfo);

  // 使用API上报错误日志，确保只传递可序列化的数据
  context.api.log.error("应用运行时错误", {
    error: serializedError,
    info: serializedInfo,
    timestamp: new Date().toISOString(),
    location: window.location.href
  });

  // 显示错误提示给用户
  context.message.error("应用运行出现异常，请刷新页面重试")

  // 控制台输出完整错误信息（用于开发调试）
  console.error("Original error:", error);
  console.error("Serialized error:", serializedError);
};

// 全局错误处理
window.onerror = function (message, source, lineno, colno, error) {
    handleError(error, {
      type: 'window.onerror',
      source,
      lineno,
      colno,
      message
    });
    return false;
};

// 处理未捕获的Promise错误
window.onunhandledrejection = function (event) {
    handleError(event.reason, {
      type: 'unhandledRejection',
      promise: serializeError(event.promise)
    });
    event.preventDefault();
};

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
            这是一个使用AI助手创建的多页应用程序。您可以在左侧输入需求，让AI帮助您开发更多功能。
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

// 单页应用模板（不带路由）
export const singlePageTemplate = `让我们开始创建一个单页应用模块。

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
\`\`\`
├── App.jsx          # 应用入口（单一组件）
└── stores/         # 状态管理
\`\`\`

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
\`\`\`jsx
// 在多页应用中使用此模块
const YourModule = await wpm.import('your_module_id');

function ParentComponent() {
  return (
    <div>
      <YourModule />
    </div>
  );
}
\`\`\`

## 后续计划
- 优化组件性能
- 添加更多功能
- 完善文档说明

## 贡献指南
欢迎提供建议和反馈，一起改进这个模块！
</mo-ai-code>

\`\`\`jsx
<mo-ai-code type="app">
const { 
  wpm, 
  React, 
  observer, 
  NextUI,
  appId 
} = context;

const {
  Card, CardHeader, CardBody,
  useToast
} = NextUI;

// 序列化错误对象
const serializeError = (error) => {
  if (!error) {
    return { message: "Unknown error" };
  }

  if (typeof error === 'string') {
    return { message: error };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  try {
    const serialized = JSON.parse(JSON.stringify(error));
    return {
      type: typeof error,
      value: serialized
    };
  } catch {
    return {
      type: typeof error,
      message: String(error)
    };
  }
};

// 错误处理函数
const handleError = (error, errorInfo = {}) => {
  const serializedError = serializeError(error);
  const serializedInfo = serializeError(errorInfo);

  context.api.log.error("应用运行时错误", {
    error: serializedError,
    info: serializedInfo,
    timestamp: new Date().toISOString(),
    location: window.location.href
  });

  context.message.error("应用运行出现异常，请刷新页面重试")

  console.error("Original error:", error);
  console.error("Serialized error:", serializedError);
};

// 全局错误处理
window.onerror = function (message, source, lineno, colno, error) {
    handleError(error, {
      type: 'window.onerror',
      source,
      lineno,
      colno,
      message
    });
    return false;
};

window.onunhandledrejection = function (event) {
    handleError(event.reason, {
      type: 'unhandledRejection',
      promise: serializeError(event.promise)
    });
    event.preventDefault();
};

const App = observer(() => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex gap-3">
          <Icon icon="mdi:cube-outline" className="w-8 h-8 text-primary"/>
          <div className="flex flex-col">
            <p className="text-xl font-bold">单页模块</p>
            <p className="text-small text-default-500">Single Page Module</p>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-center text-default-600">
            这是一个独立的单页应用模块。您可以将其集成到多页应用中，或者作为独立模块使用。
          </p>
        </CardBody>
      </Card>
    </div>
  );
});

// 导出应用入口
context.wpm.export(appId, App);
</mo-ai-code>
\`\`\`
`

// 导出默认模板（向后兼容）
export const initialAIResponse = multiPageTemplate