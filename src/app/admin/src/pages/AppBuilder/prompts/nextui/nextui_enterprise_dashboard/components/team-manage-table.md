```jsx
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
  {name: "NAME", uid: "name", sortable: true},
  {name: "ROLE", uid: "role", sortable: true},
  {name: "STATUS", uid: "status", sortable: true},
  {name: "ACTIONS", uid: "actions"},
];

const users = [
  {
    id: 1,
    name: "Tony Reichert",
    role: "Owner",
    team: "Management",
    status: "active",
    age: "29",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    email: "tony.reichert@acme.com",
  },
  {
    id: 2,
    name: "Zoey Lang",
    role: "Member",
    team: "Development",
    status: "pending",
    age: "25",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    email: "zoey.lang@acme.com",
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
            {cellValue}
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
                <DropdownItem>View</DropdownItem>
                <DropdownItem>Edit</DropdownItem>
                <DropdownItem>Delete</DropdownItem>
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
            placeholder="Search by name..."
            startContent={<Icon icon="solar:magnifier-linear" width={20} />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger>
                <Button endContent={<Icon icon="solar:alt-arrow-down-linear" width={20} />} variant="flat">
                  All Team Roles
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
                <DropdownItem key="owner" className="capitalize">Owner</DropdownItem>
                <DropdownItem key="member" className="capitalize">Member</DropdownItem>
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
          <Tab key="members" title="Members" />
          <Tab key="pending-invitations" title="Pending Invitations" />
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
          aria-label="Team Manage Table"
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
          <TableBody emptyContent={"No users found"} items={filteredItems}>
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

wpm.export('comp_team_manage_table', TeamManageTable);
</mo-ai-code>
```