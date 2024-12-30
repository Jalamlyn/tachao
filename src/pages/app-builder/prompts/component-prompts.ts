export const COMPONENT_PROMPTS = {
  appEntry: `3. 应用入口组件示例：

\`\`\`jsx
<shata-ai-code type="app">
const { wpm, React, ReactRouterDom, observer, appId } = context;
const { Suspense } = React;
const { BrowserRouter, Routes, Route, Navigate } = ReactRouterDom;

// 使用 React.lazy 导入页面组件
const HomePage = React.lazy(() => wpm.import('homePage'));
const SettingsPage = React.lazy(() => wpm.import('settingsPage'));
const NotFoundPage = React.lazy(() => wpm.import('notFoundPage'));

// 加载状态组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = observer(() => {
  return (
    <BrowserRouter basename={\`/app-run/\${appId}\`}>
      <Routes>
        {/* 默认路由重定向 */}
        <Route 
          path="/" 
          element={<Navigate to="home" replace />} 
        />

        {/* 主页路由 */}
        <Route
          path="home"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <HomePage />
            </Suspense>
          }
        />

        {/* 设置页路由 */}
        <Route
          path="settings"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <SettingsPage />
            </Suspense>
          }
        />

        {/* 404路由 */}
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
});

// 重要：入口模块必须使用 context.appId 作为模块名
wpm.export(appId, App);
</shata-ai-code>
\`\`\``,

  pageComponent: `4. 页面组件使用 <shata-ai-code type="page" pageid="xxx" title="xxx"></shata-ai-code> 包裹：
\`\`\`jsx
<shata-ai-code type="page" pageid="page_xxx" title="页面标题">
const { wpm, React, observer } = context;
const { useState, useEffect } = React;

// 使用 React.lazy 导入其他组件
const SubComponent = React.lazy(() => wpm.import('subComponent'));

// 直接导入非组件模块
const todoStore = await wpm.import('todoStore');
const todoService = await wpm.import('todoService');

const PageComponent = observer(() => {
  return (
    <div>
      <React.Suspense fallback={<div>Loading...</div>}>
        <SubComponent />
      </React.Suspense>
    </div>
  );
});

wpm.export('page_xxx', PageComponent);
</shata-ai-code>
\`\`\``,

  storeTemplate: `5. Store 代码使用 <shata-ai-code type="store" name="xxx"></shata-ai-code> 包裹：
\`\`\`jsx
<shata-ai-code type="store" name="todoStore">
const { wpm, mobx } = context;
const { makeAutoObservable } = mobx;

// 直接导入其他模块
const todoService = await wpm.import('todoService');

class TodoStore {
    todos = []
    loading = false
    
    constructor() {
      makeAutoObservable(this)
    }
    
    async loadTodos() {
      this.loading = true
      try {
        const result = await todoService.getTodos()
        this.todos = result
      } finally {
        this.loading = false
      }
    }
}

const store = new TodoStore();
wpm.export('todoStore', store);
</shata-ai-code>
\`\`\``,

  serviceTemplate: `6. Service 代码使用 <shata-ai-code type="service" name="xxx"></shata-ai-code> 包裹：
\`\`\`jsx
<shata-ai-code type="service" name="todoService">
const { wpm, api } = context;
const { getMetadata, setMetadata } = api;

// 直接导入其他模块
const todoModule = await wpm.import('todoModule');

const service = {
  async getTodos() {
    const result = await getMetadata(['todos']);
    return result.data;
  },
  
  async saveTodo(todo) {
    await setMetadata('todos', todo);
  }
};

wpm.export('todoService', service);
</shata-ai-code>
\`\`\``,

  moduleTemplate: `7. Module 代码使用 <shata-ai-code type="module" name="xxx"></shata-ai-code> 包裰：
\`\`\`jsx
<shata-ai-code type="module" name="todoModule">
const { wpm } = context;

const module = {
  formatTodo(todo) {
    return {
      ...todo,
      createdAt: new Date(todo.createdAt).toLocaleString()
    }
  },
  
  validateTodo(todo) {
    return todo.title && todo.title.length >= 3
  }
};

wpm.export('todoModule', module);
</shata-ai-code>
\`\`\``,

  schemaTemplate: `8. Schema 代码使用 <shata-ai-code type="schema" name="xxx"></shata-ai-code> 包裹：
\`\`\`jsx
<shata-ai-code type="schema" name="todoSchema">
const {wpm} = context;

const schema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": {
      "type": "string"
    },
    "title": {
      "type": "string",
      "minLength": 3
    },
    "completed": {
      "type": "boolean",
      "default": false
    }
  },
  "required": ["id", "title"]
}

wpm.export('todoSchema', schema);

</shata-ai-code>
\`\`\``,

  componentRules: `9. 技术要求：
   - 入口模块(type="app")必须使用 context.appId 作为模块名
   - React组件使用 React.lazy 和 Suspense 实现动态加载
   - 非组件模块使用 await wpm.import 直接导入
   - 只能使用 NextUI 2.6.0 版本中实际存在的组件
   - 禁止使用 Container Grid Text 这些 NextUI V1 版本中的组件
   - 使用 tailwind css 编写样式代码
   - 动画使用 FramerMotion
   - 图标使用 @iconify/react 的 Icon 组件
   - 数据存储使用 getMetadata 和 setMetadata
   - Store 必须使用 MobX
   - Service 必须使用 appId 前缀
   - Module 只能包含纯函数
   - Schema 使用标准的 JSON Schema
   - 使用 wpm.export 导出模块
   - 使用 wpm.import 导入模块
   - 避免循环依赖`,
}