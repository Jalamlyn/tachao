```jsx
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
```
