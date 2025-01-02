export const COMPONENT_PROMPTS = {
  appEntry: `3. 应用入口组件示例：

\`\`\`jsx
<mo-ai-code type="app">
// 解构所有可用的 context 依赖，即使暂时不使用也要保留，以便后续扩展
const { 
  wpm, 
  React, 
  ReactRouterDom, 
  observer, 
  appId, 
  Icon, 
  FramerMotion,
  NextUI,
  message,
  api,
  ai,
  mobx 
} = context;

const { Routes, Route, Navigate } = ReactRouterDom;

// 导入前必须确保这些页面模块已经创建并导出
const HomePage = await wpm.import('page_home')
const SettingsPage = await wpm.import('page_settings')
const NotFoundPage = await wpm.import('page_notFound')

// 加载状态组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  return (
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
              <HomePage />
          }
        />

        {/* 设置页路由 */}
        <Route
          path="settings"
          element={
              <SettingsPage />
          }
        />

        {/* 404路由 */}
        <Route
          path="*"
          element={
              <NotFoundPage />
          }
        />
      </Routes>
  );
};

// 重要：入口模块必须使用 context.appId 作为模块名
wpm.export(appId, App);
</mo-ai-code>
\`\`\``,

  pageComponent: `4. 页面组件使用 <mo-ai-code type="page" pageid="page_xxx" title="xxx"></mo-ai-code> 包裹：
\`\`\`jsx
<mo-ai-code type="page" pageid="page_xxx" title="页面标题">
// 解构所有可用的 context 依赖，即使暂时不使用也要保留，以便后续扩展
const { 
  wpm, 
  React, 
  observer, 
  Icon, 
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId 
} = context;

const { useState, useEffect } = React;

// 导入前必须确保这些模块已经创建并导出
const SubComponent = await wpm.import('subComponent')
const todoStore = await wpm.import('todoStore');
const todoService = await wpm.import('todoService');

const PageComponent = observer(() => {
  return (
    <div>
        <SubComponent />
    </div>
  );
});

// 重要：必须导出页面组件，否则其他模块无法导入
wpm.export('page_xxx', PageComponent);
</mo-ai-code>
\`\`\``,

  storeTemplate: `5. Store 代码使用 <mo-ai-code type="store" name="store_xxx"></mo-ai-code> 包裹：
\`\`\`jsx
<mo-ai-code type="store" name="store_todo">
// 解构所有可用的 context 依赖，即使暂时不使用也要保留，以便后续扩展
const { 
  wpm, 
  mobx,
  React, 
  observer, 
  Icon, 
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  api,
  ai,
  appId 
} = context;

const { makeAutoObservable } = mobx;

// 导入前必须确保 todoService 模块已经创建并导出
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
// 重要：必须导出 store 实例，否则其他模块无法导入
wpm.export('store_todo', store);
</mo-ai-code>
\`\`\``,

  serviceTemplate: `6. Service 代码使用 <mo-ai-code type="service" name="service_xxx"></mo-ai-code> 包裹：
\`\`\`jsx
<mo-ai-code type="service" name="service_todo">
// 解构所有可用的 context 依赖，即使暂时不使用也要保留，以便后续扩展
const { 
  wpm, 
  api,
  React, 
  observer, 
  Icon, 
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  ai,
  mobx,
  appId 
} = context;

const { getMetadata, setMetadata } = api;

// 导入前必须确保 todoModule 模块已经创建并导出
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

// 重要：必须导出 service 实例，否则其他模块无法导入
wpm.export('service_todo', service);
</mo-ai-code>
\`\`\``,

  moduleTemplate: `7. Module 代码使用 <mo-ai-code type="module" name="module_xxx"></mo-ai-code> 包裰：
\`\`\`jsx
<mo-ai-code type="module" name="module_todo">
// 解构所有可用的 context 依赖，即使暂时不使用也要保留，以便后续扩展
const { 
  wpm,
  React, 
  observer, 
  Icon, 
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId 
} = context;

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

// 重要：必须导出 module 实例，否则其他模块无法导入
wpm.export('module_todo', module);
</mo-ai-code>
\`\`\``,

  componentRules: `9. 技术要求：
   - 入口模块(type="app")必须使用 context.appId 作为模块名
   - 非组件模块使用 await wpm.import 直接导入
   - 只能使用 NextUI 2.6.0 版本中实际存在的组件
   - 禁止使用 Container Grid Text 这些 NextUI V1 版本中的组件
   - 使用 tailwind css 编写样式代码
   - 动画使用 FramerMotion
   - 图标使用 @iconify/react 的 Icon 组件, 从 context 中获取
   - 数据存储使用 getMetadata 和 setMetadata
   - Store 必须使用 MobX
   - Service 必须使用 appId 前缀
   - Module 只能包含纯函数
   - 使用 wpm.export 导出自定义模块
   - 使用 wpm.import 导入自定义模块,不能导入三方模块
   - 所有依赖都从 context 中获取, 不允许直接引入
   - observer 可以包裹初 type=app 以外的组件, 避免不必要的渲染
   - 避免循环依赖
   - 在使用 wpm.import 前必须确保模块已经导出
   - 检查所有导入模块的存在性
   - 按正确顺序创建和导出模块
   - 导航组件只能用 ReactRouterDom 的组件,比如 Link, NavLink 等
   - 必须在每个模块开头解构所有 context 依赖，即使暂时不使用也要保留，以便后续扩展`,
}