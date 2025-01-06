```jsx
<mo-ai-code type="component" name="comp_report_customer">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } = NextUI;
const reportStore = await context.wpm.import('store_report');

const CustomerReport = observer(() => {
  const report = reportStore.getCurrentReport();
  
  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* 订单数量排行 */}
      <Card>
        <CardBody>
          <h4 className="mb-4 text-medium font-medium">客户订单排行</h4>
          <Table
            aria-label="客户订单排行"
            removeWrapper
            classNames={{
              wrapper: "max-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn>排名</TableColumn>
              <TableColumn>客户名称</TableColumn>
              <TableColumn>订单数量</TableColumn>
            </TableHeader>
            <TableBody>
              {report.orderRanking.map((item, index) => (
                <TableRow key={item.name}>
                  <TableCell>
                    {index < 3 ? (
                      <Icon
                        className={cn(
                          "text-2xl",
                          index === 0 ? "text-warning" : 
                          index === 1 ? "text-default-400" : 
                          "text-orange-600"
                        )}
                        icon="solar:medal-ribbons-star-bold"
                      />
                    ) : (
                      `#${index + 1}`
                    )}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.orderCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* 消费金额排行 */}
      <Card>
        <CardBody>
          <h4 className="mb-4 text-medium font-medium">客户消费排行</h4>
          <Table
            aria-label="客户消费排行"
            removeWrapper
            classNames={{
              wrapper: "max-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn>排名</TableColumn>
              <TableColumn>客户名称</TableColumn>
              <TableColumn>消费金额</TableColumn>
              <TableColumn>平均订单金额</TableColumn>
            </TableHeader>
            <TableBody>
              {report.amountRanking.map((item, index) => (
                <TableRow key={item.name}>
                  <TableCell>
                    {index < 3 ? (
                      <Icon
                        className={cn(
                          "text-2xl",
                          index === 0 ? "text-warning" : 
                          index === 1 ? "text-default-400" : 
                          "text-orange-600"
                        )}
                        icon="solar:medal-ribbons-star-bold"
                      />
                    ) : (
                      `#${index + 1}`
                    )}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>¥{item.totalAmount}</TableCell>
                  <TableCell>
                    ¥{report.averageOrderAmount.find(avg => avg.name === item.name)?.average.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
});

context.wpm.export('comp_report_customer', CustomerReport);
</mo-ai-code>
```