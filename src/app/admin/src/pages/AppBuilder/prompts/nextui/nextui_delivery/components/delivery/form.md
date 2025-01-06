```jsx
<mo-ai-code type="component" name="comp_delivery_form">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  message,
  cn
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } = NextUI;
const deliveryStore = await context.wpm.import('store_delivery');
const DeliveryItemForm = await context.wpm.import('comp_delivery_item_form');

const DeliveryForm = observer(({
  isOpen,
  onOpenChange
}) => {
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
    if (isOpen && deliveryStore.currentOrder) {
      setItems(deliveryStore.currentOrder.items || []);
    } else {
      setItems([]);
    }
  }, [isOpen, deliveryStore.currentOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (items.length === 0) {
      message.warning('请至少添加一个商品');
      return;
    }

    const data = {
      ...Object.fromEntries(formData.entries()),
      items,
      status: 'pending',
      ...(deliveryStore.currentOrder?.id ? { id: deliveryStore.currentOrder.id } : {})
    };

    setLoading(true);
    try {
      const success = await deliveryStore.saveDeliveryOrder(data);
      if (success) {
        onOpenChange(false);
        deliveryStore.clearCurrentOrder();
      }
    } finally {
      setLoading(false);
    }
  };

  const addItem = (item) => {
    setItems([...items, item]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, item) => {
    setItems(items.map((i, idx) => idx === index ? item : i));
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      size="3xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              {deliveryStore.currentOrder ? '编辑送货单' : '新建送货单'}
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  isRequired
                  label="客户名称"
                  name="customerName"
                  placeholder="请输入客户名称"
                  defaultValue={deliveryStore.currentOrder?.customerName}
                />
                <Input
                  isRequired
                  label="联系人"
                  name="contactPerson"
                  placeholder="请输入联系人"
                  defaultValue={deliveryStore.currentOrder?.contactPerson}
                />
                <Input
                  isRequired
                  label="联系电话"
                  name="contactPhone"
                  placeholder="请输入联系电话"
                  defaultValue={deliveryStore.currentOrder?.contactPhone}
                />
                <Input
                  isRequired
                  type="date"
                  label="送货日期"
                  name="deliveryTime"
                  placeholder="请选择送货日期"
                  defaultValue={deliveryStore.currentOrder?.deliveryTime || new Date().toISOString().split('T')[0]}
                />
                <Textarea
                  isRequired
                  className="md:col-span-2"
                  label="送货地址"
                  name="address"
                  placeholder="请输入详细地址"
                  defaultValue={deliveryStore.currentOrder?.address}
                />
              </div>

              <div className="mt-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">商品明细</h3>
                  <DeliveryItemForm onSubmit={addItem} />
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-default-500">
                            ¥{item.price} × {item.quantity} = ¥{item.amount}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <DeliveryItemForm
                          item={item}
                          onSubmit={(updatedItem) => updateItem(index, updatedItem)}
                        />
                        <Button
                          isIconOnly
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => removeItem(index)}
                        >
                          <Icon icon="solar:trash-bin-trash-bold" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="flex items-center justify-center rounded-lg border border-dashed p-6">
                      <p className="text-default-500">请添加商品</p>
                    </div>
                  )}
                </div>

                {items.length > 0 && (
                  <div className="mt-4 flex justify-end">
                    <div className="text-right">
                      <p className="text-small text-default-500">
                        共 {items.length} 件商品
                      </p>
                      <p className="text-xl font-semibold">
                        总计: ¥{items.reduce((sum, item) => sum + item.amount, 0)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                取消
              </Button>
              <Button color="primary" type="submit" isLoading={loading}>
                保存
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
});

context.wpm.export('comp_delivery_form', DeliveryForm);
</mo-ai-code>
```