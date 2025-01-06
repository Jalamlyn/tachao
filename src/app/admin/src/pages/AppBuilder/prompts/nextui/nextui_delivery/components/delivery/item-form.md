```jsx
<mo-ai-code type="component" name="comp_delivery_item_form">
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
  onSubmit
}) => {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const quantity = parseInt(data.quantity);
    const price = parseFloat(data.price);
    
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
        name: data.name,
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

  return (
    <>
      <Button
        size="sm"
        color="primary"
        variant={item ? "light" : "solid"}
        isIconOnly={!!item}
        onPress={onOpen}
      >
        {item ? (
          <Icon icon="solar:pen-bold" />
        ) : (
          <>
            <Icon icon="solar:add-circle-bold" className="mr-1" />
            添加商品
          </>
        )}
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex flex-col gap-1">
                {item ? '编辑商品' : '添加商品'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    isRequired
                    label="商品名称"
                    name="name"
                    placeholder="请输入商品名称"
                    defaultValue={item?.name}
                  />
                  <Input
                    isRequired
                    type="number"
                    label="数量"
                    name="quantity"
                    placeholder="请输入数量"
                    defaultValue={item?.quantity}
                    min={1}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400">×</span>
                      </div>
                    }
                  />
                  <Input
                    isRequired
                    type="number"
                    label="单价"
                    name="price"
                    placeholder="请输入单价"
                    defaultValue={item?.price}
                    min={0}
                    step={0.01}
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400">¥</span>
                      </div>
                    }
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  取消
                </Button>
                <Button color="primary" type="submit" isLoading={loading}>
                  确定
                </Button>
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