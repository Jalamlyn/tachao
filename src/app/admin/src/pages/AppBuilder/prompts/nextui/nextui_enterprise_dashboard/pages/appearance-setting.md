<mo-ai-code type="page" name="page_appearance_setting" title="外观设置">
const {
  wpm,
  React,
  observer,
  NextUI,
  cn
} = context;

const { RadioGroup, Select, SelectItem, Spacer } = NextUI;

const ThemeCustomRadio = await context.wpm.import('comp_theme_custom_radio');
const SwitchCell = await context.wpm.import('comp_switch_cell');

const fontSizeOptions = [
  {label: "小", value: "small", description: "字体大小 14px"},
  {label: "中", value: "medium", description: "字体大小 16px"},
  {label: "大", value: "large", description: "字体大小 18px"},
];

const AppearanceSetting = observer(({className, ...props}) => (
  <div className={cn("p-2", className)} {...props}>
    {/* 主题 */}
    <div>
      <p className="text-base font-medium text-default-700">主题</p>
      <p className="mt-1 text-sm font-normal text-default-400">
        更改系统界面的外观主题。
      </p>
      {/* 主题选择 */}
      <RadioGroup className="mt-4 flex-wrap" orientation="horizontal">
        <ThemeCustomRadio value="light" variant="light">
          浅色
        </ThemeCustomRadio>
        <ThemeCustomRadio value="dark" variant="dark">
          深色
        </ThemeCustomRadio>
      </RadioGroup>
    </div>
    <Spacer y={4} />
    {/* 字体大小 */}
    <div className="flex items-start justify-between gap-2 py-2">
      <div>
        <p className="text-base font-medium text-default-700">字体大小</p>
        <p className="mt-1 text-sm font-normal text-default-400">调整系统界面的字体大小。</p>
      </div>
      <Select className="max-w-[200px]" defaultSelectedKeys={["large"]}>
        {fontSizeOptions.map((fontSizeOption) => (
          <SelectItem key={fontSizeOption.value} value={fontSizeOption.value}>
            {fontSizeOption.label}
          </SelectItem>
        ))}
      </Select>
    </div>
    <Spacer y={4} />
    {/* 半透明界面 */}
    <SwitchCell
      classNames={{
        base: "bg-transparent p-0",
      }}
      color="foreground"
      description="在侧边栏和弹窗等界面元素中使用透明效果。"
      label="半透明界面"
    />
    <Spacer y={6} />
    {/* 使用指针光标 */}
    <SwitchCell
      classNames={{
        base: "bg-transparent p-0",
      }}
      color="foreground"
      description="鼠标悬停时显示手型指针"
      label="使用指针光标"
    />
  </div>
));

context.wpm.export('page_appearance_setting', AppearanceSetting);
</mo-ai-code>