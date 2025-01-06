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
const { Card, CardBody } = NextUI;
const tableStore = await context.wpm.import('store_table');

// 导入组件
const TableToolbar = await context.wpm.import('comp_table_toolbar');
const TableContent = await context.wpm.import('comp_table_content');
const TablePagination = await context.wpm.import('comp_table_pagination');

const DataManage = observer(() => {
  // 状态管理
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(new Set(["id", "name", "product", "workshop", "planQuantity", "finishQuantity", "qualifiedQuantity", "status", "actions"]));
  const [rowsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "id",
    direction: "ascending",
  });

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // 初始化加载数据
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

  // 获取统计数据
  const statistics = tableStore.getStatistics();

  // 过滤处理
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

  // 分页数据
  const paginatedItems = () => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems().slice(start, end);
  };

  // 排序数据
  const sortedItems = () => {
    return [...paginatedItems()].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  };

  // 处理编辑
  const handleEdit = async (id) => {
    try {
      message.success("编辑成功");
      await saveData(tableStore.items);
    } catch (error) {
      message.error("编辑失败");
      console.error("Failed to edit:", error);
    }
  };

  // 处理删除
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

  // 保存数据
  const saveData = async (data) => {
    try {
      await api.setMetadata(`${appId}_table_data`, JSON.stringify(data));
    } catch (error) {
      message.error("保存失败");
      console.error("Failed to save data:", error);
    }
  };

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

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardBody>
            <div className="flex flex-col">
              <span className="text-small text-default-500">工序计划委外数量</span>
              <span className="text-xl font-semibold">{statistics.totalPlan}</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex flex-col">
              <span className="text-small text-default-500">委外派工数量</span>
              <span className="text-xl font-semibold">{statistics.totalFinish}</span>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex flex-col">
              <span className="text-small text-default-500">委外合格数量</span>
              <span className="text-xl font-semibold">{statistics.totalQualified}</span>
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
              <span className="text-xl font-semibold">{statistics.finishRate}%</span>
            </div>
          </CardBody>
        </Card>
      </div>

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
  );
});

context.wpm.export('page_data_manage', DataManage);
</mo-ai-code>