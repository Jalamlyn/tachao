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
    const result = await api.getMetadata([`${appId}_customers`]);
    return result.data?.[0]?.value ? JSON.parse(result.data[0].value) : [];
  },

  async saveCustomers(customers) {
    await api.setMetadata(`${appId}_customers`, JSON.stringify(customers));
  },

  async getLeads() {
    const result = await api.getMetadata([`${appId}_leads`]);
    return result.data?.[0]?.value ? JSON.parse(result.data[0].value) : [];
  },

  async saveLeads(leads) {
    await api.setMetadata(`${appId}_leads`, JSON.stringify(leads));
  },

  async getOpportunities() {
    const result = await api.getMetadata([`${appId}_opportunities`]);
    return result.data?.[0]?.value ? JSON.parse(result.data[0].value) : [];
  },

  async saveOpportunities(opportunities) {
    await api.setMetadata(`${appId}_opportunities`, JSON.stringify(opportunities));
  },

  async getOrders() {
    const result = await api.getMetadata([`${appId}_orders`]);
    return result.data?.[0]?.value ? JSON.parse(result.data[0].value) : [];
  },

  async saveOrders(orders) {
    await api.setMetadata(`${appId}_orders`, JSON.stringify(orders));
  }
};

wpm.export('service_data', service);
</mo-ai-code>