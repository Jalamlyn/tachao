```jsx
<mo-ai-code type="component" name="comp_shipping_form">
const {
  wpm,
  React,
  observer,
  NextUI,
  message,
  cn
} = context;
const checkoutStore = await context.wpm.import('store_checkout');
const checkoutModule = await context.wpm.import('module_checkout');

const { Input, Button, Autocomplete, AutocompleteItem, Avatar } = NextUI;

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

context.wpm.export('comp_shipping_form', ShippingForm);
</mo-ai-code>
```
