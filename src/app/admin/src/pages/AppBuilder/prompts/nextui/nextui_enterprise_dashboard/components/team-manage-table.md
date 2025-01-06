<mo-ai-code type="component" name="comp_team_manage_table">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const {
  Button,
  Input,
  Chip,
  User,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tabs,
  Tab,
  Card,
  CardBody,
} = NextUI;

const columns = [
  {name: "姓名", uid: "name", sortable: true},
  {name: "角色", uid: "role", sortable: true},
  {name: "状态", uid: "status", sortable: true},
  {name: "操作", uid: "actions"},
];

const users = [
  {
    id: 1,
    name: "张三",
    role: "所有者",
    team: "管理",
    status: "active",
    age: "29",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "zhangsan@example.com",
  },
  {
    id: 2,
    name: "李四",
    role: "成员",
    team: "开发",
    status: "pending",
    age: "25",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    email: "lisi@example.com",
  },
];

const statusColorMap = {
  active: "success",
  pending: "danger",
  vacation: "warning",
};

const TeamManageTable = observer(() => {
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const [rolesFilter, setRolesFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const hasSearchFilter = Boolean(filterValue);

  const filteredItems = React.useMemo(() => {
    let filteredUsers = [...users];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    if (rolesFilter !== "all") {
      filteredUsers = filteredUsers.filter((user) =>
        user.role.toLowerCase() === rolesFilter.toLowerCase(),
      );
    }

    if (statusFilter !== "all") {
      filteredUsers = filteredUsers.filter((user) =>
        user.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    return filteredUsers;
  }, [filterValue, rolesFilter, statusFilter, hasSearchFilter]);

  const renderCell = React.useCallback((user, columnKey) => {
    const cellValue = user[columnKey];

    switch (columnKey) {
      case "name":
        return (
          <User
            avatarProps={{radius: "lg", src: user.avatar}}
            description={user.email}
            name={cellValue}
          >
            {user.email}
          </User>
        );
      case "role":
        return (
          <div className="flex flex-col">
            <p className="text-bold text-small capitalize text-default-500">{cellValue}</p>
          </div>
        );
      case "status":
        return (
          <Chip className="capitalize" color={statusColorMap[user.status]} size="sm" variant="flat">
            {cellValue === 'active' ? '活跃' : cellValue === 'pending' ? '待定' : cellValue}
          </Chip>
        );
      case "actions":
        return (
          <div className="relative flex items-center justify-end gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <Icon className="text-default-500" icon="solar:menu-dots-bold" width={20} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem>查看</DropdownItem>
                <DropdownItem>编辑</DropdownItem>
                <DropdownItem>删除</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <Input
            isClearable
            className="w-full"
            placeholder="搜索成员..."
            startContent={<Icon icon="solar:magnifier-linear" width={20} />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button endContent={<Icon icon="solar:alt-arrow-down-linear" width={20} />} variant="flat">
                  团队角色
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={rolesFilter}
                selectionMode="multiple"
                onSelectionChange={setRolesFilter}
              >
                <DropdownItem key="owner" className="capitalize">所有者</DropdownItem>
                <DropdownItem key="member" className="capitalize">成员</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <Tabs
          aria-label="roles"
          className={"mt-3"}
          variant={"underlined"}
          onSelectionChange={(key) => {
            if (key === "pending-invitations") {
              setStatusFilter("pending");
            } else {
              setStatusFilter("all");
            }
          }}
        >
          <Tab key="members" title="成员" />
          <Tab key="pending-invitations" title="待定邀请" />
        </Tabs>
      </div>
    );
  }, [filterValue, rolesFilter, onSearchChange, onClear]);

  return (
    <Card className={"border border-default-200 bg-transparent"} shadow="none">
      <CardBody>
        <Table
          hideHeader
          isHeaderSticky
          aria-label="团队管理表格"
          checkboxesProps={{
            classNames: {
              wrapper: ["after:bg-foreground after:text-background text-background"],
            },
          }}
          classNames={{
            wrapper: "max-h-[382px] bg-transparent p-0 border-none shadow-none",
          }}
          selectedKeys={selectedKeys}
          selectionMode="multiple"
          topContent={topContent}
          topContentPlacement="outside"
          onSelectionChange={setSelectedKeys}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody emptyContent={"没有找到成员"} items={filteredItems}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_team_manage_table', TeamManageTable);
</mo-ai-code>