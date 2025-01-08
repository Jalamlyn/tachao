# 独立表单应用代码

## All Modules

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
  mobx,
  appId,
  cn
} = context;
const { Routes, Route, Navigate, useNavigate } = ReactRouterDom;
const { ScrollShadow, Spacer, Avatar, Button, useDisclosure, Spinner, Divider } = NextUI;

// 导入页面组件
const DeliverySharePage = await context.wpm.import('page_delivery_share');

const App = observer(() => {
  const navigate = useNavigate();

  return (
    <NextUI.NextUIProvider navigate={navigate}>
      <Routes>
        <Route path="/share/:id" element={<DeliverySharePage />} />
      </Routes>
    </NextUI.NextUIProvider>
  );
});

context.wpm.export(appId, App);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_basic_info" title="送货单基本信息">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Input, Textarea } = NextUI;

const DeliveryBasicInfo = observer(({
  readOnly = false,
  defaultValues = {}
}) => {
  return (
    <div>
      <h4 className="text-medium font-medium mb-4 flex items-center gap-2">
        <Icon className="text-primary" icon="solar:user-id-bold" />
        客户信息
      </h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          isRequired
          isReadOnly={readOnly}
          label="客户名称"
          name="customerName"
          placeholder="请输入客户名称"
          defaultValue={defaultValues?.customerName}
          classNames={{
            label: "text-default-600",
            input: "text-default-800"
          }}
          startContent={
            <Icon 
              className="text-default-400 pointer-events-none flex-shrink-0"
              icon="solar:user-bold"
              width={20}
            />
          }
        />
        <Input
          isRequired
          isReadOnly={readOnly}
          label="联系人"
          name="contactPerson"
          placeholder="请输入联系人"
          defaultValue={defaultValues?.contactPerson}
          classNames={{
            label: "text-default-600",
            input: "text-default-800"
          }}
          startContent={
            <Icon 
              className="text-default-400 pointer-events-none flex-shrink-0"
              icon="solar:user-id-bold"
              width={20}
            />
          }
        />
        <Input
          isRequired
          isReadOnly={readOnly}
          label="联系电话"
          name="contactPhone"
          placeholder="请输入联系电话"
          defaultValue={defaultValues?.contactPhone}
          classNames={{
            label: "text-default-600",
            input: "text-default-800"
          }}
          startContent={
            <Icon 
              className="text-default-400 pointer-events-none flex-shrink-0"
              icon="solar:phone-bold"
              width={20}
            />
          }
        />
        <Input
          isRequired
          isReadOnly={readOnly}
          type="date"
          label="送货日期"
          name="deliveryTime"
          placeholder="请选择送货日期"
          defaultValue={defaultValues?.deliveryTime || new Date().toISOString().split('T')[0]}
          classNames={{
            label: "text-default-600",
            input: "text-default-800"
          }}
          startContent={
            <Icon 
              className="text-default-400 pointer-events-none flex-shrink-0"
              icon="solar:calendar-bold"
              width={20}
            />
          }
        />
        <Textarea
          isRequired
          isReadOnly={readOnly}
          className="md:col-span-2"
          label="送货地址"
          name="address"
          placeholder="请输入详细地址"
          defaultValue={defaultValues?.address}
          classNames={{
            label: "text-default-600",
            input: "text-default-800"
          }}
          startContent={
            <Icon 
              className="text-default-400 pointer-events-none flex-shrink-0 mt-1"
              icon="solar:map-point-bold"
              width={20}
            />
          }
        />
      </div>
    </div>
  );
});

context.wpm.export('comp_delivery_basic_info', DeliveryBasicInfo);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_detail_confirm_modal" title="送货单确认表单模态框组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  api
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } = NextUI;

