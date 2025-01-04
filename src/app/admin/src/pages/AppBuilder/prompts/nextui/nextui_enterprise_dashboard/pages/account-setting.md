<mo-ai-code type="page" pageid="page_account_setting" title="账户设置">
const {
  wpm,
  React,
  observer,
  NextUI,
  cn
} = context;

const { Button, Input, Select, SelectItem, Spacer } = NextUI;

const timeZoneOptions = [
  {
    label: "北京时间 (UTC+8)",
    value: "utc+8",
    description: "中国标准时间",
  },
  {
    label: "东京时间 (UTC+9)",
    value: "utc+9",
    description: "日本标准时间",
  },
  {
    label: "新加坡时间 (UTC+8)",
    value: "utc+8",
    description: "新加坡标准时间",
  },
];

const AccountSetting = observer(({className, ...props}) => (
  <div className={cn("p-2", className)} {...props}>
    {/* 姓名 */}
    <div>
      <p className="text-base font-medium text-default-700">姓名</p>
      <p className="mt-1 text-sm font-normal text-default-400">用于邮件和系统显示的姓名。</p>
      <Input className="mt-2" placeholder="例如：张三" />
    </div>
    <Spacer y={2} />
    {/* 用户名 */}
    <div>
      <p className="text-base font-medium text-default-700">用户名</p>
      <p className="mt-1 text-sm font-normal text-default-400">系统登录使用的用户名。</p>
      <Input className="mt-2" placeholder="zhangsan" />
    </div>
    <Spacer y={2} />
    {/* 邮箱地址 */}
    <div>
      <p className="text-base font-medium text-default-700">邮箱地址</p>
      <p className="mt-1 text-sm font-normal text-default-400">
        与您账户关联的邮箱地址。
      </p>
      <Input className="mt-2" placeholder="例如：zhangsan@example.com" />
    </div>
    <Spacer y={2} />
    {/* 时区 */}
    <section>
      <div>
        <p className="text-base font-medium text-default-700">时区</p>
        <p className="mt-1 text-sm font-normal text-default-400">设置您当前的时区。</p>
      </div>
      <Select className="mt-2" defaultSelectedKeys={["utc+8"]}>
        {timeZoneOptions.map((timeZoneOption) => (
          <SelectItem key={timeZoneOption.value} value={timeZoneOption.value}>
            {timeZoneOption.label}
          </SelectItem>
        ))}
      </Select>
    </section>
    <Spacer y={2} />
    <Button className="mt-4 bg-default-foreground text-background" size="sm">
      更新账户信息
    </Button>
  </div>
));

wpm.export('page_account_setting', AccountSetting);
</mo-ai-code>