```jsx
<mo-ai-code type="component" name="comp_payment_method_radio">
const {
  wpm,
  React,
  observer,
  NextUI
} = context;

const { Radio, Chip } = NextUI;

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
            <p className="text-small">{label}</p>{isExpired && (
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

wpm.export('comp_payment_method_radio', PaymentMethodRadio);
</mo-ai-code>