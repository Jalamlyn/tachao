// 业务应用模板 - CRM系统
export const crmTemplate = () => `
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
  Cell,
  Funnel,
  FunnelChart,
  LabelList
} = recharts;

// 导入页面组件
const HomePage = await wpm.import('page_home');
const CustomerListPage = await wpm.import('page_customer_list');
const CustomerFormPage = await wpm.import('page_customer_form');
const CustomerDetailPage = await wpm.import('page_customer_detail');
const LeadListPage = await wpm.import('page_lead_list');
const LeadFormPage = await wpm.import('page_lead_form');
const LeadDetailPage = await wpm.import('page_lead_detail');
const OpportunityListPage = await wpm.import('page_opportunity_list');
const OpportunityFormPage = await wpm.import('page_opportunity_form');
const OpportunityDetailPage = await wpm.import('page_opportunity_detail');
const OrderListPage = await wpm.import('page_order_list');
const OrderFormPage = await wpm.import('page_order_form');
const OrderDetailPage = await wpm.import('page_order_detail');
const ReportPage = await wpm.import('page_report');

// 导入数据服务
const DataStore = await wpm.import('store_data');

// 应用布局组件
const AppLayout = observer(() => {
  const { Navbar, NavbarBrand, NavbarContent, NavbarItem, Button, useDisclosure } = NextUI;
  const navigate = ReactRouterDom.useNavigate();
  const location = ReactRouterDom.useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const navItems = [
    {
      key: "dashboard",
      label: "仪表盘",
      path: "",
      icon: "mdi:view-dashboard"
    },
    {
      key: "customers",
      label: "客户管理",
      path: "customers",
      icon: "mdi:account-group"
    },
    {
      key: "leads",
      label: "线索管理", 
      path: "leads",
      icon: "mdi:lighthouse"
    },
    {
      key: "opportunities",
      label: "商机管理",
      path: "opportunities", 
      icon: "mdi:currency-usd"
    },
    {
      key: "orders",
      label: "订单管理",
      path: "orders",
      icon: "mdi:file-document"
    },
    {
      key: "reports",
      label: "统计报表",
      path: "reports",
      icon: "mdi:chart-box"
    }
  ];

  const onToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  return (
    <div className="flex h-dvh w-full gap-x-3">
      <SidebarDrawer
        className={cn("min-w-[288px] rounded-lg", {"min-w-[76px]": isCollapsed})}
        hideCloseButton={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <div className={cn(
          "will-change relative flex h-full w-72 flex-col bg-default-100 p-6 transition-width",
          {
            "w-[83px] items-center px-[6px] py-6": isCollapsed,
          }
        )}>
          <div className={cn("flex items-center gap-3 pl-2", {
            "justify-center gap-0 pl-0": isCollapsed,
          })}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground">
              <Icon icon="mdi:store" className="text-background" />
            </div>
            <span className={cn("w-full text-small font-bold uppercase opacity-100", {
              "w-0 opacity-0": isCollapsed,
            })}>
              CRM系统
            </span>
            <div className={cn("flex-end flex", {hidden: isCollapsed})}>
              <Icon
                className="cursor-pointer dark:text-primary-foreground/60 [&>g]:stroke-[1px]"
                icon="solar:round-alt-arrow-left-line-duotone"
                width={24}
                onClick={onToggle}
              />
            </div>
          </div>

          <Spacer y={6} />

          <Sidebar
            defaultSelectedKey="dashboard"
            iconClassName="group-data-[selected=true]:text-default-50"
            isCompact={isCollapsed}
            itemClasses={{
              base: "px-3 rounded-large data-[selected=true]:!bg-foreground",
              title: "group-data-[selected=true]:text-default-50",
            }}
            items={navItems}
            selectedKeys={[location.pathname.split("/")[0] || "dashboard"]}
            onSelectionChange={(key) => {
              navigate(navItems.find(item => item.key === key)?.path || "");
            }}
          />
        </div>
      </SidebarDrawer>

      <main className="w-full">
        <div className="grid grid-cols-12 gap-0 overflow-y-hidden p-0 pb-2 sm:rounded-large sm:border-small sm:border-default-200">
          <div className="col-span-12">
            <Routes>
              <Route path="" element={<HomePage />} />
              <Route path="customers" element={<CustomerListPage />} />
              <Route path="customers/new" element={<CustomerFormPage />} />
              <Route path="customers/:id" element={<CustomerDetailPage />} />
              <Route path="customers/:id/edit" element={<CustomerFormPage />} />
              <Route path="leads" element={<LeadListPage />} />
              <Route path="leads/new" element={<LeadFormPage />} />
              <Route path="leads/:id" element={<LeadDetailPage />} />
              <Route path="leads/:id/edit" element={<LeadFormPage />} />
              <Route path="opportunities" element={<OpportunityListPage />} />
              <Route path="opportunities/new" element={<OpportunityFormPage />} />
              <Route path="opportunities/:id" element={<OpportunityDetailPage />} />
              <Route path="opportunities/:id/edit" element={<OpportunityFormPage />} />
              <Route path="orders" element={<OrderListPage />} />
              <Route path="orders/new" element={<OrderFormPage />} />
              <Route path="orders/:id" element={<OrderDetailPage />} />
              <Route path="orders/:id/edit" element={<OrderFormPage />} />
              <Route path="reports" element={<ReportPage />} />
              <Route path="*" element={<Navigate to="" replace />} />
            </Routes>
          </div>
        </div>
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
  leads = [];
  opportunities = [];
  orders = [];
  loading = false;

  constructor() {
    makeAutoObservable(this);
  }

  // 客户管理
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

  async addCustomer(data) {
    const customer = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    this.customers.push(customer);
    await DataService.saveCustomers(this.customers);
    message.success("添加成功");
    return customer;
  }

  async updateCustomer(id, data) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index > -1) {
      this.customers[index] = {
        ...this.customers[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      await DataService.saveCustomers(this.customers);
      message.success("更新成功");
    }
  }

  async deleteCustomer(id) {
    this.customers = this.customers.filter(c => c.id !== id);
    await DataService.saveCustomers(this.customers);
    message.success("删除成功");
  }

  // 线索管理
  async loadLeads() {
    this.loading = true;
    try {
      const result = await DataService.getLeads();
      runInAction(() => {
        this.leads = result || [];
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async addLead(data) {
    const lead = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    this.leads.push(lead);
    await DataService.saveLeads(this.leads);
    message.success("添加成功");
    return lead;
  }

  async updateLead(id, data) {
    const index = this.leads.findIndex(l => l.id === id);
    if (index > -1) {
      this.leads[index] = {
        ...this.leads[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      await DataService.saveLeads(this.leads);
      message.success("更新成功");
    }
  }

  async deleteLead(id) {
    this.leads = this.leads.filter(l => l.id !== id);
    await DataService.saveLeads(this.leads);
    message.success("删除成功");
  }

  // 商机管理
  async loadOpportunities() {
    this.loading = true;
    try {
      const result = await DataService.getOpportunities();
      runInAction(() => {
        this.opportunities = result || [];
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async addOpportunity(data) {
    const opportunity = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    this.opportunities.push(opportunity);
    await DataService.saveOpportunities(this.opportunities);
    message.success("添加成功");
    return opportunity;
  }

  async updateOpportunity(id, data) {
    const index = this.opportunities.findIndex(o => o.id === id);
    if (index > -1) {
      this.opportunities[index] = {
        ...this.opportunities[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      await DataService.saveOpportunities(this.opportunities);
      message.success("更新成功");
    }
  }

  async deleteOpportunity(id) {
    this.opportunities = this.opportunities.filter(o => o.id !== id);
    await DataService.saveOpportunities(this.opportunities);
    message.success("删除成功");
  }

  // 订单管理
  async loadOrders() {
    this.loading = true;
    try {
      const result = await DataService.getOrders();
      runInAction(() => {
        this.orders = result || [];
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async addOrder(data) {
    const order = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    this.orders.push(order);
    await DataService.saveOrders(this.orders);
    message.success("添加成功");
    return order;
  }

  async updateOrder(id, data) {
    const index = this.orders.findIndex(o => o.id === id);
    if (index > -1) {
      this.orders[index] = {
        ...this.orders[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      await DataService.saveOrders(this.orders);
      message.success("更新成功");
    }
  }

  async deleteOrder(id) {
    this.orders = this.orders.filter(o => o.id !== id);
    await DataService.saveOrders(this.orders);
    message.success("删除成功");
  }

  // 统计数据
  get customerCount() {
    return this.customers.length;
  }

  get leadCount() {
    return this.leads.length;
  }

  get opportunityCount() {
    return this.opportunities.length;
  }

  get orderCount() {
    return this.orders.length;
  }

  get totalOrderAmount() {
    return this.orders.reduce((sum, order) => sum + (order.amount || 0), 0);
  }

  get salesFunnelData() {
    const leadCount = this.leads.length;
    const opportunityCount = this.opportunities.length;
    const wonOpportunityCount = this.opportunities.filter(o => o.stage === 'won').length;
    const orderCount = this.orders.length;

    return [
      { value: leadCount, name: '线索', fill: '#1677ff' },
      { value: opportunityCount, name: '商机', fill: '#52c41a' },
      { value: wonOpportunityCount, name: '赢单', fill: '#722ed1' },
      { value: orderCount, name: '订单', fill: '#f5222d' }
    ];
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
  },

  async getLeads() {
    const result = await api.getMetadata([\`\${appId}_leads\`]);
    return result.data?.[0]?.value ? JSON.parse(result.data[0].value) : [];
  },

  async saveLeads(leads) {
    await api.setMetadata(\`\${appId}_leads\`, JSON.stringify(leads));
  },

  async getOpportunities() {
    const result = await api.getMetadata([\`\${appId}_opportunities\`]);
    return result.data?.[0]?.value ? JSON.parse(result.data[0].value) : [];
  },

  async saveOpportunities(opportunities) {
    await api.setMetadata(\`\${appId}_opportunities\`, JSON.stringify(opportunities));
  },

  async getOrders() {
    const result = await api.getMetadata([\`\${appId}_orders\`]);
    return result.data?.[0]?.value ? JSON.parse(result.data[0].value) : [];
  },

  async saveOrders(orders) {
    await api.setMetadata(\`\${appId}_orders\`, JSON.stringify(orders));
  }
};

wpm.export('service_data', service);
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
  Cell,
  Funnel,
  FunnelChart,
  LabelList
} = recharts;

// 导入数据服务
const DataStore = await wpm.import('store_data');

const HomePage = observer(() => {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    DataStore.loadCustomers();
    DataStore.loadLeads();
    DataStore.loadOpportunities();
    DataStore.loadOrders();
  }, []);

  // 销售趋势数据
  const salesTrendData = [
    { month: '1月', leads: 100, opportunities: 80, orders: 40 },
    { month: '2月', leads: 120, opportunities: 90, orders: 45 },
    { month: '3月', leads: 140, opportunities: 100, orders: 50 },
    { month: '4月', leads: 160, opportunities: 120, orders: 60 },
    { month: '5月', leads: 180, opportunities: 140, orders: 70 },
    { month: '6月', leads: 200, opportunities: 160, orders: 80 }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* 数据概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-primary-50">
            <CardBody>
              <div className="flex items-center gap-2">
                <Icon icon="mdi:account-multiple" className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-small text-default-500">客户总数</p>
                  <p className="text-xl font-bold">{DataStore.customerCount}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-success-50">
            <CardBody>
              <div className="flex items-center gap-2">
                <Icon icon="mdi:lighthouse" className="w-6 h-6 text-success" />
                <div>
                  <p className="text-small text-default-500">线索数量</p>
                  <p className="text-xl font-bold">{DataStore.leadCount}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-warning-50">
            <CardBody>
              <div className="flex items-center gap-2">
                <Icon icon="mdi:currency-usd" className="w-6 h-6 text-warning" />
                <div>
                  <p className="text-small text-default-500">商机数量</p>
                  <p className="text-xl font-bold">{DataStore.opportunityCount}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-secondary-50">
            <CardBody>
              <div className="flex items-center gap-2">
                <Icon icon="mdi:file-document" className="w-6 h-6 text-secondary" />
                <div>
                  <p className="text-small text-default-500">订单总额</p>
                  <p className="text-xl font-bold">￥{DataStore.totalOrderAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 销售趋势 */}
          <Card>
            <CardBody>
              <h3 className="text-medium font-semibold mb-4">销售趋势</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesTrendData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1677ff" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1677ff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOpportunities" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#52c41a" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f5222d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f5222d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#1677ff" 
                    fillOpacity={1} 
                    fill="url(#colorLeads)" 
                    name="线索"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="opportunities" 
                    stroke="#52c41a" 
                    fillOpacity={1} 
                    fill="url(#colorOpportunities)"
                    name="商机"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#f5222d" 
                    fillOpacity={1} 
                    fill="url(#colorOrders)"
                    name="订单"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* 销售漏斗 */}
          <Card>
            <CardBody>
              <h3 className="text-medium font-semibold mb-4">销售漏斗</h3>
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Tooltip />
                  <Funnel
                    data={DataStore.salesFunnelData}
                    dataKey="value"
                    nameKey="name"
                  >
                    <LabelList position="right" fill="#000" stroke="none" dataKey="name" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>

        {/* 快捷操作 */}
        <Card>
          <CardBody>
            <h3 className="text-medium font-semibold mb-4">快捷操作</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                className="h-24"
                color="primary"
                variant="flat"
                startContent={<Icon icon="mdi:account-plus" className="w-6 h-6" />}
                onClick={() => navigate("/customers/new")}
              >
                新增客户
              </Button>
              <Button
                className="h-24"
                color="success"
                variant="flat"
                startContent={<Icon icon="mdi:lighthouse" className="w-6 h-6" />}
                onClick={() => navigate("/leads/new")}
              >
                创建线索
              </Button>
              <Button
                className="h-24"
                color="warning"
                variant="flat"
                startContent={<Icon icon="mdi:currency-usd" className="w-6 h-6" />}
                onClick={() => navigate("/opportunities/new")}
              >
                添加商机
              </Button>
              <Button
                className="h-24"
                color="secondary"
                variant="flat"
                startContent={<Icon icon="mdi:file-document-plus" className="w-6 h-6" />}
                onClick={() => navigate("/orders/new")}
              >
                创建订单
              </Button>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
});

wpm.export('page_home', HomePage);
</mo-ai-code>