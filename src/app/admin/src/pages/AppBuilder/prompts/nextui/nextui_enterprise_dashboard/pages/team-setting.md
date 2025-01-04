<mo-ai-code type="page" pageid="page_team_setting" title="团队设置">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const {
  Button,
  Card,
  CardBody,
  Divider,
  Input,
  Select,
  SelectItem,
  Spacer,
} = NextUI;

const TeamManageTable = await wpm.import('comp_team_manage_table');

const roleOptions = [
  {label: "成员", value: "member", description: "团队成员"},
  {label: "管理员", value: "admin", description: "团队管理员"},
  {label: "所有者", value: "owner", description: "团队所有者"},
];

const TeamSetting = observer(({className, ...props}) => (
  <div className={cn("p-2", className)} {...props}>
    {/* 标题 */}
    <p className="text-base font-medium text-default-700">团队</p>
    <p className="mt-1 text-sm font-normal text-default-400">管理和邀请团队成员。</p>
    {/* 邀请 */}
    <Card className="mt-4 bg-default-100" shadow="none">
      <CardBody className="px-4">
        <div className="flex items-start justify-between pb-3">
          <p className="mt-1.5 text-sm font-medium text-default-700">
            通过邮箱地址邀请新成员
          </p>
          <Button
            className="bg-default-foreground text-background"
            endContent={<Icon className="h-3 w-3" icon="solar:link-linear" />}
            radius="md"
            size="sm"
          >
            邀请链接
          </Button>
        </div>
        <Divider />
        <Spacer y={3} />
        <div className="py-2">
          {/* 邮箱地址 */}
          <div className="flex items-center justify-between gap-3 ">
            <div className="flex-1">
              <p className="text-sm font-normal text-default-500">邮箱地址</p>
              <Input
                className="mt-2"
                classNames={{
                  inputWrapper: "bg-default-200",
                }}
                placeholder="例如：zhangsan@example.com"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-normal text-default-500">角色</p>
              <Select
                className="mt-2"
                classNames={{
                  trigger: "bg-default-200",
                }}
                defaultSelectedKeys={["member"]}
              >
                {roleOptions.map((roleOption) => (
                  <SelectItem key={roleOption.value} value={roleOption.value}>
                    {roleOption.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
          <Button
            className="mt-3 bg-default-200 text-default-700"
            endContent={<Icon className="h-[18px] w-[18px]" icon="solar:add-circle-linear" />}
            radius="md"
            size="sm"
          >
            添加更多
          </Button>
        </div>
        <Spacer y={3} />
        <Divider />
        <div>
          <div className="flex items-end justify-between pt-3">
            <p className="relative mb-2 text-xs text-default-500">
              了解更多关于<span className="text-default-foreground">团队成员</span>的信息
              <Icon
                className={
                  "absolute right-0 top-0 h-2.5 w-2.5 translate-x-[8px] translate-y-[-2px] text-default-foreground"
                }
                icon="material-symbols-light:arrow-outward-rounded"
              />
            </p>
            <Button className="bg-default-foreground text-background" radius="md" size="sm">
              发送邀请
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
    <Spacer y={4} />
    {/* 团队管理表格 */}
    <TeamManageTable />
  </div>
));

wpm.export('page_team_setting', TeamSetting);
</mo-ai-code>