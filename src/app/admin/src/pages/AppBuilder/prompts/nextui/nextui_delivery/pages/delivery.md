```jsx
<mo-ai-code type="page" name="page_delivery" title="送货单管理">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody } = NextUI;
const deliveryStore = await context.wpm.import('store_delivery');
const DeliveryTable = await context.wpm.import('comp_delivery_table');

const DeliveryPage = observer(() => {
  React.useEffect(() => {
    deliveryStore.loadDeliveryOrders();
  }, []);

  const stats = deliveryStore.getStatistics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">送货单管理</h1>
        <p className="mt-1 text-small text-default-500">
          管理和跟踪酒类配送订单
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-small font-medium text-default-500">总订单数</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold">{stats.total}</span>
                  <span className="text-small text-default-400">单</span>
                </div>
              </div>
              <div className="rounded-lg bg-primary/10 p-2">
                <Icon
                  className="text-primary"
                  icon="solar:document-bold-duotone"
                  width={24}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-small font-medium text-default-500">待处理</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold">{stats.pending}</span>
                  <span className="text-small text-default-400">单</span>
                </div>
              </div>
              <div className="rounded-lg bg-warning/10 p-2">
                <Icon
                  className="text-warning"
                  icon="solar:clock-circle-bold-duotone"
                  width={24}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-small font-medium text-default-500">配送中</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold">{stats.delivering}</span>
                  <span className="text-small text-default-400">单</span>
                </div>
              </div>
              <div className="rounded-lg bg-secondary/10 p-2">
                <Icon
                  className="text-secondary"
                  icon="solar:delivery-bold-duotone"
                  width={24}
                />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-small font-medium text-default-500">已完成</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold">{stats.completed}</span>
                  <span className="text-small text-default-400">单</span>
                </div>
              </div>
              <div className="rounded-lg bg-success/10 p-2">
                <Icon
                  className="text-success"
                  icon="solar:check-circle-bold-duotone"
                  width={24}
                />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody>
          <DeliveryTable />
        </CardBody>
      </Card>
    </div>
  );
});

context.wpm.export('page_delivery', DeliveryPage);
</mo-ai-code>
```