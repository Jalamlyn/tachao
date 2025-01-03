```jsx
<mo-ai-code type="app">
const {
  wpm,
  React,
  ReactRouterDom,
  observer,
  NextUI,
  Icon,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId
} = context;

const { useState, useCallback, useEffect } = React;
const {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Input,
  Button,
  Chip,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Radio,
  RadioGroup,
  Divider
} = NextUI;

// 导入组件和store
const Status = await wpm.import('comp_status');
const CopyText = await wpm.import('comp_copy_text');
const tableStore = await wpm.import('store_table');
const { columns, statusColorMap } = await wpm.import('module_table_constants');

const App = observer(() => {
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

  // 保存数据
  const saveData = async (data) => {
    try {
      await api.setMetadata(`${appId}_table_data`, JSON.stringify(data));
    } catch (error) {
      message.error("保存失败");
      console.error("Failed to save data:", error);
    }
  };

  // 过滤处理
  const filteredItems = React.useMemo(() => {
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
  }, [filterValue, statusFilter, dateFilter, tableStore.items]);

  // 分页数据
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  // 排序数据
  const sortedItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  // 渲染单元格
  const renderCell = useCallback((item, columnKey) => {
    const cellValue = item[columnKey];

    switch (columnKey) {
      case "id":
        return <CopyText>{cellValue}</CopyText>;
      case "status":
        return <Status status={cellValue} />;
      case "createdAt":
        return (
          <div className="flex items-center gap-1">
            <Icon className="text-default-400" icon="solar:calendar-linear" width={16} />
            <span>{new Date(cellValue).toLocaleDateString()}</span>
          </div>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2 justify-end">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <Icon className="text-default-400" icon="solar:menu-dots-bold" width={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem onPress={() => handleEdit(item.id)}>
                  编辑
                </DropdownItem>
                <DropdownItem onPress={() => handleDelete(item.id)} className="text-danger" color="danger">
                  删除
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  // 处理编辑
  const handleEdit = async (id) => {
    try {
      // 实现编辑逻辑
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

  // 顶部工具栏
  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            placeholder="搜索..."
            startContent={<Icon icon="solar:magnifer-linear" />}
            value={filterValue}
            onClear={() => setFilterValue("")}
            onValueChange={setFilterValue}
          />
          <div className="flex gap-3">
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Button
                  endContent={<Icon className="text-small" icon="solar:filter-linear" />}
                  variant="flat"
                >
                  筛选
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[240px]">
                <div className="px-1 py-2 flex flex-col gap-4">
                  <RadioGroup
                    label="状态"
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <Radio value="all">全部</Radio>
                    <Radio value="active">活跃</Radio>
                    <Radio value="paused">暂停</Radio>
                    <Radio value="deleted">已删除</Radio>
                  </RadioGroup>

                  <RadioGroup
                    label="创建时间"
                    value={dateFilter}
                    onValueChange={setDateFilter}
                  >
                    <Radio value="all">全部</Radio>
                    <Radio value="7days">最近7天</Radio>
                    <Radio value="30days">最近30天</Radio>
                    <Radio value="90days">最近90天</Radio>
                  </RadioGroup>
                </div>
              </PopoverContent>
            </Popover>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<Icon className="text-small" icon="solar:columns-line-bold" />}
                  variant="flat"
                >
                  列
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="列显示"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.key}>{column.label}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Button color="primary" endContent={<Icon icon="solar:add-circle-bold" />}>
              新建
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            共 {tableStore.items.length} 条数据
          </span>
          <span className="text-default-400 text-small">
            {selectedKeys === "all"
              ? "已选择全部"
              : `已选择 ${selectedKeys.size} 项`}
          </span>
        </div>
      </div>
    );
  }, [filterValue, statusFilter, dateFilter, visibleColumns, selectedKeys, tableStore.items.length]);

  // 底部分页
  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <span className="text-small text-default-400">
          {selectedKeys === "all"
            ? "已选择全部"
            : `已选择 ${selectedKeys.size} / ${filteredItems.length} 项`}
        </span>
        <Pagination
          showControls
          showShadow
          color="primary"
          page={page}
          total={Math.ceil(filteredItems.length / rowsPerPage)}
          onChange={setPage}
        />
      </div>
    );
  }, [selectedKeys, page, filteredItems.length, rowsPerPage]);

  return (
    <Table
      aria-label="示例表格"
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={setSelectedKeys}
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            align={column.key === "actions" ? "center" : "start"}
            allowsSorting={column.key !== "actions"}
          >
            {column.label}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        items={sortedItems}
        emptyContent="暂无数据"
      >
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
});

wpm.export(appId, App);
</mo-ai-code>
```

