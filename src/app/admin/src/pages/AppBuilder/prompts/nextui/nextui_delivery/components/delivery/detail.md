```jsx
<mo-ai-code type="component" name="comp_delivery_detail">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Card, CardBody, Divider } = NextUI;

const DeliveryDetail = observer(({
  isOpen,
  onOpenChange,
  order
}) => {
  if (!order) return null;

  const totalAmount = order.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              送货单详情
            </ModalHeader>
            <ModalBody>
              <div className="space-y-6">
                {/* 基本信息 */}
                <Card>
                  <CardBody>
                    <h4 className="mb-4 text-medium font-medium">基本信息</h4>
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

                {/* 商品明细 */}
                <Card>
                  <CardBody>
                    <h4 className="mb-4 text-medium font-medium">商品明细</h4>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index}>
                          {index > 0 && <Divider className="my-3" />}
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-small text-default-500">
                                单价: ¥{item.price} × {item.quantity}
                              </p>
                            </div>
                            <p className="text-medium font-semibold">
                              ¥{item.amount}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Divider className="my-4" />
                    <div className="flex justify-between">
                      <div>
                        <p className="text-small text-default-500">
                          共 {order.items.length} 件商品
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold">
                          总计: ¥{totalAmount}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* 状态信息 */}
                <Card>
                  <CardBody>
                    <h4 className="mb-4 text-medium font-medium">状态信息</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Icon
                          className={cn(
                            "text-2xl",
                            order.status === "completed"
                              ? "text-success"
                              : order.status === "delivering"
                              ? "text-warning"
                              : "text-default-400"
                          )}
                          icon={
                            order.status === "completed"
                              ? "solar:check-circle-bold"
                              : order.status === "delivering"
                              ? "solar:delivery-bold"
                              : "solar:clock-circle-bold"
                          }
                        />
                        <span className="font-medium">
                          {order.status === "completed"
                            ? "已完成"
                            : order.status === "delivering"
                            ? "配送中"
                            : "待处理"}
                        </span>
                      </div>
                      {order.signedBy && (
                        <>
                          <Divider orientation="vertical" />
                          <div>
                            <p className="text-small text-default-500">签收人</p>
                            <p className="font-medium">{order.signedBy}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                关闭
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
});

context.wpm.export('comp_delivery_detail', DeliveryDetail);
</mo-ai-code>
```