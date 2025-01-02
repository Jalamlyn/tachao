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
  ai,
  mobx,
  appId
} = context;

const { useState, useEffect, useMemo, useCallback, useRef } = React;
const { AnimatePresence, LazyMotion, m, domAnimation } = FramerMotion;
const { Progress, Button, Image, Link, Badge, Accordion, AccordionItem, RadioGroup, Radio, Chip, Input, Autocomplete, AutocompleteItem, Avatar, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Divider } = NextUI;
const { Routes, Route, Navigate } = ReactRouterDom;

// 导入 store 和模块
const checkoutStore = await wpm.import('store_checkout');
const checkoutModule = await wpm.import('module_checkout');

// 主应用组件
const App = observer(() => {
  return (
    <Routes>
      {/* 默认路由重定向到结账页面 */}
      <Route 
        path="/" 
        element={<Navigate to="checkout" replace />} 
      />

      {/* 结账页面路由 */}
      <Route
        path="checkout"
        element={<CheckoutApp />}
      />
    </Routes>
  );
});

// 结账页面组件
const CheckoutApp = observer(() => {
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
        // 可以跳转到订单确认页
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
              <Accordion
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
                <AccordionItem key="select_existing_payment" title="选择支付方式">
                  <RadioGroup
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
                        icon={method.type === 'visa' ? <VisaIcon height={30} width={30} /> :
                              method.type === 'mastercard' ? <MasterCardIcon height={30} width={30} /> :
                              <PayPalIcon height={30} width={30} />}
                        label={`${method.type === 'paypal' ? 'PayPal' : `${method.type} 尾号 ${method.last4}`}`}
                        value={method.last4}
                      />
                    ))}
                  </RadioGroup>
                </AccordionItem>
                <AccordionItem key="add_new_payment" title="添加新的支付方式">
                  <PaymentForm variant="bordered" />
                </AccordionItem>
              </Accordion>
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
            <AcmeIcon size={40} />
            <p className="font-semibold">ACME</p>
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
            <Link className="text-white/60" href="#" size="sm" underline="always">
              120 reviews
            </Link>
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

const ShippingForm = observer(({variant = "flat", className, hideTitle}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (!checkoutModule.validateShippingInfo(data)) {
      message.error('请填写完整的配送信息');
      return;
    }

    const success = await checkoutStore.saveShippingInfo(data);
    if (success) {
      message.success('配送信息已保存');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4", className)}>
      {!hideTitle && <span className="relative text-foreground-500">配送信息</span>}
      <Input
        isRequired
        name="email"
        label="邮箱地址"
        labelPlacement="outside"
        placeholder="请输入邮箱"
        type="email"
        variant={variant}
      />

      <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
        <Input
          isRequired
          name="firstName"
          label="名"
          labelPlacement="outside"
          placeholder="请输入名"
          variant={variant}
        />

        <Input
          isRequired
          name="lastName"
          label="姓"
          labelPlacement="outside"
          placeholder="请输入姓"
          variant={variant}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
        <Input
          isRequired
          name="address"
          label="地址"
          labelPlacement="outside"
          placeholder="详细地址"
          variant={variant}
        />

        <Input
          name="apartment"
          label="门牌号"
          labelPlacement="outside"
          placeholder="公寓、单元等"
          variant={variant}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
        <Input
          isRequired
          name="city"
          label="城市"
          labelPlacement="outside"
          placeholder="请输入城市"
          variant={variant}
        />

        <Autocomplete
          isRequired
          name="country"
          defaultItems={countries}
          label="国家/地区"
          labelPlacement="outside"
          placeholder="选择国家/地区"
          variant={variant}
        >
          {(item) => (
            <AutocompleteItem
              key={item.code}
              startContent={
                <Avatar
                  alt="Country Flag"
                  className="h-6 w-6"
                  src={`https://flagcdn.com/${item.code.toLowerCase()}.svg`}
                />
              }
              value={item.code}
            >
              {item.name}
            </AutocompleteItem>
          )}
        </Autocomplete>
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
        <Input
          isRequired
          name="postalCode"
          label="邮政编码"
          labelPlacement="outside"
          placeholder="请输入邮编"
          variant={variant}
        />

        <Input
          isRequired
          name="phone"
          label="电话号码"
          labelPlacement="outside"
          placeholder="请输入电话"
          variant={variant}
        />
      </div>
      <Button type="submit" className="mt-4">
        保存配送信息
      </Button>
    </form>
  );
});

