```jsx
<mo-ai-code type="component" name="comp_report_dashboard">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody, Button, RadioGroup, Radio } = NextUI;
const reportStore = await context.wpm.import('store_report');
const CustomerReport = await context.wpm.import('comp_report_customer');
const ProductReport = await context.wpm.import('comp_report_product');

const ReportDashboard = observer(() => {
  React.useEffect(() => {
    reportStore.generateReport();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">数据报表</h2>
          <p className="text-small text-default-500">
            查看销售数据统计和分析
          </p>
        </div>

        <div className="flex items-center gap-4">
          <RadioGroup
            orientation="horizontal"
            value={reportStore.currentDimension}
            onValueChange={value => reportStore.setDimension(value)}
          >
            <Radio value="customer">客户维度</Radio>
            <Radio value="product">商品维度</Radio>
          </RadioGroup>

          <Button
            variant="flat"
            startContent={<Icon icon="solar:refresh-circle-bold" />}
            onPress={() => reportStore.refreshReport()}
          >
            刷新数据
          </Button>
        </div>
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <Input
              type="date"
              label="开始日期"
              value={reportStore.dateRange.start}
              onChange={e => reportStore.setDateRange(e.target.value, reportStore.dateRange.end)}
            />
            <Input
              type="date"
              label="结束日期"
              value={reportStore.dateRange.end}
              onChange={e => reportStore.setDateRange(reportStore.dateRange.start, e.target.value)}
            />
          </div>
        </CardBody>
      </Card>

      {reportStore.currentDimension === 'customer' ? (
        <CustomerReport />
      ) : (
        <ProductReport />
      )}
    </div>
  );
});

context.wpm.export('comp_report_dashboard', ReportDashboard);
</mo-ai-code>
```