```jsx
<mo-ai-code type="component" name="comp_delivery_table">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Button, Chip, useDisclosure } = NextUI;
const deliveryStore = await context.wpm.import('store_delivery');
const DeliveryForm = await context.wpm.import('comp_delivery_form');
const DeliveryDetail = await context.wpm.import('comp_delivery_detail');

const DeliveryTable = observer(() => {
  const formModal = useDisclosure();
  const detailModal = useDisclosure();
  const [selectedOrder, setSelectedOrder] = React.useState(null);

  const columns = [
    {
      key: "customerName",
      label: "客户名称"
    },
    {
      key: "contactPerson",
      label: "联系人"
    },
    {
      key: "contactPhone",
      label: "联系电话"
    },
    {
      key: "deliveryTime",
      label: "送货日期"
    },
    {
      key: "totalAmount",
      label: "总金额"
    },
    {
      key: "status",
      label: "状态"
    },
    {
      key: "actions",
      label: "操作"
    }
  ];

  const handleEdit = (order) => {
    deliveryStore.setCurrentOrder(order);
    formModal.onOpen();
  };

  const handleView = (order) => {
    setSelectedOrder(order);
    detailModal.onOpen();
  };

  const handleDelete = async (id) => {
    await deliveryStore.deleteDeliveryOrder(id);
  };

  const renderCell = (order, columnKey) => {
    const cellValue = order[columnKey];

    switch (columnKey) {
      case "totalAmount":
        const total = order.items.reduce((sum, item) => sum + item.amount, 0);
        return `¥${total}`;
        
      case "status":
        return (
          <Chip
            className="capitalize"
            color={
              order.status === "completed"
                ? "success"
                : order.status === "delivering"
                ? "warning"
                : "default"
            }
            size="sm"
            variant="flat"
          >
            {order.status === "completed"
              ? "已完成"
              : order.status === "delivering"
              ? "配送中"
              : "待处理"}
          </Chip>
        );
        
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleView(order)}
            >
              <Icon className="text-default-400" icon="solar:eye-bold" width={16} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => handleEdit(order)}
            >
              <Icon className="text-default-400" icon="solar:pen-bold" width={16} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              color="danger"
              variant="light"
              onPress={() => handleDelete(order.id)}
            >
              <Icon icon="solar:trash-bin-trash-bold" width={16} />
            </Button>
          </div>
        );
        
      default:
        return cellValue;
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">送货单列表</h3>
        <Button
          color="primary"
          endContent={<Icon icon="solar:add-circle-bold" />}
          onPress={() => {
            deliveryStore.clearCurrentOrder();
            formModal.onOpen();
          }}
        >
          新建送货单
        </Button>
      </div>

      <Table
        aria-label="送货单列表"
        classNames={{
          wrapper: "max-h-[600px]",
        }}
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
        <TableBody
          items={deliveryStore.deliveryOrders}
          emptyContent="暂无数据"
        >
          {(order) => (
            <TableRow key={order.id}>
              {(columnKey) => (
                <TableCell>{renderCell(order, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeliveryForm
        isOpen={formModal.isOpen}
        onOpenChange={formModal.onOpenChange}
      />

      <DeliveryDetail
        isOpen={detailModal.isOpen}
        onOpenChange={detailModal.onOpenChange}
        order={selectedOrder}
      />
    </div>
  );
});

context.wpm.export('comp_delivery_table', DeliveryTable);
</mo-ai-code>
```