export const COMPONENT_PROMPTS = {
  appEntry: `3. 应用入口组件示例：

\`\`\`jsx
<shata-ai-code type="app">
export default (props) => {
  const {React,NextUI,ReactRouterDom,FramerMotion,Icon,message,api: { getMetadata, setMetadata },FormRenderer,ReportRenderer,PageWrapper} = context
  // 必须导出 PageWrapper 组件,不然报错
  const {Routes, Route, Navigate, BrowserRouter} = ReactRouterDom
  const {Card, CardBody, CardHeader,TableBody,TableHeader,Modal, ModalContent,ModalBody,ModalHeader,Form,Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem} = NextUI // next ui v2.6.0 components
  const {motion} = FramerMotion

  // 定义默认首页组件
  const HomePage = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="flex gap-3">
            <Icon icon="mdi:home" className="w-8 h-8 text-primary" />
            <div className="flex flex-col">
              <p className="text-xl font-bold">欢迎使用</p>
              <p className="text-small text-default-500">这是您的应用首页</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold mb-2">快速开始</h3>
                  <p className="text-default-500">
                    开始构建您的应用页面，添加更多功能和内容。
                  </p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold mb-2">功能示例</h3>
                  <p className="text-default-500">
                    这里展示了基本的卡片布局和组件使用方式。
                  </p>
                </CardBody>
              </Card>
            </div>
          </CardBody>
        </Card>
      </div>
    )
  }

  return (
    <BrowserRouter basename={props.basename}>
      <Navbar>
        <NavbarBrand>
          <Icon icon="mdi:home" className="w-6 h-6 text-primary" />
          <p className="font-bold text-inherit ml-2">我的应用</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link to="home" className="text-default-600">首页</Link>
          </NavbarItem>
          <NavbarItem>
            <Link to="about" className="text-default-600">关于</Link>
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <Routes>
        <Route path="/" element={<Navigate to="home" replace />} />
        <Route path="home" element={<HomePage />} />
        <Route path="about" element={<context.PageWrapper pageId="page_yyy" />}>
          <Route path="team" element={<context.PageWrapper pageId="page_yyy_xxx" />} />
        </Route>
        <Route path="*" element={<div>页面不存在</div>} />
      </Routes>
    </BrowserRouter>
  )
}
</shata-ai-code>
\`\`\``,

  pageComponent: `4. 页面组件使用 <shata-ai-code type="page" pageid="xxx" title="xxx"></shata-ai-code> 包裹：
\`\`\`jsx
<shata-ai-code type="page" pageid="page_xxx" title="页面标题">
export default (props) => {
  const {React, NextUI} = context
  return (
    <div>页面内容</div>
  )
}
</shata-ai-code>
\`\`\``,

  componentRules: `5. 技术要求：
   - 只能使用 NextUI 2.6.0 版本中实际存在的组件
   - 禁止使用 Container Grid Text 这些 NextUI V1 版本中的组件
   - 使用 tailwind css 编写样式代码
   - 动画使用 FramerMotion
   - 图标使用 @iconify/react 的 Icon 组件
   - 数据存储使用 getMetadata 和 setMetadata`
}