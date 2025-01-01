<mo-ai-code type="page" pageid="page_customer_list">
const { 
  wpm, 
  React, 
  observer, 
  Icon, 
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId
} = context;

const { motion } = FramerMotion;
const { 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} = NextUI;
const { useNavigate } = ReactRouterDom;

// 导入数据服务
const DataStore = await wpm.import('store_data');

const CustomerListPage = observer(() => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState(new Set([]));
  const {isOpen, onOpen, onClose} = useDisclosure();
  const [customerToDelete, setCustomerToDelete] = React.useState(null);

  React.useEffect(() => {
    DataStore.loadCustomers();
  }, []);

  const filteredCustomers = React.useMemo(() => {
    return DataStore.customers.filter(customer => 
      customer.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.phone?.includes(searchText) ||
      customer.email?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [DataStore.customers, searchText]);

  const handleDelete = async () => {
    if (customerToDelete) {
      await DataStore.deleteCustomer(customerToDelete.id);
      setCustomerToDelete(null);
      onClose();
    }
  };

  const columns = [
    {
      key: "name",
      label: "客户名称"
    },
    {
      key: "type",
      label: "客户类型",
      renderCell: (item) => (
        <Chip
          className="capitalize"
          color={item.type === 'company' ? 'primary' : 'secondary'}
          size="sm"
          variant="flat"
        >
          {item.type === 'company' ? '企业' : '个人'}
        </Chip>
      )
    },
    {
      key: "contact",
      label: "联系人"
    },
    {
      key: "phone",
      label: "联系电话"
    },
    {
      key: "email",
      label: "电子邮箱"
    },
    {
      key: "actions",
      label: "操作",
      renderCell: (item) => (
        <div className="flex gap-2">
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => navigate(`/customers/${item.id}`)}
          >
            <Icon icon="mdi:eye" className="text-default-500" width={20} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => navigate(`/customers/${item.id}/edit`)}
          >
            <Icon icon="mdi:pencil" className="text-default-500" width={20} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => {
              setCustomerToDelete(item);
              onOpen();
            }}
          >
            <Icon icon="mdi:delete" className="text-danger" width={20} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">客户管理</h1>
          <Button
            color="primary"
            startContent={<Icon icon="mdi:plus" width={20} />}
            onPress={() => navigate("/customers/new")}
          >
            新增客户
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Input
            className="w-72"
            placeholder="搜索客户..."
            startContent={<Icon icon="mdi:magnify" className="text-default-400" width={20} />}
            value={searchText}
            onValueChange={setSearchText}
          />
          
          <div className="flex gap-3">
            <Button
              isDisabled={selectedKeys.size === 0}
              color="primary"
              variant="flat"
              startContent={<Icon icon="mdi:download" width={20} />}
            >
              导出
            </Button>
            <Button
              isDisabled={selectedKeys.size === 0}
              color="danger"
              variant="flat"
              startContent={<Icon icon="mdi:delete" width={20} />}
            >
              批量删除
            </Button>
          </div>
        </div>

        <Table
          aria-label="客户列表"
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn 
                key={column.key}
                align={column.key === "actions" ? "center" : "start"}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={filteredCustomers}>
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{columns.find(col => col.key === columnKey)?.renderCell?.(item) || item[columnKey]}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader className="flex flex-col gap-1">确认删除</ModalHeader>
            <ModalBody>
              <p>
                确定要删除客户 "{customerToDelete?.name}" 吗？此操作不可恢复。
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                取消
              </Button>
              <Button color="danger" onPress={handleDelete}>
                删除
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </motion.div>
    </div>
  );
});

wpm.export('page_customer_list', CustomerListPage);
</mo-ai-code>