const DeliveryDetailConfirmModal = observer(({
  isOpen,
  onOpenChange,
  type,
  onConfirm
}) => {
  const [loading, setLoading] = React.useState(false);
  const [location, setLocation] = React.useState(null);

  React.useEffect(() => {
    if (isOpen) {
      // 获取当前位置
      api.location.getCurrentPosition().then(async position => {
        const address = await api.location.getAddressFromLocation(
          position.coords.latitude,
          position.coords.longitude
        );
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address
        });
      }).catch(() => {
        setLocation(null);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (!formData.get('name')?.trim()) {
      message.warning('请输入确认人姓名');
      return;
    }
    
    if (!formData.get('phone')?.trim()) {
      message.warning('请输入联系电话');
      return;
    }

    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      note: formData.get('note'),
      location
    };

    setLoading(true);
    try {
      await onConfirm(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
    >
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              <h3 className="text-xl font-semibold">
                {type === 'customer' ? '客户确认' : '业务员确认'}
              </h3>
              <p className="text-small text-default-500">
                请填写确认信息，带 * 为必填项
              </p>
            </ModalHeader>
            <ModalBody>
              <Input
                isRequired
                label="确认人姓名"
                name="name"
                placeholder="请输入姓名"
                startContent={
                  <Icon 
                    className="text-default-400 pointer-events-none flex-shrink-0"
                    icon="solar:user-bold"
                    width={20}
                  />
                }
              />
              <Input
                isRequired
                label="联系电话"
                name="phone"
                placeholder="请输入电话"
                startContent={
                  <Icon 
                    className="text-default-400 pointer-events-none flex-shrink-0"
                    icon="solar:phone-bold"
                    width={20}
                  />
                }
              />
              <Textarea
                label="备注"
                name="note"
                placeholder="可选填写备注信息"
                startContent={
                  <Icon 
                    className="text-default-400 pointer-events-none flex-shrink-0 mt-1"
                    icon="solar:notes-bold"
                    width={20}
                  />
                }
              />
              {location && (
                <div className="rounded-lg bg-default-100 p-3">
                  <div className="flex items-center gap-2 text-small">
                    <Icon 
                      className="text-success"
                      icon="solar:map-point-bold"
                      width={20}
                    />
                    <span>当前位置：{location.address}</span>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                color="danger" 
                variant="light" 
                onPress={onClose}
                startContent={<Icon icon="solar:close-circle-bold" />}
              >
                取消
              </Button>
              <Button 
                color="primary" 
                type="submit" 
                isLoading={loading}
                startContent={!loading && <Icon icon="solar:disk-bold" />}
              >
                确认
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
});

context.wpm.export('comp_delivery_detail_confirm_modal', DeliveryDetailConfirmModal);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_detail_confirmations" title="送货单确认记录组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Card, CardBody } = NextUI;

const DeliveryDetailConfirmations = observer(({
  order
}) => {
  if (!order.confirmations?.customer && !order.confirmations?.staff) {
    return null;
  }

  return (
    <Card>
      <CardBody>
        <h4 className="mb-4 text-medium font-medium flex items-center gap-2">
          <Icon className="text-primary" icon="solar:notes-bold" />
          确认记录
        </h4>
        <div className="space-y-4">
          {order.confirmations?.customer && (
            <div className="rounded-lg bg-default-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  className="text-success text-xl"
                  icon="solar:user-speak-bold"
                />
                <h5 className="text-small font-medium">客户确认信息</h5>
              </div>
              <div className="space-y-1">
                <p className="text-small">
                  <span className="text-default-500">确认人：</span>
                  {order.confirmations.customer.name}
                </p>
                <p className="text-small">
                  <span className="text-default-500">联系电话：</span>
                  {order.confirmations.customer.phone}
                </p>
                {order.confirmations.customer.note && (
                  <p className="text-small">
                    <span className="text-default-500">备注：</span>
                    {order.confirmations.customer.note}
                  </p>
                )}
                <p className="text-small">
                  <span className="text-default-500">确认时间：</span>
                  {new Date(order.confirmations.customer.time).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {order.confirmations?.staff && (
            <div className="rounded-lg bg-default-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon
                  className="text-secondary text-xl"
                  icon="solar:shield-minimalistic-bold"
                />
                <h5 className="text-small font-medium">业务员确认信息</h5>
              </div>
              <div className="space-y-1">
                <p className="text-small">
                  <span className="text-default-500">确认人：</span>
                  {order.confirmations.staff.name}
                </p>
                <p className="text-small">
                  <span className="text-default-500">联系电话：</span>
                  {order.confirmations.staff.phone}
                </p>
                {order.confirmations.staff.note && (
                  <p className="text-small">
                    <span className="text-default-500">备注：</span>
                    {order.confirmations.staff.note}
                  </p>
                )}
                <p className="text-small">
                  <span className="text-default-500">确认时间：</span>
                  {new Date(order.confirmations.staff.time).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_delivery_detail_confirmations', DeliveryDetailConfirmations);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_detail_info" title="送货单基本信息组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Card, CardBody } = NextUI;

const DeliveryDetailInfo = observer(({
  order
}) => {
  return (
    <Card>
      <CardBody>
        <h4 className="mb-4 text-medium font-medium flex items-center gap-2">
          <Icon className="text-primary" icon="solar:user-id-bold" />
          客户信息
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-small text-default-500">客户名称</p>
            <p className="font-medium">{order.customerName}</p>
          </div>
          <div>
            <p className="text-small text-default-500">联系人</p>
            <p className="font-medium">{order.contactPerson}</p>
          </div>
          <div>
            <p className="text-small text-default-500">联系电话</p>
            <p className="font-medium">{order.contactPhone}</p>
          </div>
          <div>
            <p className="text-small text-default-500">送货日期</p>
            <p className="font-medium">{order.deliveryTime}</p>
          </div>
          <div className="col-span-2">
            <p className="text-small text-default-500">送货地址</p>
            <p className="font-medium">{order.address}</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_delivery_detail_info', DeliveryDetailInfo);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_detail_items" title="送货单商品明细组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody } = NextUI;

const DeliveryDetailItems = observer(({
  order
}) => {
  const totalAmount = order.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardBody>
        <h4 className="mb-4 text-medium font-medium flex items-center gap-2">
          <Icon className="text-primary" icon="solar:box-bold" />
          商品明细
        </h4>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className={cn(
                "group flex items-center justify-between rounded-xl border p-4",
                "transition-colors duration-200",
                "hover:border-primary hover:bg-primary/5"
              )}
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h6 className="font-medium text-default-800">{item.name}</h6>
                    <div className="flex items-center gap-3 text-small text-default-500">
                      <span>单价: ¥{item.price}</span>
                      <span>数量: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">¥{item.amount}</p>
                    <p className="text-tiny text-default-400">小计</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end rounded-xl bg-primary/10 p-4">
          <div className="text-right">
            <p className="text-small text-default-600">
              共 {order.items.length} 件商品
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-default-600">总计:</span>
              <span className="text-2xl font-semibold text-primary">
                ¥{totalAmount}
              </span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
});

context.wpm.export('comp_delivery_detail_items', DeliveryDetailItems);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_form" title="送货单表单">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  message,
  cn
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Spinner } = NextUI;
const deliveryStore = await context.wpm.import('store_delivery');
const DeliveryBasicInfo = await context.wpm.import('comp_delivery_basic_info');
const DeliveryItemList = await context.wpm.import('comp_delivery_item_list');

const DeliveryForm = observer(({
  isOpen,
  onOpenChange,
  onSuccess,
  readOnly = false
}) => {
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const [formKey, setFormKey] = React.useState(0);
  const [initializing, setInitializing] = React.useState(true);
  const formRef = React.useRef(null);

  React.useEffect(() => {
    if (isOpen) {
      setInitializing(true);
      try {
        if (deliveryStore.currentOrder) {
          setItems(JSON.parse(JSON.stringify(deliveryStore.currentOrder.items || [])));
        } else {
          setItems([]);
        }
        setFormKey(prev => prev + 1);
      } finally {
        setInitializing(false);
      }
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
      customerName: formData.get('customerName'),
      contactPerson: formData.get('contactPerson'),
      contactPhone: formData.get('contactPhone'),
      deliveryTime: formData.get('deliveryTime'),
      address: formData.get('address'),
      items,
      status: 'pending',
      ...(deliveryStore.currentOrder?.id ? { 
        id: deliveryStore.currentOrder.id,
        confirmations: deliveryStore.currentOrder.confirmations,
        createdAt: deliveryStore.currentOrder.createdAt
      } : {})
    };

    setLoading(true);
    try {
      const success = await deliveryStore.saveDeliveryOrder(data);
      if (success) {
        onOpenChange(false);
        if (onSuccess) {
          const updatedOrder = await deliveryStore.getOrderById(data.id);
          onSuccess(updatedOrder);
        }
        deliveryStore.clearCurrentOrder();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="top-center"
      size="3xl"
      scrollBehavior="outside"
      classNames={{
        base: "bg-background",
        header: "border-b border-divider",
        body: "py-6",
        footer: "border-t border-divider"
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {initializing ? (
              <div className="flex h-[200px] items-center justify-center">
                <Spinner label="加载中..." />
              </div>
            ) : (
              <form key={formKey} onSubmit={handleSubmit} ref={formRef}>
                <ModalHeader className="flex flex-col gap-1">
                  <h3 className="text-xl font-semibold">
                    {deliveryStore.currentOrder ? '编辑送货单' : '新建送货单'}
                  </h3>
                  <p className="text-small text-default-500">
                    请填写送货单信息，带 * 为必填项
                  </p>
                </ModalHeader>
                <ModalBody>
                  <div className="space-y-8">
                    <DeliveryBasicInfo 
                      readOnly={readOnly}
                      defaultValues={deliveryStore.currentOrder}
                    />
                    <NextUI.Divider />
                    <DeliveryItemList
                      items={items}
                      readOnly={readOnly}
                      onItemsChange={setItems}
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button 
                    color="danger" 
                    variant="light" 
                    onPress={onClose}
                    startContent={<Icon icon="solar:close-circle-bold" />}
                  >
                    取消
                  </Button>
                  {!readOnly && (
                    <Button 
                      color="primary" 
                      type="submit" 
                      isLoading={loading}
                      startContent={!loading && <Icon icon="solar:disk-bold" />}
                    >
                      保存
                    </Button>
                  )}
                </ModalFooter>
              </form>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

context.wpm.export('comp_delivery_form', DeliveryForm);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_item_form" title="商品明细表单组件">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  message
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, useDisclosure } = NextUI;

const DeliveryItemForm = observer(({
  item,
  onSubmit,
  readOnly = false
}) => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    quantity: '',
    price: ''
  });

  React.useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        quantity: item.quantity.toString(),
        price: item.price.toString()
      });
    } else {
      setFormData({
        name: '',
        quantity: '',
        price: ''
      });
    }
  }, [item, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation()
    const quantity = parseInt(formData.quantity);
    const price = parseFloat(formData.price);
    
    if (isNaN(quantity) || quantity <= 0) {
      message.warning('请输入有效的数量');
      return;
    }
    
    if (isNaN(price) || price <= 0) {
      message.warning('请输入有效的单价');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        name: formData.name,
        quantity,
        price,
        amount: quantity * price
      };
      
      onSubmit(itemData);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const amount = parseFloat(formData.quantity || 0) * parseFloat(formData.price || 0);

  return (
    <>
      <Button
        size="sm"
        color="primary"
        variant={item ? "light" : "solid"}
        isIconOnly={!!item}
        onPress={onOpen}
        isDisabled={readOnly}
        className={item ? "w-9 h-9" : "h-9"}
        startContent={item ? null : <Icon icon="solar:add-circle-bold" className="text-current" />}
      >
        {item ? (
          <Icon icon="solar:pen-bold" className="text-current" />
        ) : (
          "添加商品"
        )}
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        classNames={{
          base: "bg-background",
          header: "border-b border-divider",
          body: "py-6",
          footer: "border-t border-divider"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold">
                  {item ? '编辑商品' : '添加商品'}
                </h3>
                <p className="text-small text-default-500">
                  请填写商品信息，所有字段均为必填
                </p>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  <Input
                    isRequired
                    isReadOnly={readOnly}
                    label="商品名称"
                    placeholder="请输入商品名称"
                    value={formData.name}
                    onChange={handleChange('name')}
                    classNames={{
                      label: "text-default-600",
                      input: "text-default-800"
                    }}
                    startContent={
                      <Icon 
                        className="text-default-400 pointer-events-none flex-shrink-0"
                        icon="solar:wine-glass-bold"
                        width={20}
                      />
                    }
                  />
                  <Input
                    isRequired
                    isReadOnly={readOnly}
                    type="number"
                    label="数量"
                    placeholder="请输入数量"
                    value={formData.quantity}
                    onChange={handleChange('quantity')}
                    min={1}
                    classNames={{
                      label: "text-default-600",
                      input: "text-default-800"
                    }}
                    startContent={
                      <Icon 
                        className="text-default-400 pointer-events-none flex-shrink-0"
                        icon="solar:box-minimalistic-bold"
                        width={20}
                      />
                    }
                  />
                  <Input
                    isRequired
                    isReadOnly={readOnly}
                    type="number"
                    label="单价"
                    placeholder="请输入单价"
                    value={formData.price}
                    onChange={handleChange('price')}
                    min={0}
                    step={0.01}
                    classNames={{
                      label: "text-default-600",
                      input: "text-default-800"
                    }}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400">¥</span>
                      </div>
                    }
                  />

                  {(formData.quantity && formData.price) && (
                    <div className="rounded-xl bg-primary/10 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-default-600">小计</span>
                        <span className="text-xl font-semibold text-primary">
                          ¥{amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={onClose}
                  startContent={<Icon icon="solar:close-circle-bold" />}
                >
                  取消
                </Button>
                {!readOnly && (
                  <Button 
                    color="primary" 
                    type="submit" 
                    isLoading={loading}
                    startContent={!loading && <Icon icon="solar:disk-bold" />}
                  >
                    确定
                  </Button>
                )}
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
});

context.wpm.export('comp_delivery_item_form', DeliveryItemForm);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_item_list" title="送货单商品列表">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const DeliveryItemForm = await context.wpm.import('comp_delivery_item_form');

const DeliveryItemList = observer(({
  items = [],
  readOnly = false,
  onItemsChange
}) => {
  const addItem = (item) => {
    onItemsChange([...items, item]);
  };

  const removeItem = (index) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, item) => {
    onItemsChange(items.map((i, idx) => idx === index ? item : i));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-medium font-medium flex items-center gap-2">
          <Icon className="text-primary" icon="solar:box-bold" />
          商品明细
        </h4>
        {!readOnly && (
          <DeliveryItemForm onSubmit={addItem} />
        )}
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "group flex items-center justify-between rounded-xl border p-4",
              "transition-colors duration-200",
              "hover:border-primary hover:bg-primary/5"
            )}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h6 className="font-medium text-default-800">{item.name}</h6>
                  <div className="flex items-center gap-3 text-small text-default-500">
                    <span>单价: ¥{item.price}</span>
                    <span>数量: {item.quantity}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">¥{item.amount}</p>
                  <p className="text-tiny text-default-400">小计</p>
                </div>
              </div>
            </div>
            {!readOnly && (
              <div className="ml-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <DeliveryItemForm
                  item={item}
                  onSubmit={(updatedItem) => updateItem(index, updatedItem)}
                />
                <NextUI.Button
                  isIconOnly
                  color="danger"
                  size="sm"
                  variant="light"
                  onPress={() => removeItem(index)}
                >
                  <Icon icon="solar:trash-bin-trash-bold" />
                </NextUI.Button>
              </div>
            )}
          </div>
        ))}

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8">
            <Icon 
              className="text-default-300 mb-2" 
              icon="solar:box-minimalistic-bold"
              width={48}
            />
            <p className="text-default-500">请添加商品</p>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-6 flex justify-end rounded-xl bg-primary/10 p-4">
          <div className="text-right">
            <p className="text-small text-default-600">
              共 {items.length} 件商品
            </p>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-default-600">总计:</span>
              <span className="text-2xl font-semibold text-primary">
                ¥{totalAmount}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

context.wpm.export('comp_delivery_item_list', DeliveryItemList);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_share_content" title="送货单分享页面内容">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Card, CardBody, Progress, Button } = NextUI;
const DeliveryDetailProgress = await context.wpm.import('comp_delivery_detail_progress');
const DeliveryDetailInfo = await context.wpm.import('comp_delivery_detail_info');
const DeliveryDetailItems = await context.wpm.import('comp_delivery_detail_items');
const DeliveryDetailConfirmations = await context.wpm.import('comp_delivery_detail_confirmations');

const DeliveryShareContent = observer(({
  order,
  onConfirm
}) => {
  const [confirming, setConfirming] = React.useState(false);
  const confirmProgress = [
    order.confirmations?.customer,
    order.confirmations?.staff
  ].filter(Boolean).length;

  const handleConfirm = async (type) => {
    setConfirming(true);
    try {
      await onConfirm(type);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-medium font-medium">确认进度</h4>
            <span className="text-small text-default-400">
              {confirmProgress}/2 已确认
            </span>
          </div>
          <Progress
            aria-label="确认进度"
            value={confirmProgress * 50}
            className="mb-4"
          />
          <div className="flex gap-2 justify-end">
            <Button
              color="primary"
              variant={order.confirmations?.customer ? "flat" : "solid"}
              startContent={<Icon icon="solar:user-check-bold" />}
              isDisabled={order.confirmations?.customer || confirming}
              isLoading={confirming}
              onPress={() => handleConfirm('customer')}
            >
              客户确认
            </Button>
            <Button
              color="secondary"
              variant={order.confirmations?.staff ? "flat" : "solid"}
              startContent={<Icon icon="solar:shield-check-bold" />}
              isDisabled={order.confirmations?.staff || confirming}
              isLoading={confirming}
              onPress={() => handleConfirm('staff')}
            >
              业务员确认
            </Button>
          </div>
        </CardBody>
      </Card>

      <DeliveryDetailInfo order={order} />
      <DeliveryDetailItems order={order} />
      <DeliveryDetailConfirmations order={order} />
    </div>
  );
});

context.wpm.export('comp_delivery_share_content', DeliveryShareContent);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_share_header" title="送货单分享页面头部">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Button } = NextUI;

const DeliveryShareHeader = observer(({
  onEdit
}) => {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-xl font-bold">送货单详情</h1>
      <Button
        color="primary"
        variant="flat"
        startContent={<Icon icon="solar:pen-bold" />}
        onPress={onEdit}
      >
        编辑
      </Button>
    </div>
  );
});

context.wpm.export('comp_delivery_share_header', DeliveryShareHeader);
</mo-ai-code>
```

```jsx
<mo-ai-code type="component" name="comp_delivery_share_layout" title="送货单分享页面布局">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Spinner } = NextUI;

const DeliveryShareLayout = observer(({
  loading,
  error,
  children
}) => {
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" label="加载中..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <Icon className="text-danger" icon="solar:shield-warning-bold" width={48} />
          </div>
          <p className="mb-2 text-xl">送货单不存在或已被删除</p>
          <p className="mb-4 text-small text-default-500">
            请检查链接是否正确，或联系管理员
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-default-50 p-6">
      <div className="mx-auto max-w-3xl">
        {children}
      </div>
    </div>
  );
});

context.wpm.export('comp_delivery_share_layout', DeliveryShareLayout);
</mo-ai-code>
```

```jsx
<mo-ai-code type="page" name="page_delivery_share" title="送货单分享页面">
const {
  wpm,
  React,
  observer,
  NextUI,
  ReactRouterDom,
  Icon
} = context;

const { useParams, useSearchParams } = ReactRouterDom;
const { useDisclosure } = NextUI;
const deliveryStore = await context.wpm.import('store_delivery');
const userStore = await context.wpm.import('store_user');
const DeliveryForm = await context.wpm.import('comp_delivery_form');
const DeliveryDetailConfirmModal = await context.wpm.import('comp_delivery_detail_confirm_modal');
const DeliveryShareHeader = await context.wpm.import('comp_delivery_share_header');
const DeliveryShareLayout = await context.wpm.import('comp_delivery_share_layout');
const DeliveryShareContent = await context.wpm.import('comp_delivery_share_content');

const DeliverySharePage = observer(() => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [confirmType, setConfirmType] = React.useState(null);
  const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onOpenChange: onConfirmOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  React.useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      try {
        const oid = searchParams.get('oid');
        if (!oid) {
          throw new Error('缺少组织ID参数');
        }
        await deliveryStore.loadOrderIndexes();
        const foundOrder = await deliveryStore.getOrderById(id);
        setOrder(foundOrder);
      } catch (error) {
        console.error('Failed to load order:', error);
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id, searchParams]);

  const handleConfirm = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      note: formData.get('note')
    };

    setConfirmLoading(true);
    try {
      const success = await deliveryStore.confirmDelivery(id, confirmType, data);
      if (success) {
        onConfirmOpenChange(false);
        const updatedOrder = await deliveryStore.getOrderById(id);
        setOrder(updatedOrder);
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  const openConfirmModal = (type) => {
    setConfirmType(type);
    onConfirmOpen();
  };

  const handleEdit = () => {
    deliveryStore.setCurrentOrder(order);
    onEditOpen();
  };

  return (
    <DeliveryShareLayout loading={loading} error={!order}>
      {order && (
        <>
          <DeliveryShareHeader onEdit={handleEdit} />
          <DeliveryShareContent 
            order={order}
            onConfirm={openConfirmModal}
          />

          <DeliveryDetailConfirmModal
            isOpen={isConfirmOpen}
            onOpenChange={onConfirmOpenChange}
            type={confirmType}
            onConfirm={handleConfirm}
          />

          <DeliveryForm
            isOpen={isEditOpen}
            onOpenChange={onEditOpenChange}
            onSuccess={(updatedOrder) => {
              setOrder(updatedOrder);
            }}
          />
        </>
      )}
    </DeliveryShareLayout>
  );
});

context.wpm.export('page_delivery_share', DeliverySharePage);
</mo-ai-code>
```

```jsx
<mo-ai-code type="service" name="service_delivery_confirm" title="送货单确认服务">
const {
  wpm,
  message,
  api
} = context;

const ConfirmService = {
  async startDelivering(orderId) {
    try {
      const order = await this.loadOrderDetail(orderId);
      if (!order) {
        message.error('订单不存在');
        return false;
      }

      if (order.status !== this.constructor.OrderStatus.PENDING) {
        message.error('只有待处理的订单可以开始配送');
        return false;
      }

      order.status = this.constructor.OrderStatus.DELIVERING;
      const success = await this.saveDeliveryOrder(order);
      
      if (success) {
        message.success('已开始配送');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to start delivering:', error);
      message.error('操作失败');
      return false;
    }
  },

  async confirmDelivery(orderId, type, data) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        message.error('获取用户信息失败，无法确认');
        return false;
      }

      const order = await this.loadOrderDetail(orderId);
      if (!order) {
        message.error('订单不存在');
        return false;
      }

      const now = new Date().toISOString();
      const confirmation = {
        time: now,
        name: data.name,
        phone: data.phone,
        note: data.note || '',
        location: data.location || null,
        operator: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          time: now
        }
      };

      if (type === 'customer') {
        order.confirmations.customer = confirmation;
        order.status = this.constructor.OrderStatus.CUSTOMER_CONFIRMED;
      } else if (type === 'staff') {
        order.confirmations.staff = confirmation;
        order.status = this.constructor.OrderStatus.STAFF_CONFIRMED;
      }

      if (order.confirmations.customer && order.confirmations.staff) {
        order.status = this.constructor.OrderStatus.COMPLETED;
      }

      const success = await this.saveDeliveryOrder(order);
      if (success) {
        message.success('确认成功');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to confirm delivery:', error);
      message.error('确认失败');
      return false;
    }
  }
};

context.wpm.export('service_delivery_confirm', ConfirmService);
</mo-ai-code>
```

```jsx
<mo-ai-code type="service" name="service_delivery_order" title="送货单基础操作服务">
const {
  wpm,
  message,
  api,
  appId
} = context;

const OrderService = {
  async loadOrderIndexes() {
    this.isLoading = true;
    try {
      const result = await api.getMetadata([`${appId}_order_indexes`]);
      if (result.data?.[0]?.value) {
        this.orderIndexes = JSON.parse(result.data[0].value);
      }
    } catch (error) {
      console.error('Failed to load order indexes:', error);
      message.error('加载订单列表失败');
    } finally {
      this.isLoading = false;
    }
  },

  async loadOrderDetail(orderId) {
    if (this.orderDetails.has(orderId)) {
      return this.orderDetails.get(orderId);
    }

    try {
      const result = await api.getMetadata([`${appId}_order_${orderId}`]);
      if (result.data?.[0]?.value) {
        const detail = JSON.parse(result.data[0].value);
        this.orderDetails.set(orderId, detail);
        return detail;
      }
      return null;
    } catch (error) {
      console.error('Failed to load order detail:', error);
      message.error('加载订单详情失败');
      return null;
    }
  },

  async saveDeliveryOrder(order) {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        message.error('获取用户信息失败，无法保存');
        return false;
      }

      const orderId = order.id || `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const now = new Date().toISOString();
      
      const orderData = {
        ...order,
        id: orderId,
        createdAt: order.createdAt || now,
        updatedAt: now,
        operator: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
          time: now
        },
        confirmations: order.confirmations || {
          customer: null,
          staff: null
        }
      };

      const indexData = {
        id: orderId,
        customerName: order.customerName,
        contactPerson: order.contactPerson,
        contactPhone: order.contactPhone,
        deliveryTime: order.deliveryTime,
        status: order.status,
        totalAmount: order.items.reduce((sum, item) => sum + item.amount, 0),
        createdAt: orderData.createdAt,
        updatedAt: orderData.updatedAt,
        operator: orderData.operator
      };

      await api.setMetadata(`${appId}_order_${orderId}`, JSON.stringify(orderData));

      if (order.id) {
        const index = this.orderIndexes.findIndex(o => o.id === order.id);
        if (index !== -1) {
          this.orderIndexes[index] = indexData;
        }
      } else {
        this.orderIndexes.unshift(indexData);
      }

      await api.setMetadata(`${appId}_order_indexes`, JSON.stringify(this.orderIndexes));
      
      this.orderDetails.set(orderId, orderData);
      this.clearProductStatsCache();
      
      message.success('保存成功');
      return true;
    } catch (error) {
      console.error('Failed to save delivery order:', error);
      message.error('保存失败');
      return false;
    }
  },

  async setCurrentOrder(orderIndex) {
    const detail = await this.loadOrderDetail(orderIndex.id);
    this.currentOrder = detail;
  },

  clearCurrentOrder() {
    this.currentOrder = null;
  },

  async getOrderById(id) {
    return await this.loadOrderDetail(id);
  }
};

context.wpm.export('service_delivery_order', OrderService);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_delivery" title="送货单数据管理">
const {
  wpm,
  mobx,
  api
} = context;

const { makeAutoObservable } = mobx;

const OrderService = await context.wpm.import('service_delivery_order');
const ConfirmService = await context.wpm.import('service_delivery_confirm');

class DeliveryStore {
  orderIndexes = [];
  orderDetails = new Map();
  currentOrder = null;
  isLoading = false;
  currentUser = null;

  constructor() {
    makeAutoObservable(this);

    // 绑定服务方法
    Object.assign(this, {
      ...Object.keys(OrderService).reduce((acc, key) => {
        acc[key] = OrderService[key].bind(this);
        return acc;
      }, {}),
      ...Object.keys(ConfirmService).reduce((acc, key) => {
        acc[key] = ConfirmService[key].bind(this);
        return acc;
      }, {})
    });
  }

  // 统一的状态定义
  static OrderStatus = {
    PENDING: 'pending',                // 待处理
    DELIVERING: 'delivering',          // 配送中
    CUSTOMER_CONFIRMED: 'customer_confirmed',  // 客户已确认
    STAFF_CONFIRMED: 'staff_confirmed',        // 业务员已确认
    COMPLETED: 'completed',            // 已完成
    CANCELLED: 'cancelled'             // 已取消
  }

  // 状态显示文本
  static StatusText = {
    [DeliveryStore.OrderStatus.PENDING]: '待处理',
    [DeliveryStore.OrderStatus.DELIVERING]: '配送中',
    [DeliveryStore.OrderStatus.CUSTOMER_CONFIRMED]: '客户已确认',
    [DeliveryStore.OrderStatus.STAFF_CONFIRMED]: '业务员已确认',
    [DeliveryStore.OrderStatus.COMPLETED]: '已完成',
    [DeliveryStore.OrderStatus.CANCELLED]: '已取消'
  }

  // 状态颜色
  static StatusColor = {
    [DeliveryStore.OrderStatus.PENDING]: 'warning',
    [DeliveryStore.OrderStatus.DELIVERING]: 'primary',
    [DeliveryStore.OrderStatus.CUSTOMER_CONFIRMED]: 'secondary',
    [DeliveryStore.OrderStatus.STAFF_CONFIRMED]: 'secondary',
    [DeliveryStore.OrderStatus.COMPLETED]: 'success',
    [DeliveryStore.OrderStatus.CANCELLED]: 'danger'
  }

  // 状态图标
  static StatusIcon = {
    [DeliveryStore.OrderStatus.PENDING]: 'solar:clock-circle-bold',
    [DeliveryStore.OrderStatus.DELIVERING]: 'solar:delivery-bold',
    [DeliveryStore.OrderStatus.CUSTOMER_CONFIRMED]: 'solar:user-check-bold',
    [DeliveryStore.OrderStatus.STAFF_CONFIRMED]: 'solar:shield-check-bold',
    [DeliveryStore.OrderStatus.COMPLETED]: 'solar:check-circle-bold',
    [DeliveryStore.OrderStatus.CANCELLED]: 'solar:close-circle-bold'
  }

  async getCurrentUser() {
    if (!this.currentUser) {
      try {
        const userInfo = await api.getCurrentAccountInfo();
        this.currentUser = {
          id: userInfo.id,
          name: userInfo.name,
          role: userInfo.role
        };
      } catch (error) {
        console.error('Failed to get current user:', error);
        message.error('获取用户信息失败');
        return null;
      }
    }
    return this.currentUser;
  }
}

const store = new DeliveryStore();
context.wpm.export('store_delivery', store);
</mo-ai-code>
```

```jsx
<mo-ai-code type="store" name="store_user" title="用户信息管理">
const {
  wpm,
  mobx,
  message,
  api
} = context;

const { makeAutoObservable } = mobx;

class UserStore {
  userInfo = null;
  enterpriseInfo = null;
  isLoading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadUserInfo() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.error = null;
    
    try {
      const [userInfo, enterpriseInfo] = await Promise.all([
        api.getCurrentAccountInfo(),
        api.queryCurrentEnterPrise()
      ]);
      
      this.userInfo = userInfo;
      this.enterpriseInfo = enterpriseInfo;
    } catch (error) {
      console.error('Failed to load user info:', error);
      this.error = error;
      message.error('获取用户信息失败');
    } finally {
      this.isLoading = false;
    }
  }

  get organizationId() {
    return this.enterpriseInfo?.organizationId;
  }

  get isAuthenticated() {
    return !!this.userInfo;
  }

  clearUserInfo() {
    this.userInfo = null;
    this.enterpriseInfo = null;
    this.error = null;
  }
}

const store = new UserStore();
context.wpm.export('store_user', store);
</mo-ai-code>
```

```jsx
<mo-ai-code type="utils" name="utils_delivery_diff" title="送货单数据比较工具">
const {
  wpm
} = context;

// 字段名映射
const fieldNameMap = {
  customerName: '客户名称',
  contactPerson: '联系人',
  contactPhone: '联系电话',
  deliveryTime: '送货日期',
  address: '送货地址',
  status: '状态',
  items: '商品明细',
  name: '商品名称',
  quantity: '数量',
  price: '单价',
  amount: '金额',
  confirmations: '确认信息',
  customer: '客户确认',
  staff: '业务员确认',
  note: '备注'
};

// 比较两个对象的差异
const compareObjects = (oldObj, newObj, path = '') => {
  const changes = [];

  // 如果是数组，使用专门的数组比较逻辑
  if (Array.isArray(oldObj) && Array.isArray(newObj)) {
    return compareArrays(oldObj, newObj, path);
  }

  // 获取所有唯一的键
  const allKeys = new Set([
    ...Object.keys(oldObj || {}),
    ...Object.keys(newObj || {})
  ]);

  for (const key of allKeys) {
    const oldValue = oldObj?.[key];
    const newValue = newObj?.[key];
    const currentPath = path ? `${path}.${key}` : key;

    // 如果键在新对象中不存在
    if (!(key in newObj)) {
      changes.push({
        type: 'deleted',
        path: currentPath,
        oldValue,
        newValue: undefined
      });
      continue;
    }

    // 如果键在旧对象中不存在
    if (!(key in oldObj)) {
      changes.push({
        type: 'added',
        path: currentPath,
        oldValue: undefined,
        newValue
      });
      continue;
    }

    // 如果两个值都是对象，递归比较
    if (
      typeof oldValue === 'object' &&
      typeof newValue === 'object' &&
      oldValue !== null &&
      newValue !== null &&
      !Array.isArray(oldValue) &&
      !Array.isArray(newValue)
    ) {
      changes.push(...compareObjects(oldValue, newValue, currentPath));
      continue;
    }

    // 比较值是否相等
    if (!isEqual(oldValue, newValue)) {
      changes.push({
        type: 'updated',
        path: currentPath,
        oldValue,
        newValue
      });
    }
  }

  return changes;
};

// 比较数组
const compareArrays = (oldArray, newArray, path) => {
  const changes = [];

  // 如果是商品列表，使用商品名称作为标识符
  if (path.endsWith('items')) {
    const oldMap = new Map(oldArray.map(item => [item.name, item]));
    const newMap = new Map(newArray.map(item => [item.name, item]));

    // 检查删除的商品
    for (const [name, item] of oldMap) {
      if (!newMap.has(name)) {
        changes.push({
          type: 'deleted',
          path: `${path}`,
          oldValue: item,
          newValue: undefined
        });
      }
    }

    // 检查新增的商品
    for (const [name, item] of newMap) {
      if (!oldMap.has(name)) {
        changes.push({
          type: 'added',
          path: `${path}`,
          oldValue: undefined,
          newValue: item
        });
      }
    }

    // 检查修改的商品
    for (const [name, oldItem] of oldMap) {
      const newItem = newMap.get(name);
      if (newItem && !isEqual(oldItem, newItem)) {
        changes.push({
          type: 'updated',
          path: `${path}`,
          oldValue: oldItem,
          newValue: newItem
        });
      }
    }
  } else {
    //// 其他数组的通用比较逻辑
    const maxLength = Math.max(oldArray.length, newArray.length);
    for (let i = 0; i < maxLength; i++) {
      if (i >= oldArray.length) {
        changes.push({
          type: 'added',
          path: `${path}[${i}]`,
          oldValue: undefined,
          newValue: newArray[i]
        });
      } else if (i >= newArray.length) {
        changes.push({
          type: 'deleted',
          path: `${path}[${i}]`,
          oldValue: oldArray[i],
          newValue: undefined
        });
      } else if (!isEqual(oldArray[i], newArray[i])) {
        changes.push({
          type: 'updated',
          path: `${path}[${i}]`,
          oldValue: oldArray[i],
          newValue: newArray[i]
        });
      }
    }
  }

  return changes;
};

// 判断两个值是否相等
const isEqual = (value1, value2) => {
  if (value1 === value2) return true;
  if (typeof value1 !== typeof value2) return false;
  if (typeof value1 !== 'object') return value1 === value2;
  if (value1 === null || value2 === null) return value1 === value2;
  
  const keys1 = Object.keys(value1);
  const keys2 = Object.keys(value2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => isEqual(value1[key], value2[key]));
};

// 格式化金额
const formatAmount = (amount) => {
  return `¥${parseFloat(amount).toFixed(2)}`;
};

// 格式化差异结果
const formatDiff = (changes) => {
  return changes.map(change => {
    const pathParts = change.path.split('.');
    const fieldName = fieldNameMap[pathParts[pathParts.length - 1]] || pathParts[pathParts.length - 1];
    
    let detail = '';
    
    if (change.path.endsWith('items')) {
      if (change.type === 'added') {
        detail = `新增商品：${change.newValue.name}，数量：${change.newValue.quantity}，单价：${formatAmount(change.newValue.price)}`;
      } else if (change.type === 'deleted') {
        detail = `删除商品：${change.oldValue.name}，数量：${change.oldValue.quantity}，单价：${formatAmount(change.oldValue.price)}`;
      } else if (change.type === 'updated') {
        const diffs = [];
        if (change.oldValue.quantity !== change.newValue.quantity) {
          diffs.push(`数量从 ${change.oldValue.quantity} 改为 ${change.newValue.quantity}`);
        }
        if (change.oldValue.price !== change.newValue.price) {
          diffs.push(`单价从 ${formatAmount(change.oldValue.price)} 改为 ${formatAmount(change.newValue.price)}`);
        }
        detail = `修改商品 ${change.newValue.name}：${diffs.join('，')}`;
      }
    } else if (change.path.includes('confirmations')) {
      if (change.type === 'added') {
        detail = `添加${fieldName}信息`;
      } else if (change.type === 'deleted') {
        detail = `删除${fieldName}信息`;
      } else if (change.type === 'updated') {
        detail = `更新${fieldName}信息`;
      }
    } else {
      if (change.type === 'added') {
        detail = `添加${fieldName}：${change.newValue}`;
      } else if (change.type === 'deleted') {
        detail = `删除${fieldName}：${change.oldValue}`;
      } else if (change.type === 'updated') {
        detail = `${fieldName}从 ${change.oldValue} 改为 ${change.newValue}`;
      }
    }

    return {
      type: change.type,
      field: fieldName,
      detail
    };
  });
};

context.wpm.export('utils_delivery_diff', {
  compareObjects,
  formatDiff
});
</mo-ai-code>
```