```jsx
<mo-ai-code type="page" name="page_checkout" title="结账页面">
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
  ai,
  mobx,
  appId
} = context;

const { useState, useEffect, useMemo } = React;
const { AnimatePresence, LazyMotion, m, domAnimation } = FramerMotion;
const { Progress, Button, Image, Badge } = NextUI;

// 导入组件和 store
const OrderSummary = await context.wpm.import('comp_order_summary');
const ShippingForm = await context.wpm.import('comp_shipping_form');
const PaymentForm = await context.wpm.import('comp_payment_form');
const PaymentMethodRadio = await context.wpm.import('comp_payment_method_radio');
const checkoutStore = await context.wpm.import('store_checkout');
const checkoutModule = await context.wpm.import('module_checkout');

const CheckoutPage = observer(() => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        await checkoutStore.loadCartItems();
        await checkoutStore.loadPaymentMethods();
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 20 : -20,
      opacity: 0,
    }),
  };

  const paginate = async (newDirection) => {
    if (page + newDirection < 0 || page + newDirection > 2) return;

    // 验证当前步骤
    if (page === 0 && newDirection > 0) {
      if (checkoutStore.cartItems.length === 0) {
        message.error('购物车为空');
        return;
      }
    }

    if (page === 1 && newDirection > 0) {
      if (!checkoutStore.shippingInfo) {
        message.error('请填写配送信息');
        return;
      }
    }

    setPage([page + newDirection, newDirection]);
  };

  const handlePlaceOrder = async () => {
    if (!checkoutStore.selectedPaymentMethod) {
      message.error('请选择支付方式');
      return;
    }

    setIsLoading(true);
    try {
      const success = await checkoutStore.placeOrder();
      if (success) {
        message.success('订单提交成功');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const ctaLabel = useMemo(() => {
    if (isLoading) return "处理中...";

    switch (page) {
      case 0:
        return "继续";
      case 1:
        return "继续";
      case 2:
        return "提交订单";
      default:
        return "继续";
    }
  }, [page, isLoading]);

  const stepTitle = useMemo(() => {
    switch (page) {
      case 0:
        return "确认订单";
      case 1:
        return "配送信息";
      case 2:
        return "支付方式";
      default:
        return "确认订单";
    }
  }, [page]);

  const stepsContent = useMemo(() => {
    const paymentRadioClasses = {
      wrapper: "group-data-[selected=true]:border-foreground",
      base: "data-[selected=true]:border-foreground",
      control: "bg-foreground",
    };

    switch (page) {
      case 0:
        return <OrderSummary hideTitle items={checkoutStore.cartItems} />;
      case 1:
        return (
          <div className="mt-4 flex flex-col gap-6">
            <ShippingForm hideTitle variant="bordered" />
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <NextUI.Accordion
                keepContentMounted
                aria-label="Select or add payment method"
                defaultExpandedKeys={["select_existing_payment"]}
                itemClasses={{
                  title: "text-medium text-foreground-500",
                  indicator: "text-foreground",
                }}
                selectionMode="multiple"
                showDivider={false}
              >
                <NextUI.AccordionItem key="select_existing_payment" title="选择支付方式">
                  <NextUI.RadioGroup
                    aria-label="Select existing payment method"
                    classNames={{wrapper: "gap-3"}}
                    defaultValue="4229"
                    onChange={(value) => {
                      const method = checkoutStore.paymentMethods.find(m => m.last4 === value);
                      checkoutStore.setSelectedPaymentMethod(method);
                    }}
                  >
                    {checkoutStore.paymentMethods.map((method) => (
                      <PaymentMethodRadio
                        key={method.id}
                        classNames={paymentRadioClasses}
                        description={`过期时间: ${method.expiryDate}`}
                        icon={method.type === 'visa' ? <Icon icon="logos:visa" height={30} width={30} /> :
                              method.type === 'mastercard' ? <Icon icon="logos:mastercard" height={30} width={30} /> :
                              <Icon icon="logos:paypal" height={30} width={30} />}
                        label={`${method.type === 'paypal' ? 'PayPal' : `${method.type} 尾号 ${method.last4}`}`}
                        value={method.last4}
                      />
                    ))}
                  </NextUI.RadioGroup>
                </NextUI.AccordionItem>
                <NextUI.AccordionItem key="add_new_payment" title="添加新的支付方式">
                  <PaymentForm variant="bordered" />
                </NextUI.AccordionItem>
              </NextUI.Accordion>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [page]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <NextUI.Spinner label="加载中..." />
      </div>
    );
  }

  return (
    <section className="flex h-[calc(100vh_-_60px)] w-full gap-8">
      <div className="w-full flex-none py-4 lg:w-[44%]">
        <div className="flex justify-between px-2">
          <div className="flex items-center">
            <Icon icon="lucide:shopping-bag" size={40} />
            <p className="font-semibold">商城</p>
          </div>
          <div className="flex items-center gap-2">
            <p>
              <span className="text-small font-semibold text-default-700">${checkoutStore.total.toFixed(2)}</span>
              <span className="ml-1 text-small text-default-500">({checkoutStore.cartItems.length} items)</span>
            </p>
            <Badge content={checkoutStore.cartItems.length} showOutline={false}>
              <Icon icon="solar:cart-check-outline" width={28} />
            </Badge>
          </div>
        </div>
        <div className="flex h-full flex-1 flex-col p-4">
          <div>
            <Button
              className="-ml-2 text-default-700"
              isDisabled={page === 0}
              radius="full"
              variant="flat"
              onPress={() => paginate(-1)}
            >
              <Icon icon="solar:arrow-left-outline" width={20} />
              返回
            </Button>
          </div>

          <AnimatePresence custom={direction} initial={false} mode="wait">
            <LazyMotion features={domAnimation}>
              <m.form
                key={page}
                animate="center"
                className="mt-8 flex flex-col gap-3"
                custom={direction}
                exit="exit"
                initial="enter"
                transition={{
                  x: {type: "spring", stiffness: 300, damping: 30},
                  opacity: {duration: 0.2},
                }}
                variants={variants}
                onSubmit={(e) => e.preventDefault()}
              >
                <h1 className="text-2xl font-medium">{stepTitle}</h1>
                {stepsContent}
                <Button
                  fullWidth
                  className="mt-8 bg-foreground text-background"
                  size="lg"
                  isLoading={isLoading}
                  onPress={() => page === 2 ? handlePlaceOrder() : paginate(1)}
                >
                  {ctaLabel}
                </Button>
              </m.form>
            </LazyMotion>
          </AnimatePresence>

          <div className="mt-auto flex w-full justify-between gap-8 pb-8 pt-4">
            <div className="flex w-full flex-col items-start gap-2">
              <p className="text-small font-medium">确认订单</p>
              <Progress
                classNames={{
                  indicator: "!bg-foreground",
                }}
                value={page >= 0 ? 100 : 0}
              />
            </div>
            <div className="flex w-full flex-col items-start gap-2">
              <p className="text-small font-medium">配送信息</p>
              <Progress
                classNames={{
                  indicator: "!bg-foreground",
                }}
                value={page >= 1 ? 100 : 0}
              />
            </div>
            <div className="flex w-full flex-col items-start gap-2">
              <p className="text-small font-medium">支付方式</p>
              <Progress
                classNames={{
                  indicator: "!bg-foreground",
                }}
                value={page >= 2 ? 100 : 0}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden w-full overflow-hidden rounded-medium shadow-small lg:block">
        <div className="absolute top-0 z-10 h-32 w-full rounded-medium bg-gradient-to-b from-black/80 to-transparent" />
        <div className="absolute bottom-0 z-10 h-32 w-full rounded-medium bg-gradient-to-b from-transparent to-black/80" />

        <div className="absolute top-10 z-10 flex w-full items-start justify-between px-10">
          <h2 className="text-2xl font-medium text-white/70 [text-shadow:_0_2px_10px_rgb(0_0_0_/_20%)]">
            The future of footwear is here.
          </h2>
          <div className="flex flex-col items-end gap-1">
            <div className="flex gap-1">
              {Array.from({length: 5}).map((_, i) => (
                <Icon key={i} className="text-white/80" icon="solar:star-bold" width={16} />
              ))}
            </div>
            <NextUI.Link className="text-white/60" href="#" size="sm" underline="always">
              120 reviews
            </NextUI.Link>
          </div>
        </div>
        <Image
          removeWrapper
          alt="Nike Adapt BB 2.0"
          className="absolute inset-0 z-0 h-full w-full rounded-none object-cover"
          height="100%"
          src="https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/shoes.jpg"
        />

        <div className="absolute inset-x-4 bottom-4 z-10 flex items-center justify-between rounded-medium bg-background/10 p-8 backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50">
          <div className="flex flex-col gap-1">
            <h2 className="left-10 z-10 text-2xl font-medium text-white/90">Nike Adapt BB 2.0</h2>
            <p className="left-10 z-10 text-white/80">$399.99</p>
          </div>
          <Button
            className="border-white/40 pl-3 text-white"
            startContent={<Icon icon="lucide:plus" width={24} />}
            variant="bordered"
          >
            Add to cart
          </Button>
        </div>
      </div>
    </section>
  );
});

context.wpm.export('page_checkout', CheckoutPage);
</mo-ai-code>
```