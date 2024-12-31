// 业务应用模板 - 面向非技术用户的示例
export const basicTemplate = () => `
<shata-ai-code type="app" name="entry" title="应用入口">
// 解构所有可用的 context 依赖
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

      <main className="container mx-auto px-4 py-8">
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
</shata-ai-code>

<shata-ai-code type="page" pageid="page_home" title="首页">
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
const { Card, CardBody, Button } = NextUI;
const { useNavigate } = ReactRouterDom;

const HomePage = () => {
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

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 欢迎区域 */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardBody>
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-full bg-primary-100">
                <Icon icon="mdi:store" className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-primary mb-2">
                  欢迎使用客户管理系统
                </h1>
                <p className="text-default-600">
                  这是一个简单易用的客户管理系统，您可以：
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <Icon icon="mdi:check-circle" className="w-5 h-5 text-success" />
                    <span>查看所有客户信息</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="mdi:check-circle" className="w-5 h-5 text-success" />
                    <span>添加新的客户</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Icon icon="mdi:check-circle" className="w-5 h-5 text-success" />
                    <span>编辑客户详情</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardBody>
        </Card>

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
};

wpm.export('page_home', HomePage);
</shata-ai-code>

<shata-ai-code type="page" pageid="page_form" title="新增客户">
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
    name: "",
    phone: "",
    email: "",
    type: "personal"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      message.error("请填写必填项");
      return;
    }

    setLoading(true);
    try {
      await DataStore.addCustomer(formData);
      message.success("添加成功");
      navigate("/customers");
    } catch (error) {
      message.error("添加失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardBody className="gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon icon="mdi:account-plus" className="w-6 h-6" />
              新增客户
            </h2>
            
            <Input
              label="客户名称"
              placeholder="请输入客户名称"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              isRequired
            />
            
            <Input
              label="联系电话"
              placeholder="请输入联系电话"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              isRequired
            />
            
            <Input
              label="电子邮箱"
              placeholder="请输入电子邮箱"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
            
            <Select
              label="客户类型"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
            >
              <SelectItem key="personal" value="personal">个人客户</SelectItem>
              <SelectItem key="company" value="company">企业客户</SelectItem>
            </Select>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="light"
                onClick={() => navigate("/customers")}
              >
                取消
              </Button>
              <Button
                color="primary"
                onClick={handleSubmit}
                isLoading={loading}
              >
                保存
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
});

wpm.export('page_form', FormPage);
</shata-ai-code>

<shata-ai-code type="page" pageid="page_list" title="客户列表">
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
const { Card, CardBody, Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } = NextUI;
const { useState, useEffect } = React;
const { useNavigate } = ReactRouterDom;

// 导入数据服务
const DataStore = await wpm.import('store_data');

const ListPage = observer(() => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

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

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
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
</shata-ai-code>

<shata-ai-code type="page" pageid="page_detail" title="客户详情">
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
const { Card, CardBody, Button, Divider } = NextUI;
const { useState, useEffect } = React;
const { useNavigate, useParams } = ReactRouterDom;

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

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
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

            <Divider />

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
</shata-ai-code>

<shata-ai-code type="store" name="store_data">
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
</shata-ai-code>

<shata-ai-code type="service" name="service_data">
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
</shata-ai-code>`

export const templates = [
  {
    id: "basic",
    name: "客户管理系统",
    description: "简单易用的客户信息管理应用模板",
    template: basicTemplate,
  },
]
