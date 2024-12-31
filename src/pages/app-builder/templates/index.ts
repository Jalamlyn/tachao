// 基础模板 - 简单的Hello World应用
export const basicTemplate = () => `
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
const { motion } = FramerMotion;

// 创建一个引导性的首页
const HomePage = () => {
  const { Card, CardBody, Button, Divider } = NextUI;
  const [showWelcome, setShowWelcome] = React.useState(true);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-secondary-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 欢迎卡片 */}
        {showWelcome && (
          <Card className="mb-6 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardBody>
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-4"
              >
                <div className="p-3 rounded-full bg-primary-100">
                  <Icon icon="mdi:robot-happy" className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-primary">欢迎使用 AI 应用构建器！</h2>
                  <p className="text-default-600 mt-1">
                    我是您的 AI 助手，让我们一起开始构建应用吧！
                  </p>
                </div>
                <Button
                  isIconOnly
                  variant="light"
                  onClick={() => setShowWelcome(false)}
                  className="text-default-400"
                >
                  <Icon icon="mdi:close" className="w-5 h-5" />
                </Button>
              </motion.div>
            </CardBody>
          </Card>
        )}

        {/* 主要内容区 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 左侧：快速开始 */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardBody>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon icon="mdi:rocket-launch" className="w-5 h-5 text-primary" />
                  快速开始
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors">
                    <div className="mt-1">
                      <Icon icon="mdi:message-text" className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-default-700">告诉AI您的需求</p>
                      <p className="text-sm text-default-500">
                        例如："帮我创建一个待办事项列表页面"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary-50 hover:bg-secondary-100 transition-colors">
                    <div className="mt-1">
                      <Icon icon="mdi:wand" className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium text-default-700">AI 智能生成</p>
                      <p className="text-sm text-default-500">
                        自动生成符合需求的页面代码和组件
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-success-50 hover:bg-success-100 transition-colors">
                    <div className="mt-1">
                      <Icon icon="mdi:check-circle" className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="font-medium text-default-700">实时预览</p>
                      <p className="text-sm text-default-500">
                        即时查看生成的页面效果并进行调整
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </CardBody>
          </Card>

          {/* 右侧：示例提示 */}
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
            <CardBody>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Icon icon="mdi:lightbulb" className="w-5 h-5 text-warning" />
                  您可以这样问我
                </h3>
                <div className="space-y-3">
                  {[
                    "创建一个数据展示页面，包含图表和表格",
                    "添加一个用户管理模块，支持增删改查",
                    "设计一个响应式的导航栏组件",
                    "实现一个带有拖拽功能的看板",
                    "生成一个表单页面，带有数据验证"
                  ].map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center gap-2 p-2 rounded hover:bg-default-100 cursor-pointer group"
                      onClick={() => {
                        // 可以在这里添加点击复制功能
                        navigator.clipboard.writeText(tip);
                        message.success("提示已复制到剪贴板");
                      }}
                    >
                      <Icon 
                        icon="mdi:content-copy" 
                        className="w-4 h-4 text-default-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                      />
                      <span className="text-default-600">{tip}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </CardBody>
          </Card>
        </div>

        {/* 底部：AI 命令输入提示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-6"
        >
          <Card className="bg-gradient-to-r from-primary-100 to-secondary-100 shadow-lg">
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-white/30 backdrop-blur-sm">
                  <Icon icon="mdi:cursor-text" className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-primary-700">
                    在下方输入框输入您的需求，让我们开始吧！
                  </h3>
                  <p className="text-sm text-primary-600 mt-1">
                    提示：输入清晰具体的需求描述，可以帮助我更好地理解您的期望
                  </p>
                </div>
                <Button
                  color="primary"
                  endContent={<Icon icon="mdi:arrow-down" className="w-4 h-4" />}
                >
                  开始输入
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

// 应用布局
const AppLayout = observer(() => {
  return (
    <div className="min-h-screen bg-default-50">
      <HomePage />
    </div>
  );
});

// 配置路由
const App = () => {
  return (
    <Routes>
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
};

wpm.export(appId, App);
`

