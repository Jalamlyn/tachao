```jsx
<mo-ai-code type="component" name="comp_order_summary">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const { Link, Button, Image, Tooltip, Divider, Input } = NextUI;

const OrderSummaryItem = observer(({name, href, price, color, size, quantity, imageSrc, className}) => {
  return (
    <li className={cn("flex items-center gap-x-4 border-b-small border-divider py-4", className)}>
      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center">
        <Image alt={name} src={imageSrc} />
      </div>
      <div className="flex flex-1 flex-col">
        <h4 className="text-small">
          <Link className="font-medium text-foreground" href={href} underline="hover">
            {name}
          </Link>
        </h4>
        <div className="flex items-center gap-3">
          <p>
            <span className="text-small text-default-500">颜色: </span>
            <span className="text-small font-medium capitalize text-default-700">{color}</span>
          </p>
          <p>
            <span className="text-small text-default-500">尺码: </span>
            <span className="text-small font-medium text-default-700">{size}</span>
          </p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-small font-semibold text-default-700">${price}</span>
          <span className="text-small text-default-500">x {quantity}</span>
        </div>
      </div>
      <Tooltip content="移除" placement="top">
        <Button isIconOnly className="h-7 w-7 min-w-[1.5rem]" radius="full" variant="flat">
          <Icon icon="lucide:x" width={14} />
        </Button>
      </Tooltip>
    </li>
  );
});

const OrderSummary = observer(({hideTitle, items}) => {
  const checkoutStore = await wpm.import('store_checkout');
  
  return (
    <div>
      {!hideTitle && (
        <>
          <h2 className="font-medium text-default-500">您的订单</h2>
          <Divider className="mt-4" />
        </>
      )}

      <h3 className="sr-only">购物车商品</h3>
      <ul>
        {items?.map((item) => (
          <OrderSummaryItem key={item.id} {...item} />
        ))}
      </ul>
      <div>
        <form className="mb-4 mt-6 flex items-end gap-2" onSubmit={(e) => e.preventDefault()}>
          <Input
            classNames={{
              label: "text-default-700",
              inputWrapper: "bg-background",
            }}
            color="primary"
            label="优惠码"
            labelPlacement="outside"
            placeholder="输入优惠码"
            variant="bordered"
          />
          <Button type="submit">应用</Button>
        </form>
        <dl className="flex flex-col gap-4 py-4">
          <div className="flex justify-between">
            <dt className="text-small text-default-500">小计</dt>
            <dd className="text-small font-semibold text-default-700">${checkoutStore.subtotal.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-small text-default-500">运费</dt>
            <dd className="text-small font-semibold text-default-700">${checkoutStore.shipping.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-small text-default-500">税费</dt>
            <dd className="text-small font-semibold text-default-700">${checkoutStore.tax.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-small text-default-500">优惠</dt>
            <dd className="text-small font-semibold text-success"> - ${checkoutStore.discount.toFixed(2)}</dd>
          </div>
          <Divider />
          <div className="flex justify-between">
            <dt className="text-small font-semibold text-default-500">总计</dt>
            <dd className="text-small font-semibold text-default-700">${checkoutStore.total.toFixed(2)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
});

wpm.export('comp_order_summary', OrderSummary);
</mo-ai-code>
```