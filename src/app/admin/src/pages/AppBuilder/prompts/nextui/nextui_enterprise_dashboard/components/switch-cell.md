```jsx
<mo-ai-code type="component" name="comp_switch_cell">
const {
  wpm,
  React,
  observer,
  NextUI,
  cn
} = context;

const { extendVariants, Switch } = NextUI;

const CustomSwitch = extendVariants(Switch, {
  variants: {
    color: {
      foreground: {
        wrapper: [
          "group-data-[selected=true]:bg-foreground",
          "group-data-[selected=true]:text-background",
        ],
      },
    },
  },
});

const SwitchCell = observer(({label, description, classNames, ...props}) => (
  <CustomSwitch
    classNames={{
      ...classNames,
      base: cn(
        "inline-flex bg-content2 flex-row-reverse w-full max-w-full items-center",
        "justify-between cursor-pointer rounded-medium gap-2 p-4",
        classNames?.base,
      ),
    }}
    {...props}
  >
    <div className="flex flex-col">
      <p className={cn("text-medium", classNames?.label)}>{label}</p>
      <p className={cn("text-small text-default-500", classNames?.description)}>{description}</p>
    </div>
  </CustomSwitch>
));

wpm.export('comp_switch_cell', SwitchCell);
</mo-ai-code>
```