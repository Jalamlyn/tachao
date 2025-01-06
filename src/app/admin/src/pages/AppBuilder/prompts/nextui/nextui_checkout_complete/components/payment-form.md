```jsx
<mo-ai-code type="component" name="comp_payment_form">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  message
  cn,
} = context;

const { Input, Button } = NextUI;

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

context.wpm.export('comp_payment_form', PaymentForm);
</mo-ai-code>
```