```mo
<mo-ai-file path="/Users/jalam/Works/mo-repo/shata-ai-front-v2/src/app/admin/src/pages/AppBuilder/prompts/nextui/nextui_table_with_filters/components/Status.md">
```jsx
<mo-ai-code type="component" name="comp_status">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const Status = observer(({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "paused":
        return "warning";
      case "deleted":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <NextUI.Chip
      className="capitalize"
      color={getStatusColor(status)}
      size="sm"
      variant="flat"
    >
      {status}
    </NextUI.Chip>
  );
});

wpm.export('comp_status', Status);
</mo-ai-code>
```

```mo
<mo-ai-file path="/Users/jalam/Works/mo-repo/shata-ai-front-v2/src/app/admin/src/pages/AppBuilder/prompts/nextui/nextui_table_with_filters/components/CopyText.md">
```jsx
<mo-ai-code type="component" name="comp_copy_text">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  message
} = context;

const CopyText = observer(({ children }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      message.success("已复制");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      message.error("复制失败");
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span>{children}</span>
      <NextUI.Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={handleCopy}
      >
        <Icon
          className="text-default-400"
          icon={copied ? "solar:check-circle-bold" : "solar:copy-linear"}
          width={16}
        />
      </NextUI.Button>
    </div>
  );
});

wpm.export('comp_copy_text', CopyText);
</mo-ai-code>
```

```mo
<mo-ai-file path="/Users/jalam/Works/mo-repo/shata-ai-front-v2/src/app/admin/src/pages/AppBuilder/prompts/nextui/nextui_table_with_filters/store.md">
```jsx
<mo-ai-code type="store" name="store_table">
const {
  wpm,
  mobx
} = context;

const { makeAutoObservable } = mobx;

class TableStore {
  items = [];
  
  constructor() {
    makeAutoObservable(this);
    
    // 初始化示例数据
    this.items = [
      {
        id: 1,
        name: "项目 A",
        status: "active",
        createdAt: "2024-01-01",
      },
      {
        id: 2,
        name: "项目 B",
        status: "paused",
        createdAt: "2024-01-15",
      },
      {
        id: 3,
        name: "项目 C",
        status: "deleted",
        createdAt: "2024-02-01",
      },
    ];
  }

  setItems(items) {
    this.items = items;
  }

  addItem(item) {
    this.items.push(item);
  }

  updateItem(id, data) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...data };
    }
  }

  deleteItem(id) {
    this.items = this.items.filter(item => item.id !== id);
  }
}

const store = new TableStore();
wpm.export('store_table', store);
</mo-ai-code>
```

```mo
<mo-ai-file path="/Users/jalam/Works/mo-repo/shata-ai-front-v2/src/app/admin/src/pages/AppBuilder/prompts/nextui/nextui_table_with_filters/module.md">
```jsx
<mo-ai-code type="module" name="module_table_constants">
const {
  wpm
} = context;

// 列定义
const columns = [
  {
    key: "id",
    label: "ID"
  },
  {
    key: "name",
    label: "名称"
  },
  {
    key: "status",
    label: "状态"
  },
  {
    key: "createdAt",
    label: "创建时间"
  },
  {
    key: "actions",
    label: "操作"
  }
];

// 状态颜色映射
const statusColorMap = {
  active: "success",
  paused: "warning",
  deleted: "danger"
};

const constants = {
  columns,
  statusColorMap
};

wpm.export('module_table_constants', constants);
</mo-ai-code>
```

```mo
<mo-ai-file path="/Users/jalam/Works/mo-repo/shata-ai-front-v2/src/app/admin/src/pages/AppBuilder/prompts/nextui/nextui_table_with_filters/index.ts">
import { markdown as app } from "./app.md"
import { markdown as status } from "./components/Status.md"
import { markdown as copyText } from "./components/CopyText.md"
import { markdown as store } from "./store.md"
import { markdown as module } from "./module.md"

export default `
${app}

${status}

${copyText}

${store}

${module}
`