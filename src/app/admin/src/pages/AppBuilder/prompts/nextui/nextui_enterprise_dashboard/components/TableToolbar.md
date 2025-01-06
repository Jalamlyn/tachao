<mo-ai-code type="component" name="comp_table_toolbar">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Input, Button, Popover, PopoverTrigger, PopoverContent, Radio, RadioGroup, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } = NextUI;
const { columns } = await context.wpm.import('module_table_constants');

const TableToolbar = observer(({
  filterValue,
  onFilterChange,
  statusFilter,
  onStatusFilterChange,
  dateFilter,
  onDateFilterChange,
  visibleColumns,
  onVisibleColumnsChange,
  selectedKeys,
  totalItems
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="搜索..."
          startContent={<Icon icon="solar:magnifer-linear" />}
          value={filterValue}
          onClear={() => onFilterChange("")}
          onValueChange={onFilterChange}
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
                  onValueChange={onStatusFilterChange}
                >
                  <Radio value="all">全部</Radio>
                  <Radio value="active">活跃</Radio>
                  <Radio value="paused">暂停</Radio>
                  <Radio value="deleted">已删除</Radio>
                </RadioGroup>

                <RadioGroup
                  label="创建时间"
                  value={dateFilter}
                  onValueChange={onDateFilterChange}
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
              onSelectionChange={onVisibleColumnsChange}
            >
              {columns.map((column) => (
                <DropdownItem key={column.key}>{column.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>

          {(selectedKeys === "all" || selectedKeys.size > 0) && (
            <Dropdown>
              <DropdownTrigger>
                <Button
                  endContent={<Icon className="text-small" icon="solar:alt-arrow-down-linear" />}
                  variant="flat"
                >
                  批量操作
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="批量操作选项">
                <DropdownItem key="batch-edit">批量编辑</DropdownItem>
                <DropdownItem key="batch-delete" className="text-danger" color="danger">批量删除</DropdownItem>
                <DropdownItem key="batch-export">导出选中</DropdownItem>
                <DropdownItem key="batch-status">修改状态</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}

          <Button color="primary" endContent={<Icon icon="solar:add-circle-bold" />}>
            新建
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-default-400 text-small">
          共 {totalItems} 条数据
        </span>
        <span className="text-default-400 text-small">
          {selectedKeys === "all"
            ? "已选择全部"
            : `已选择 ${selectedKeys.size} 项`}
        </span>
      </div>
    </div>
  );
});

context.wpm.export('comp_table_toolbar', TableToolbar);
</mo-ai-code>