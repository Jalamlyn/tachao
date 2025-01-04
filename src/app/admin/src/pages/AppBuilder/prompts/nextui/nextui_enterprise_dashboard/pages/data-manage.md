```jsx
<mo-ai-code type="page" pageid="page_data_manage" title="数据管理">
const {
  wpm,
  React,
  observer,
  NextUI,
  message,
  api
} = context;

const { useState, useEffect } = React;
const tableStore = await wpm.import('store_table');

// 导入组件
const TableToolbar = await wpm.import('comp_table_toolbar');
const TableContent = await wpm.import('comp_table_content');
const TablePagination = await wpm.import('comp_table_pagination');

const DataManage = observer(() => {
  // 状态管理
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState(new Set(["id", "name", "status", "createdAt", "actions"]));
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

  // 过滤处理
  const filteredItems = () => {
    let filteredData = [...tableStore.items];

    if (filterValue) {
      filteredData = filteredData.filter((item) =>
        item.name.toLowerCase().includes(filterValue.toLowerCase())
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
        new Date(item.createdAt) >= cutoff
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
          <h1 className="text-3xl font-bold leading-9 text-default-foreground">数据管理</h1>
          <h2 className="mt-2 text-small text-default-500">
            管理和维护系统数据，支持筛选、排序和批量操作。
          </h2>
        </div>
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

wpm.export('page_data_manage', DataManage);
</mo-ai-code>
```