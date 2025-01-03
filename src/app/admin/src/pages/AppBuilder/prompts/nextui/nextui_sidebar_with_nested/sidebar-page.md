```jsx
<mo-ai-code type="page" pageid="page_sidebar" title="侧边栏页面">
const {
  wpm,
  React,
  observer
} = context;

const Sidebar = await wpm.import('comp_sidebar');
const sidebarModule = await wpm.import('module_sidebar');

const SidebarPage = observer(() => {
  return (
    <Sidebar defaultSelectedKey="home" items={sidebarModule.sectionNestedItems} />
  );
});

wpm.export('page_sidebar', SidebarPage);
</mo-ai-code>
```