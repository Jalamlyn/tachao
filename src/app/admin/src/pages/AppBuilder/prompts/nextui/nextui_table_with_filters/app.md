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
const TablePage = await wpm.import('page_table');

// 主应用组件
const App = observer(() => {
  return (
    <div className="px-4 py-6">
      <Routes>
        <Route
          path="/"
          element={<Navigate to="table" replace />}
        />
        <Route
          path="table"
          element={<TablePage />}
        />
      </Routes>
    </div>
  );
});

wpm.export(appId, App);
</mo-ai-code>
```