// SaaS官网模板
export const saasTemplate = () => `
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

const { Routes, Route } = ReactRouterDom;
const { Button, Card, CardBody, Link } = NextUI;

// 导航栏组件
const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary">
              Your SaaS
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/features" className="text-default-600 hover:text-primary">
              功能
            </Link>
            <Link href="/pricing" className="text-default-600 hover:text-primary">
              价格
            </Link>
            <Link href="/about" className="text-default-600 hover:text-primary">
              关于
            </Link>
            <Button color="primary">
              立即开始
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// 首页组件
const HomePage = () => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-default-900 sm:text-5xl md:text-6xl">
              让您的业务更上一层楼
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-default-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              提供强大的SaaS解决方案，助力企业数字化转型
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <Button size="lg" color="primary">
                免费试用
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-default-900">
              为什么选择我们
            </h2>
            <p className="mt-4 text-default-600">
              提供全方位的解决方案，满足您的所有需求
            </p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "简单易用",
                description: "直观的界面设计，快速上手",
                icon: "mdi:rocket"
              },
              {
                title: "安全可靠",
                description: "企业级安全保障，数据无忧",
                icon: "mdi:shield-check"
              },
              {
                title: "全天支持",
                description: "24/7专业技术支持",
                icon: "mdi:headphones"
              }
            ].map((feature) => (
              <Card key={feature.title}>
                <CardBody className="text-center">
                  <Icon icon={feature.icon} className="w-12 h-12 mx-auto text-primary" />
                  <h3 className="mt-4 text-lg font-medium text-default-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-default-600">
                    {feature.description}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 应用布局
const AppLayout = observer(() => {
  return (
    <div className="min-h-screen bg-default-50">
      <Navbar />
      <Routes>
        <Route index element={<HomePage />} />
      </Routes>
    </div>
  );
});

// 导出应用
const App = () => {
  return (
    <Routes>
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
};

wpm.export(appId, App);
`

// 管理系统模板
export const adminTemplate = () => `
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

const { Routes, Route, Navigate, Link } = ReactRouterDom;
const { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } = NextUI;

// 侧边栏数据
const sidebarItems = [
  { 
    label: "仪表盘", 
    icon: "mdi:view-dashboard",
    path: "dashboard" 
  },
  { 
    label: "用户管理", 
    icon: "mdi:account-group",
    path: "users" 
  },
  { 
    label: "系统设置", 
    icon: "mdi:cog",
    path: "settings" 
  }
];

// 侧边栏组件
const Sidebar = () => {
  const location = ReactRouterDom.useLocation();
  
  return (
    <div className="w-64 bg-default-50 border-r h-screen fixed left-0 top-0">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-primary">管理系统</h1>
      </div>
      <nav className="p-4 space-y-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={\`flex items-center gap-3 px-4 py-2 rounded-lg \${
              location.pathname.includes(item.path)
                ? "bg-primary text-white"
                : "text-default-600 hover:bg-default-100"
            }\`}
          >
            <Icon icon={item.icon} className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

// 顶部导航栏
const Navbar = () => {
  return (
    <div className="h-16 border-b bg-white/80 backdrop-blur-md flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button
          isIconOnly
          variant="light"
          aria-label="Menu"
        >
          <Icon icon="mdi:menu" className="w-5 h-5" />
        </Button>
      </div>
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          aria-label="Notifications"
        >
          <Icon icon="mdi:bell" className="w-5 h-5" />
        </Button>
        <Dropdown>
          <DropdownTrigger>
            <Avatar
              isBordered
              as="button"
              className="transition-transform"
              src="https://i.pravatar.cc/150"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">管理员</p>
              <p className="font-semibold">admin@example.com</p>
            </DropdownItem>
            <DropdownItem key="settings">
              个人设置
            </DropdownItem>
            <DropdownItem key="logout" color="danger">
              退出登录
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

// 仪表盘页面
const DashboardPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">仪表盘</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "总用户", value: "1,234", icon: "mdi:account" },
          { label: "活跃用户", value: "891", icon: "mdi:account-check" },
          { label: "今日访问", value: "156", icon: "mdi:chart-line" }
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">{stat.label}</p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
              <Icon icon={stat.icon} className="w-8 h-8 text-primary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 用户管理页面
const UsersPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">用户管理</h2>
      <p className="text-default-500">这里是用户管理页面</p>
    </div>
  );
};

// 系统设置页面
const SettingsPage = () => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">系统设置</h2>
      <p className="text-default-500">这里是系统设置页面</p>
    </div>
  );
};

// 应用布局
const AppLayout = observer(() => {
  return (
    <div className="min-h-screen bg-default-100">
      <Sidebar />
      <div className="ml-64">
        <Navbar />
        <main className="p-4">
          <Routes>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
});

// 导出应用
const App = () => {
  return (
    <Routes>
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
};

wpm.export(appId, App);
`

export const templates = [
  {
    id: 'basic',
    name: '基础模板',
    description: '简单的Hello World应用模板',
    template: basicTemplate
  },
  {
    id: 'saas',
    name: 'SaaS官网',
    description: '适合企业官网、产品展示的模板',
    template: saasTemplate
  },
  {
    id: 'admin',
    name: '管理系统',
    description: '包含仪表盘、用户管理等功能的后台管理系统模板',
    template: adminTemplate
  }
]