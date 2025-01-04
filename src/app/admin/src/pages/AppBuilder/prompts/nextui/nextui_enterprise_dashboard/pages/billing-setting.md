<mo-ai-code type="page" name="page_billing_setting" title="账单设置">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Button, Input, RadioGroup, Select, SelectItem, Spacer } = NextUI;

const PlanCustomRadio = await wpm.import('comp_plan_custom_radio');

const addressOptions = [
  {
    label: "北京",
    value: "beijing",
    description: "北京市",
  },
  {
    label: "上海",
    value: "shanghai",
    description: "上海市",
  },
  {
    label: "广州",
    value: "guangzhou",
    description: "广州市",
  },
];

const countryOptions = [
  {
    label: "中国",
    value: "cn",
    description: "中华人民共和国",
  },
];

const BillingSetting = observer(({className, ...props}) => (
  <div className={cn("p-2", className)} {...props}>
    {/* 支付方式 */}
    <div>
      <div className="rounded-large bg-default-100">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6 text-default-500" icon="solar:card-outline" />
            <div>
              <p className="text-sm font-medium text-default-600">支付方式</p>
              <p className="text-xs text-default-400">银联信用卡 尾号***3456</p>
            </div>
          </div>
          <Button
            className="bg-default-foreground text-background"
            radius="md"
            size="sm"
            variant="shadow"
          >
            更新
          </Button>
        </div>
      </div>
    </div>
    <Spacer y={4} />
    {/* 当前套餐 */}
    <div>
      <p className="text-base font-medium text-default-700">当前套餐</p>
      <p className="mt-1 text-sm font-normal text-default-400">
        您的免费试用期还剩 <span className="text-default-500">8 天</span>。
      </p>
      {/* 套餐选择 */}
      <RadioGroup
        className="mt-4"
        classNames={{
          wrapper: "gap-4 flex-row flex-wrap",
        }}
        defaultValue="pro-monthly"
        orientation="horizontal"
      >
        <PlanCustomRadio
          classNames={{
            label: "text-default-500 font-medium",
          }}
          description="专业版月付"
          value="pro-monthly"
        >
          <div className="mt-2">
            <p className="pt-2">
              <span className="text-[30px] font-semibold leading-7 text-default-foreground">
                ¥79
              </span>
              &nbsp;<span className="text-xs font-medium text-default-400">/月</span>
            </p>
            <ul className="list-inside list-disc text-xs font-normal text-default-500">
              <li>无限用户数</li>
              <li>所有功能</li>
              <li>邮件和在线客服支持</li>
              <li>按月付费，随时可取消</li>
            </ul>
          </div>
        </PlanCustomRadio>
        <PlanCustomRadio
          classNames={{
            label: "text-default-500 font-medium",
          }}
          description="专业版年付"
          value="pro-yearly"
        >
          <div className="mt-2">
            <p className="pt-2">
              <span className="text-[30px] font-semibold leading-7 text-default-foreground">
                ¥799
              </span>
              &nbsp;<span className="text-xs font-medium text-default-400">/年</span>
            </p>
            <ul className="list-inside list-disc text-xs font-normal text-default-500">
              <li>无限用户数</li>
              <li>所有功能</li>
              <li>邮件和在线客服支持</li>
              <li>年付优惠，约省2个月费用</li>
            </ul>
          </div>
        </PlanCustomRadio>
      </RadioGroup>
    </div>
    <Spacer y={4} />
    {/* 账单地址 */}
    <div>
      {/*  标题 */}
      <div>
        <p className="text-base font-medium text-default-700">账单地址</p>
        <p className="mt-1 text-sm font-normal text-default-400">
          如果您需要在发票上添加邮寄地址，请在此填写。
        </p>
      </div>
    </div>
    <div className="mt-2 space-y-2">
      <Input placeholder="详细地址 1" />
      <Input placeholder="详细地址 2" />
      <Input placeholder="城市" />
      <div className="flex items-center gap-2">
        <Select defaultSelectedKeys={["beijing"]}>
          {addressOptions.map((addressOption) => (
            <SelectItem key={addressOption.value} value={addressOption.value}>
              {addressOption.label}
            </SelectItem>
          ))}
        </Select>
        <Input placeholder="邮政编码" />
      </div>
      <Select defaultSelectedKeys={["cn"]}>
        {countryOptions.map((countryOption) => (
          <SelectItem key={countryOption.value} value={countryOption.value}>
            {countryOption.label}
          </SelectItem>
        ))}
      </Select>
    </div>
    <Button className="mt-5 bg-default-foreground text-background" size="sm">
      保存
    </Button>
  </div>
));

wpm.export('page_billing_setting', BillingSetting);
</mo-ai-code>