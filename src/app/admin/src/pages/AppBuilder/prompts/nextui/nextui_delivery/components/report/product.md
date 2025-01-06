```jsx
<mo-ai-code type="component" name="comp_report_product">
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

const ProductReport = observer(() => {
  const report = reportStore.getCurrentReport();
  
  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* 销量排行 */}
      <Card>
        <CardBody>
          <h4 className="mb-4 text-medium font-medium">酒类销量排行</h4>
          <Table
            aria-label="酒类销量排行"
            removeWrapper
            classNames={{
              wrapper: "max-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn>排名</TableColumn>
              <TableColumn>商品名称</TableColumn>
              <TableColumn>销售数量</TableColumn>
            </TableHeader>
            <TableBody>
              {report.quantityRanking.map((item, index) => (
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
                  <TableCell>{item.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* 销售金额排行 */}
      <Card>
        <CardBody>
          <h4 className="mb-4 text-medium font-medium">酒类销售额排行</h4>
          <Table
            aria-label="酒类销售额排行"
            removeWrapper
            classNames={{
              wrapper: "max-h-[400px]",
            }}
          >
            <TableHeader>
              <TableColumn>排名</TableColumn>
              <TableColumn>商品名称</TableColumn>
              <TableColumn>销售金额</TableColumn>
              <TableColumn>平均单价</TableColumn>
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
                  <TableCell>¥{item.amount}</TableCell>
                  <TableCell>
                    ¥{report.averagePrice.find(avg => avg.name === item.name)?.average.toFixed(2)}
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

context.wpm.export('comp_report_product', ProductReport);
</mo-ai-code>
```