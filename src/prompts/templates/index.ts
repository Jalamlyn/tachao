// 业务应用模板 - 面向非技术用户的示例
export const basicTemplate = () => `
<mo-ai-code type="app" >
const {
  React, 
  wpm, 
  ReactRouterDom, 
  observer, 
  appId, 
  Icon, 
  FramerMotion,
  NextUI,
  message,
  api,
  ai,
  mobx,
  recharts 
} = context;

const { Routes, Route, Navigate } = ReactRouterDom;
const { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} = recharts;

// 导入页面组件
const HomePage = await wpm.import('page_home');
const FormPage = await wpm.import('page_form');
const ListPage = await wpm.import('page_list');
const DetailPage = await wpm.import('page_detail');

// 应用布局组件
const AppLayout = observer(() => {
  const { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button } = NextUI;
  const navigate = ReactRouterDom.useNavigate();
  const location = ReactRouterDom.useLocation();

  const navItems = [
    { path: "", label: "首页", icon: "mdi:home" },
    { path: "customers", label: "客户列表", icon: "mdi:account-group" },
    { path: "new", label: "新增客户", icon: "mdi:account-plus" },
  ];

  return (
    <div className="min-h-screen bg-default-50">
      <Navbar isBordered>
        <NavbarBrand>
          <Icon icon="mdi:store" className="w-6 h-6 text-primary mr-2" />
          <p className="font-bold text-inherit">客户管理系统</p>
        </NavbarBrand>
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {navItems.map((item) => (
            <NavbarItem
              key={item.path}
              isActive={location.pathname === \`/\${item.path}\`}
            >
              <Button
                className="min-w-[120px]"
                variant={location.pathname === \`/\${item.path}\` ? "flat" : "light"}
                color={location.pathname === \`/\${item.path}\` ? "primary" : "default"}
                onClick={() => navigate(item.path)}
                startContent={<Icon icon={item.icon} className="w-4 h-4" />}
              >
                {item.label}
              </Button>
            </NavbarItem>
          ))}
        </NavbarContent>
      </Navbar>

      <main className="mx-auto px-4 py-8">
        <Routes>
          <Route path="" element={<HomePage />} />
          <Route path="customers" element={<ListPage />} />
          <Route path="new" element={<FormPage />} />
          <Route path="customer/:id" element={<DetailPage />} />
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </main>
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
</mo-ai-code>
<mo-ai-code type="page" pageid="page_form" title="新增客户">
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

const { motion } = FramerMotion;
const { Card, CardBody, Input, Button, Select, SelectItem } = NextUI;
const { useState } = React;
const { useNavigate } = ReactRouterDom;

// 导入数据服务
const DataStore = await wpm.import('store_data');

const FormPage = observer(() => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'personal'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // 表单验证
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "客户名称不能为空";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "联系电话不能为空";
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "请输入有效的手机号码";
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "请输入有效的邮箱地址";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await DataStore.addCustomer(formData);
      message.success("客户添加成功！");
      navigate("/customers");
    } catch (error) {
      message.error("添加失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  // 处理输入变化
  const handleChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card>
          <CardBody className="gap-4">
            <div className="flex items-center gap-2 mb-4">
              <Icon icon="mdi:account-plus" className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">新增客户</h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="客户名称"
                placeholder="请输入客户名称"
                value={formData.name}
                onValueChange={handleChange('name')}
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                isRequired
                startContent={
                  <Icon icon="mdi:account" className="w-4 h-4 text-default-400" />
                }
              />

              <Input
                label="联系电话"
                placeholder="请输入手机号码"
                value={formData.phone}
                onValueChange={handleChange('phone')}
                isInvalid={!!errors.phone}
                errorMessage={errors.phone}
                isRequired
                startContent={
                  <Icon icon="mdi:phone" className="w-4 h-4 text-default-400" />
                }
              />

              <Input
                label="电子邮箱"
                placeholder="请输入邮箱地址"
                value={formData.email}
                onValueChange={handleChange('email')}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                startContent={
                  <Icon icon="mdi:email" className="w-4 h-4 text-default-400" />
                }
              />

              <Select
                label="客户类型"
                placeholder="请选择客户类型"
                selectedKeys={[formData.type]}
                onChange={(e) => handleChange('type')(e.target.value)}
                startContent={
                  <Icon icon="mdi:account-group" className="w-4 h-4 text-default-400" />
                }
              >
                <SelectItem key="personal" value="personal">个人客户</SelectItem>
                <SelectItem key="company" value="company">企业客户</SelectItem>
              </Select>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="flat"
                  onClick={() => navigate("/customers")}
                  startContent={<Icon icon="mdi:arrow-left" className="w-4 h-4" />}
                >
                  返回
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={loading}
                  startContent={!loading && <Icon icon="mdi:check" className="w-4 h-4" />}
                >
                  提交
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
});

wpm.export('page_form', FormPage);
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
  appId,
  recharts
} = context;

const { motion } = FramerMotion;
const { Card, CardBody, Button } = NextUI;
const { useNavigate } = ReactRouterDom;
const { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell
} = recharts;

// 导入数据服务
const DataStore = await wpm.import('store_data');

const HomePage = observer(() => {
  const navigate = useNavigate();
  
  const features = [
    {
      title: "查看客户",
      description: "浏览和搜索所有客户信息",
      icon: "mdi:account-group",
      path: "customers",
      color: "primary"
    },
    {
      title: "新增客户",
      description: "添加新的客户信息",
      icon: "mdi:account-plus",
      path: "new",
      color: "success"
    }
  ];

  // 客户增长趋势数据
  const growthData = [
    { month: '1月', count: 20 },
    { month: '2月', count: 35 },
    { month: '3月', count: 45 },
    { month: '4月', count: 30 },
    { month: '5月', count: 55 },
    { month: '6月', count: 40 }
  ];

  // 客户类型分布数据
  const typeData = [
    { name: '个人客户', value: 60 },
    { name: '企业客户', value: 40 }
  ];

  const COLORS = ['hsl(var(--nextui-primary-500))', 'hsl(var(--nextui-secondary-500))'];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 数据概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-primary-50">
            <CardBody>
              <div className="flex items-center gap-2">
                <Icon icon="mdi:account-multiple" className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-small text-default-500">总客户数</p>
                  <p className="text-xl font-bold">{DataStore.customers.length}</p>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-success-50">
            <CardBody>
              <div className="flex items-center gap-2">
                <Icon icon="mdi:trending-up" className="w-6 h-6 text-success" />
                <div>
                  <p className="text-small text-default-500">本月新增</p>
                  <p className="text-xl font-bold">12</p>
                </div>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-secondary-50">
            <CardBody>
              <div className="flex items-center gap-2">
                <Icon icon="mdi:chart-line" className="w-6 h-6 text-secondary" />
                <div>
                  <p className="text-small text-default-500">转化率</p>
                  <p className="text-xl font-bold">68%</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardBody>
              <h3 className="text-medium font-semibold mb-4">客户增长趋势</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--nextui-primary-500))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--nextui-primary-500))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--nextui-primary-500))" 
                    fillOpacity={1} 
                    fill="url(#colorCount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <h3 className="text-medium font-semibold mb-4">客户类型分布</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={\`cell-\${index}\`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* 功能导航 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                isPressable
                onPress={() => navigate(feature.path)}
                className="bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <CardBody>
                  <div className="flex items-start gap-4">
                    <div className={\`p-3 rounded-full bg-\${feature.color}-100\`}>
                      <Icon 
                        icon={feature.icon} 
                        className={\`w-6 h-6 text-\${feature.color}\`} 
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                      <p className="text-default-600">{feature.description}</p>
                    </div>
                    <Button
                      isIconOnly
                      variant="light"
                      className="text-default-400"
                    >
                      <Icon icon="mdi:chevron-right" className="w-5 h-5" />
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
});

wpm.export('page_home', HomePage);
</mo-ai-code>

<mo-ai-code type="page" pageid="page_list" title="客户列表">
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
  appId,
  recharts 
} = context;

const { motion } = FramerMotion;
const { Card, CardBody, Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Tabs, Tab } = NextUI;
const { useState, useEffect } = React;
const { useNavigate } = ReactRouterDom;
const { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Legend
} = recharts;

// 导入数据服务
const DataStore = await wpm.import('store_data');

const ListPage = observer(() => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [timeRange, setTimeRange] = useState("7");

  useEffect(() => {
    DataStore.loadCustomers();
  }, []);

  const filteredCustomers = DataStore.customers.filter(
    customer => customer.name.includes(searchText) || customer.phone.includes(searchText)
  );

  const typeColors = {
    personal: "primary",
    company: "success"
  };

  const typeLabels = {
    personal: "个人客户",
    company: "企业客户"
  };

  // 客户增长数据
  const growthData = [
    { name: '周一', personal: 4, company: 3 },
    { name: '周二', personal: 3, company: 2 },
    { name: '周三', personal: 5, company: 4 },
    { name: '周四', personal: 2, company: 3 },
    { name: '周五', personal: 6, company: 2 },
    { name: '周六', personal: 4, company: 4 },
    { name: '周日', personal: 3, company: 5 }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* 数据概览图表 */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-medium font-semibold">客户增长趋势</h3>
                <Tabs 
                  size="sm" 
                  selectedKey={timeRange}
                  onSelectionChange={setTimeRange}
                >
                  <Tab key="7" title="7天" />
                  <Tab key="30" title="30天" />
                  <Tab key="90" title="90天" />
                </Tabs>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="personal" name="个人客户" fill="hsl(var(--nextui-primary-500))" />
                  <Bar dataKey="company" name="企业客户" fill="hsl(var(--nextui-success-500))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* 搜索和操作栏 */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center justify-between gap-4">
              <Input
                placeholder="搜索客户..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                startContent={<Icon icon="mdi:magnify" className="w-5 h-5 text-default-400" />}
                className="max-w-xs"
              />
              <Button
                color="primary"
                onClick={() => navigate("/new")}
                startContent={<Icon icon="mdi:plus" className="w-5 h-5" />}
              >
                新增客户
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* 客户列表 */}
        <Card>
          <CardBody>
            <Table aria-label="客户列表">
              <TableHeader>
                <TableColumn>客户名称</TableColumn>
                <TableColumn>联系电话</TableColumn>
                <TableColumn>电子邮箱</TableColumn>
                <TableColumn>客户类型</TableColumn>
                <TableColumn>操作</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        color={typeColors[customer.type]}
                        variant="flat"
                        size="sm"
                      >
                        {typeLabels[customer.type]}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          variant="light"
                          onClick={() => navigate(\`/customer/\${customer.id}\`)}
                        >
                          <Icon icon="mdi:eye" className="w-4 h-4" />
                        </Button>
                        <Button
                          isIconOnly
                          variant="light"
                          color="danger"
                          onClick={() => DataStore.deleteCustomer(customer.id)}
                        >
                          <Icon icon="mdi:delete" className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
});

wpm.export('page_list', ListPage);
</mo-ai-code>

<mo-ai-code type="page" pageid="page_detail" title="客户详情">
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
  appId,
  recharts 
} = context;

const { motion } = FramerMotion;
const { Card, CardBody, Button, Divider } = NextUI;
const { useState, useEffect } = React;
const { useNavigate, useParams } = ReactRouterDom;
const { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis,
  CartesianGrid, 
  Tooltip 
} = recharts;

// 导入数据服务
const DataStore = await wpm.import('store_data');

const DetailPage = observer(() => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataStore.loadCustomerDetail(id);
    setLoading(false);
  }, [id]);

  if (loading || !DataStore.currentCustomer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <NextUI.Spinner label="加载中..." />
      </div>
    );
  }

  const customer = DataStore.currentCustomer;

  const typeLabels = {
    personal: "个人客户",
    company: "企业客户"
  };

  // 互动历史数据
  const interactionData = [
    { date: '2024-01', interactions: 5 },
    { date: '2024-02', interactions: 8 },
    { date: '2024-03', interactions: 3 },
    { date: '2024-04', interactions: 12 },
    { date: '2024-05', interactions: 7 },
    { date: '2024-06', interactions: 15 }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="mb-6">
          <CardBody className="gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Icon icon="mdi:account" className="w-6 h-6" />
                客户详情
              </h2>
              <Button
                variant="light"
                startContent={<Icon icon="mdi:arrow-left" className="w-4 h-4" />}
                onClick={() => navigate("/customers")}
              >
                返回列表
              </Button>
            </div>

            <Divider />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-default-500">客户名称</label>
                <p className="font-medium">{customer.name}</p>
              </div>
              
              <div>
                <label className="text-sm text-default-500">客户类型</label>
                <p className="font-medium">{typeLabels[customer.type]}</p>
              </div>
              
              <div>
                <label className="text-sm text-default-500">联系电话</label>
                <p className="font-medium">{customer.phone}</p>
              </div>
              
              <div>
                <label className="text-sm text-default-500">电子邮箱</label>
                <p className="font-medium">{customer.email || "-"}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* 互动历史图表 */}
        <Card className="mb-6">
          <CardBody>
            <h3 className="text-medium font-semibold mb-4">互动历史</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={interactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="interactions" 
                  stroke="hsl(var(--nextui-primary-500))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--nextui-primary-500))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-end gap-2">
              <Button
                color="danger"
                variant="light"
                onClick={() => {
                  DataStore.deleteCustomer(customer.id);
                  navigate("/customers");
                }}
                startContent={<Icon icon="mdi:delete" className="w-4 h-4" />}
              >
                删除客户
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
});

wpm.export('page_detail', DetailPage);
</mo-ai-code>

<mo-ai-code type="store" name="store_data">
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

const { makeAutoObservable, runInAction } = mobx;

// 导入数据服务
const DataService = await wpm.import('service_data');

class DataStore {
  customers = [];
  currentCustomer = null;
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async loadCustomers() {
    this.loading = true;
    try {
      const result = await DataService.getCustomers();
      runInAction(() => {
        this.customers = result || [];
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async loadCustomerDetail(id) {
    const customer = this.customers.find(c => c.id === id);
    if (customer) {
      this.currentCustomer = customer;
    }
  }

  async addCustomer(data) {
    const customer = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    this.customers.push(customer);
    await DataService.saveCustomers(this.customers);
    message.success("添加成功");
  }

  async deleteCustomer(id) {
    this.customers = this.customers.filter(c => c.id !== id);
    await DataService.saveCustomers(this.customers);
    message.success("删除成功");
  }
}

const store = new DataStore();
wpm.export('store_data', store);
</mo-ai-code>

<mo-ai-code type="service" name="service_data">
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

const service = {
  async getCustomers() {
    const result = await api.getMetadata([\`\${appId}_customers\`]);
    return result.data?.[0]?.value ? JSON.parse(result.data[0].value) : [];
  },

  async saveCustomers(customers) {
    await api.setMetadata(\`\${appId}_customers\`, JSON.stringify(customers));
  }
};

wpm.export('service_data', service);
</mo-ai-code>
`

export const templates = [
  {
    id: "basic",
    name: "客户管理系统",
    description: "简单易用的客户信息管理应用模板",
    template: basicTemplate,
  },
]
