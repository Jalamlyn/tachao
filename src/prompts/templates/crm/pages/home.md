<mo-ai-code type="page" name="page_home">
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