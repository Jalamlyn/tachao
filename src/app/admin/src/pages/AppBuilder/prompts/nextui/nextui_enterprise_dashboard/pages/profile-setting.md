<mo-ai-code type="page" pageid="page_profile_setting" title="个人资料设置">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  cn
} = context;

const { Card, CardBody, Avatar, Button, Badge, Input, Spacer, Textarea } = NextUI;

const ProfileSetting = observer(({className, ...props}) => (
  <div className={cn("p-2", className)} {...props}>
    {/* 个人资料 */}
    <div>
      <p className="text-base font-medium text-default-700">个人资料</p>
      <p className="mt-1 text-sm font-normal text-default-400">
        这些信息将显示在您的公开个人主页上。
      </p>
      <Card className="mt-4 bg-default-100" shadow="none">
        <CardBody>
          <div className="flex items-center gap-4">
            <Badge
              showOutline
              classNames={{
                badge: "w-5 h-5",
              }}
              content={
                <Button
                  isIconOnly
                  className="h-5 w-5 min-w-5 bg-background p-0 text-default-500"
                  radius="full"
                  size="sm"
                  variant="bordered"
                >
                  <Icon className="h-[9px] w-[9px]" icon="solar:pen-linear" />
                </Button>
              }
              placement="bottom-right"
              shape="circle"
            >
              <Avatar
                className="h-16 w-16"
                src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
              />
            </Badge>
            <div>
              <p className="text-sm font-medium text-default-600">张三</p>
              <p className="text-xs text-default-400">技术支持</p>
              <p className="mt-1 text-xs text-default-400">zhangsan@example.com</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
    <Spacer y={4} />
    {/* 职位 */}
    <div>
      <p className="text-base font-medium text-default-700">职位</p>
      <p className="mt-1 text-sm font-normal text-default-400">设置您当前的职位。</p>
      <Input className="mt-2" placeholder="例如：技术支持工程师" />
    </div>
    <Spacer y={2} />
    {/* 所在地 */}
    <div>
      <p className="text-base font-medium text-default-700">所在地</p>
      <p className="mt-1 text-sm font-normal text-default-400">设置您当前的所在地。</p>
      <Input className="mt-2" placeholder="例如：北京市朝阳区" />
    </div>
    <Spacer y={4} />
    {/* 个人简介 */}
    <div>
      <p className="text-base font-medium text-default-700">个人简介</p>
      <p className="mt-1 text-sm font-normal text-default-400">
        简单介绍一下您自己。
      </p>
      <Textarea
        className="mt-2"
        classNames={{
          input: cn("min-h-[115px]"),
        }}
        placeholder="例如：'张三 - 模本科技技术支持工程师。热衷于解决技术问题，喜欢徒步旅行和参与志愿服务。'"
      />
    </div>
    <Button className="mt-4 bg-default-foreground text-background" size="sm">
      更新资料
    </Button>
  </div>
));

wpm.export('page_profile_setting', ProfileSetting);
</mo-ai-code>