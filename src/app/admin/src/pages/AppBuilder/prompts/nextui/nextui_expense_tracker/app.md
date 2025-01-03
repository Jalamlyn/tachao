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
  ai,
  mobx,
  appId
} = context;

const { Routes, Route, Navigate } = ReactRouterDom;

// 导入页面组件
const ExpensePage = await wpm.import('page_expense');

// 主应用组件
const App = observer(() => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="expense" replace />}
      />
      <Route
        path="expense"
        element={<ExpensePage />}
      />
    </Routes>
  );
});

wpm.export(appId, App);
</mo-ai-code>
```