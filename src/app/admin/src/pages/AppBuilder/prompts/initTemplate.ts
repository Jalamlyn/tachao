export const initialAIResponse = `让我们开始创建一个新的应用。首先，我们需要创建以下基础模块：

1. 应用入口模块，用于基本路由配置
2. 首页模块，包含使用指南

下面是具体的代码实现：

\`\`\`jsx
<mo-ai-code type="app">
const { 
  wpm, 
  React, 
  ReactRouterDom, 
  observer, 
  Icon, 
  NextUI,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId 
} = context;

const { Routes, Route, Navigate } = ReactRouterDom;

// 导入首页模块
const HomePage = await wpm.import('page_home')

const App = () => {
  return (
    <Routes>
      {/* 默认路由重定向到首页 */}
      <Route 
        path="/" 
        element={<Navigate to="home" replace />} 
      />

      {/* 首页路由 */}
      <Route
        path="home"
        element={<HomePage />}
      />
    </Routes>
  );
};

// 导出应用入口
wpm.export(appId, App);
</mo-ai-code>

<mo-ai-code type="page" pageid="page_home" title="首页">
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

const { Card, CardBody, CardHeader, Button, Divider, Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } = NextUI;
const { motion } = FramerMotion;

const logos = [
  { icon: "logos:react", name: "React" },
  { icon: "logos:typescript-icon", name: "TypeScript" },
  { icon: "logos:nextui", name: "NextUI" },
  { icon: "logos:tailwindcss-icon", name: "Tailwind" },
  { icon: "logos:mobx", name: "MobX" }
];

const featuresCategories = [
  {
    key: "ai",
    title: "AI能力",
    icon: "mdi:brain-circuit",
    color: "success",
    descriptions: [
      "企业应用开发成本直降80%，效率提升10倍",
      "智能代码生成和优化建议",
      "自然语言需求转换",
    ]
  },
  {
    key: "enterprise",
    title: "企业特性",
    icon: "mdi:shield-check",
    color: "warning",
    descriptions: [
      "符合企业标准的代码质量",
      "快速部署上线",
      "完整的开发文档支持",
    ]
  },
  {
    key: "analysis",
    title: "数据分析",
    icon: "mdi:chart-box",
    color: "primary",
    descriptions: [
      "内置智能数据分析",
      "可视化数据展示",
      "辅助企业决策制定",
    ]
  },
  {
    key: "security",
    title: "安全保障",
    icon: "mdi:security",
    color: "secondary",
    descriptions: [
      "企业级安全保障",
      "数据隐私保护",
      "完整的权限管理",
    ]
  }
];

// 特性卡片组件
const FeatureCard = ({ title, icon, color, descriptions }) => {
  return (
    <Card className={\`bg-\${color}-50/50\`}>
      <CardBody className="flex gap-4">
        <div className={\`p-3 rounded-xl bg-\${color}-100\`}>
          <Icon icon={icon} className={\`w-6 h-6 text-\${color}-500\`} />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <ul className="space-y-2">
            {descriptions.map((desc, index) => (
              <li key={index} className="text-default-600 flex items-center gap-2">
                <Icon icon="mdi:check-circle" className={\`w-4 h-4 text-\${color}-500\`} />
                {desc}
              </li>
            ))}
          </ul>
        </div>
      </CardBody>
    </Card>
  );
};

const HomePage = observer(() => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-default-50">
      {/* 导航栏 */}
      <Navbar 
        className="bg-background/60 backdrop-blur-md border-b border-default-200"
        maxWidth="xl"
      >
        <NavbarBrand>
          <Icon icon="mdi:robot-happy" className="w-8 h-8 text-primary"/>
          <p className="font-bold text-inherit">即想AI</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="#">
              产品特性
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              开发文档
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              技术支持
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem>
            <Button 
              color="primary" 
              variant="flat"
              startContent={<Icon icon="mdi:rocket-launch" />}
            >
              开始使用
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero部分 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 py-12"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Button 
              className="mb-6"
              color="primary" 
              variant="flat" 
              size="sm"
              startContent={<Icon icon="mdi:sparkles" />}
            >
              AI驱动的新一代开发平台
            </Button>
          </motion.div>
          
          <h1 className="text-4xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            让AI为企业开发赋能
          </h1>
          
          <p className="text-xl text-default-600 max-w-2xl mx-auto">
            10倍提升开发效率，让企业应用开发变得简单高效
          </p>

          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              color="primary"
              className="font-medium"
              endContent={<Icon icon="mdi:arrow-right" />}
              onPress={() => message.success('准备就绪！请在左侧输入您的企业需求')}
            >
              开始开发
            </Button>
            <Button
              size="lg"
              variant="bordered"
              className="font-medium"
            >
              查看文档
            </Button>
          </div>
        </motion.div>

        {/* 技术栈展示 */}
        <div className="py-12">
          <div className="flex flex-wrap justify-center gap-8">
            {logos.map((logo, index) => (
              <motion.div
                key={logo.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 text-default-600"
              >
                <Icon icon={logo.icon} className="w-8 h-8" />
                <span>{logo.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 特性展示 */}
        <div className="py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {featuresCategories.map((feature, index) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* 示例指令 */}
        <div className="py-12">
          <Card className="bg-gradient-to-br from-primary-50 to-secondary-50">
            <CardHeader>
              <h2 className="text-2xl font-bold">开始您的AI开发之旅</h2>
            </CardHeader>
            <Divider/>
            <CardBody>
              <div className="space-y-4">
                <div className="bg-background/40 p-4 rounded-xl">
                  <h3 className="font-medium mb-2">示例指令:</h3>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2">
                      <Icon icon="mdi:chevron-right" className="text-primary"/>
                      "创建一个员工管理系统，包含基本信息和考勤记录"
                    </p>
                    <p className="flex items-center gap-2">
                      <Icon icon="mdi:chevron-right" className="text-primary"/>
                      "设计一个销售数据分析仪表板，展示月度业绩"
                    </p>
                    <p className="flex items-center gap-2">
                      <Icon icon="mdi:chevron-right" className="text-primary"/>
                      "开发一个项目管理模块，可以跟踪任务进度"
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  );
});

// 导出首页组件
wpm.export('page_home', HomePage);
</mo-ai-code>
\`\`\`
`