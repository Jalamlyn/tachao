<mo-ai-code type="component" name="comp_table_content">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  message
} = context;

const { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } = NextUI;
const Status = await wpm.import('comp_status');
const CopyText = await wpm.import('comp_copy_text');
const { columns } = await wpm.import('module_table_constants');

const TableContent = observer(({
  items,
  sortDescriptor,
  onSortChange,
  selectedKeys,
  onSelectionChange,
  visibleColumns,
  onEdit,
  onDelete
}) => {
  // 根据visibleColumns过滤columns
  const filteredColumns = React.useMemo(() => {
    if (visibleColumns === "all") return columns;
    return columns.filter((column) => 
      Array.from(visibleColumns).includes(column.key)
    );
  }, [visibleColumns]);

  const renderCell = (item, columnKey) => {
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
                <DropdownItem onPress={() => onEdit(item.id)}>
                  编辑
                </DropdownItem>
                <DropdownItem onPress={() => onDelete(item.id)} className="text-danger" color="danger">
                  删除
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  };

  return (
    <Table
      aria-label="示例表格"
      isHeaderSticky
      classNames={{
        wrapper: "max-h-[382px]",
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      sortDescriptor={sortDescriptor}
      onSelectionChange={onSelectionChange}
      onSortChange={onSortChange}
    >
      <TableHeader columns={filteredColumns}>
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
        items={items}
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

wpm.export('comp_table_content', TableContent);
</mo-ai-code>