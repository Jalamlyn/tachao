// 基础模板 - 简单的Hello World应用
export const basicTemplate = () => `
const { wpm, React, ReactRouterDom, observer, appId } = context;
const { Routes, Route, Navigate } = ReactRouterDom;

// 创建一个简单的首页
const HomePage = () => {
  const { NextUI } = context;
  const { Card, CardBody } = NextUI;
  
  return (
    <div className="p-8">
      <Card>
        <CardBody>
          <h1 className="text-2xl font-bold mb-4">👋 Hello!</h1>
          <p className="text-default-500">
            欢迎使用AI应用构建器。这是一个示例页面，您可以:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-2 text-default-500">
            <li>使用AI助手生成新的页面</li>
            <li>修改现有代码</li>
            <li>添加更多功能</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  );
};

// 创建一个基础的应用布局
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
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
  );
};

wpm.export(appId, App);
`

// SaaS官网模板
export const saasTemplate = () => `
const { wpm, React, ReactRouterDom, observer, appId, Icon } = context;
const { Routes, Route } = ReactRouterDom;
const { NextUI } = context;
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
const { wpm, React, ReactRouterDom, observer, appId, Icon } = context;
const { Routes, Route, Navigate, Link } = ReactRouterDom;
const { NextUI } = context;
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