const PaymentForm = observer(({variant = "flat", className}) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // 这里应该调用支付方式保存的逻辑
    message.success('支付方式已保存');
  };

  const NumberInput = (props) => (
    <input
      className="w-11 rounded-sm bg-transparent text-small outline-none placeholder:text-default-400"
      min={0}
      minLength={0}
      type="number"
      {...props}
    />
  );

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-4", className)}>
      <Input
        isRequired
        name="email"
        label="邮箱地址"
        labelPlacement="outside"
        placeholder="请输入邮箱"
        type="email"
        variant={variant}
      />

      <Input
        isRequired
        endContent={
          <div className="flex max-w-[140px] items-center">
            <NumberInput max={12} maxLength={2} name="card-month" placeholder="MM" />
            <span className="mx-1 text-default-300">/</span>
            <NumberInput max={99} maxLength={2} name="card-year" placeholder="YY" />
            <NumberInput max={999} maxLength={3} name="card-cvc" placeholder="CVC" />
          </div>
        }
        label="卡号"
        labelPlacement="outside"
        minLength={0}
        name="card-number"
        placeholder="请输入卡号"
        startContent={
          <span>
            <Icon className="text-default-400" icon="solar:card-bold" width={20} />
          </span>
        }
        type="number"
        variant={variant}
      />

      <Input
        isRequired
        name="cardholderName"
        label="持卡人姓名"
        labelPlacement="outside"
        placeholder="请输入持卡人姓名"
        variant={variant}
      />

      <Button type="submit" className="mt-4">
        保存支付方式
      </Button>
    </form>
  );
});

const PaymentMethodRadio = observer(({label, description, icon, isExpired, isRecommended, classNames = {}, className, ...props}) => {
  return (
    <Radio
      {...props}
      classNames={{
        ...classNames,
        base: cn(
          "inline-flex m-0 px-3 py-4 max-w-[100%] items-center justify-between",
          "flex-row-reverse w-full cursor-pointer rounded-lg border-medium border-default-100",
          "data-[selected=true]:border-primary",
          classNames?.base,
          className,
        ),
        labelWrapper: cn("ml-0", classNames?.labelWrapper),
      }}
      color="primary"
    >
      <div className="flex w-full items-center gap-3">
        <div className="item-center flex rounded-small p-2">{icon}</div>
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center gap-3">
            <p className="text-small">{label}</p>
            {isExpired && (
              <Chip className="h-6 p-0 text-tiny" color="danger">
                已过期
              </Chip>
            )}

            {isRecommended && (
              <Chip className="h-6 p-0 text-tiny" color="success" variant="flat">
                推荐
              </Chip>
            )}
          </div>
          <p className="text-tiny text-default-400">{description}</p>
        </div>
      </div>
    </Radio>
  );
});

const countries = [
  {name: "中国", code: "CN"},
  {name: "美国", code: "US"},
  {name: "日本", code: "JP"},
  {name: "韩国", code: "KR"},
  {name: "英国", code: "GB"},
  {name: "德国", code: "DE"},
  {name: "法国", code: "FR"},
  {name: "意大利", code: "IT"},
  {name: "加拿大", code: "CA"},
  {name: "澳大利亚", code: "AU"},
];

wpm.export('nextui_checkout_complete', App);
</mo-ai-code>