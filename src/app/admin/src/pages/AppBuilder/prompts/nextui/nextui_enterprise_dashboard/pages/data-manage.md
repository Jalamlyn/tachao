<mo-ai-code type="page" name="page_data_manage" title="数据管理">
const {
  wpm,
  React,
  observer,
  NextUI,
  message,
  api,
  appId,
} = context;

const { useState, useEffect } = React;
const { Card, CardBody, Tabs, Tab, Select, SelectItem } = NextUI;
const tableStore = await context.wpm.import('store_table');

// 导入组件
const TableToolbar = await context.wpm.import('comp_table_toolbar');
const TableContent = await context.wpm.import('comp_table_content');
const TablePagination = await context.wpm.import('comp_table_pagination');

// 导入图表组件
const { Line } = await context.wpm.import('@ant-design/plots');

const DataManage = observer(() => {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(new Set([
    "id", "name", "product", "productCode", "workshop", "workshopCode", 
    "planQuantity", "finishQuantity", "qualifiedQuantity", "unit", "status", 
    "startDate", "endDate", "planCode", "actions"
  ]));
  const [rowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id",
    direction: "ascending",
  });

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("table");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedWorkshop, setSelectedWorkshop] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await api.getMetadata([`${appId}_table_data`]);
        if(result.data?.[0]?.value) {
          tableStore.setItems(JSON.parse(result.data[0].value));
        }
      } catch (error) {
        message.error("加载数据失败");
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  const statistics = tableStore.getStatistics();

  const filteredItems = () => {
    let filteredData = [...tableStore.items];

    if (filterValue) {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.product.toLowerCase().includes(filterValue.toLowerCase()) ||
        item.workshop.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filteredData = filteredData.filter((item) => item.status === statusFilter);
    }

    if (selectedPlan !== "all") {
      filteredData = filteredData.filter((item) => item.name === selectedPlan);
    }

    if (selectedProduct !== "all") {
      filteredData = filteredData.filter((item) => item.product === selectedProduct);
    }

    if (selectedWorkshop !== "all") {
      filteredData = filteredData.filter((item) => item.workshop === selectedWorkshop);
    }

    if (dateFilter !== "all") {
      const days = parseInt(dateFilter.match(/\d+/)[0]);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);

      filteredData = filteredData.filter((item) =>
        new Date(item.startDate) >= cutoff
      );
    }

    return filteredData;
  };

  const paginatedItems = () => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems().slice(start, end);
  };

  const sortedItems = () => {
    return [...paginatedItems()].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;
      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  };

  const handleExport = () => {
    try {
      const data = filteredItems();
      const csvContent = tableStore.exportToCSV(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `委外数据统计_${new Date().toLocaleDateString()}.csv`;
      link.click();
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败');
      console.error('Export failed:', error);
    }
  };

  const chartConfig = {
    data: tableStore.getChartData(),
    xField: 'date',
    yField: 'value',
    seriesField: 'category',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
    legend: {
      position: 'top',
    },
  };

  const handleEdit = async (id) => {
    try {
      message.success("编辑成功");
      await saveData(tableStore.items);
    } catch (error) {
      message.error("编辑失败");
      console.error("Failed to edit:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const newItems = tableStore.items.filter(item => item.id !== id);
      tableStore.setItems(newItems);
      message.success("删除成功");
      await saveData(newItems);
    } catch (error) {
      message.error("删除失败");
      console.error("Failed to delete:", error);
    }
  };

  const saveData = async (data) => {
    try {
      await api.setMetadata(`${appId}_table_data`, JSON.stringify(data));
    } catch (error) {
      message.error("保存失败");
      console.error("Failed to save data:", error);
    }
  };

  // 获取唯一的计划、产品和工序选项
  const planOptions = [...new Set(tableStore.items.map(item => item.name))];
  const productOptions = [...new Set(tableStore.items.map(item => item.product))];
  const workshopOptions = [...new Set(tableStore.items.map(item => item.workshop))];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-9 text-default-foreground">委外数据统计</h1>
          <h2 className="mt-2 text-small text-default-500">
            管理和统计委外生产数据，支持筛选、排序和导出。
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select 
          label="生产计划名称" 
          className="max-w-xs"
          value={selectedPlan}
          onChange={(e) => setSelectedPlan(e.target.value)}
        >
          <SelectItem key="all" value="all">全部</SelectItem>
          {planOptions.map(plan => (
            <SelectItem key={plan} value={plan}>{plan}</SelectItem>
          ))}
        </Select>

        <Select 
          label="产品名称" 
          className="max-w-xs"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <SelectItem key="all" value="all">全部</SelectItem>
          {productOptions.map(product => (
            <SelectItem key={product} value={product}>{product}</SelectItem>
          ))}
        </Select>

        <Select 
          label="工序名称" 
          className="max-w-xs"
          value={selectedWorkshop}
          onChange={(e) => setSelectedWorkshop(e.target.value)}
        >
          <SelectItem key="all" value="all">全部</SelectItem>
          {workshopOptions.map(workshop => (
            <SelectItem key={workshop} value={workshop}>{workshop}</SelectItem>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardBody>
            <div className="flex flex-col">
              <span className="text-small text-default-500">工序计划委外数量</span>
              <span className="text-xl font-semibold">{statistics.totalPlan}</span>
              <span className="text-tiny text-default-400">单位：件</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex flex-col">
              <span className="text-small text-default-500">委外派工数量</span>
              <span className="text-xl font-semibold">{statistics.totalFinish}</span>
              <span className="text-tiny text-default-400">单位：件</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex flex-col">
              <span className="text-small text-default-500">委外完工数量</span>
              <span className="text-xl font-semibold">{statistics.totalFinish}</span>
              <span className="text-tiny text-default-400">单位：件</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex flex-col">
              <span className="text-small text-default-500">委外合格数量</span>
              <span className="text-xl font-semibold">{statistics.totalQualified}</span>
              <span className="text-tiny text-default-400">单位：件</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex flex-col">
              <span className="text-small text-default-500">委外工序合格率</span>
              <span className="text-xl font-semibold">{statistics.qualifiedRate}%</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex flex-col">
              <span className="text-small text-default-500">委外工序目标完成率</span>
              <span className="text-xl font-semibold">{statistics.targetCompletionRate}%</span>
            </div>
          </CardBody>
        </Card>
      </div>

      <Tabs 
        selectedKey={activeTab}
        onSelectionChange={setActiveTab}
        aria-label="数据展示方式"
      >
        <Tab key="table" title="表格视图">
          <div className="flex flex-col gap-4">
            <TableToolbar
              filterValue={filterValue}
              onFilterChange={setFilterValue}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
              visibleColumns={visibleColumns}
              onVisibleColumnsChange={setVisibleColumns}
              selectedKeys={selectedKeys}
              totalItems={tableStore.items.length}
              onExport={handleExport}
            />
            
            <TableContent
              items={sortedItems()}
              sortDescriptor={sortDescriptor}
              onSortChange={setSortDescriptor}
              selectedKeys={selectedKeys}
              onSelectionChange={setSelectedKeys}
              visibleColumns={visibleColumns}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            <TablePagination
              page={page}
              total={Math.ceil(filteredItems().length / rowsPerPage)}
              selectedKeys={selectedKeys}
              totalItems={filteredItems().length}
              onChange={setPage}
            />
          </div>
        </Tab>
        <Tab key="chart" title="图表视图">
          <Card>
            <CardBody>
              <div className="h-[400px]">
                <Line {...chartConfig} />
              </div>
            </CardBody>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
});

context.wpm.export('page_data_manage', DataManage);
</mo-ai-code>