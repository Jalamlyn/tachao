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
const CheckoutPage = await wpm.import('page_checkout');

// 主应用组件
const App = observer(() => {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="checkout" replace />}
      />
      <Route
        path="checkout"
        element={<CheckoutPage />}
      />
    </Routes>
  );
});

wpm.export(appId, App);
</mo-ai-code>
```

