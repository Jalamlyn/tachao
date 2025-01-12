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
const HomePage = await context.wpm.import('page_home')
const SettingsPage = await context.wpm.import('page_settings')
const NotFoundPage = await context.wpm.import('page_notFound')

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
context.wpm.export(appId, App);
</mo-ai-code>
\`\`\``,

  pageComponent: `4. 页面组件使用 <mo-ai-code type="page" name="page_xxx" title="xxx"></mo-ai-code> 包裹：
\`\`\`jsx
<mo-ai-code type="page" name="page_xxx" title="页面标题">
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
const SubComponent = await context.wpm.import('subComponent')
const todoStore = await context.wpm.import('todoStore');
const todoService = await context.wpm.import('todoService');

const PageComponent = observer(() => {
  return (
    <div>
        <SubComponent />
    </div>
  );
});

// 重要：必须导出页面组件，否则其他模块无法导入
context.wpm.export('page_xxx', PageComponent);
</mo-ai-code>
\`\`\``,
  componentRules: ``,
}