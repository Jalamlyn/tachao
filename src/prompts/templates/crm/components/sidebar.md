```jsx
<mo-ai-code type="page" name="page_component_sidebar">
const {
  wpm,
  React,
  NextUI,
  Icon
} = context;

const { Listbox, ListboxItem, Tooltip } = NextUI;

const Sidebar = React.forwardRef(({
  items,
  isCompact,
  defaultSelectedKey,
  onSelect,
  hideEndContent,
  iconClassName,
  className,
  ...props
}, ref) => {
  const [selected, setSelected] = React.useState(defaultSelectedKey);

  const renderItem = React.useCallback((item) => {
    return (
      <ListboxItem
        key={item.key}
        className="px-3 min-h-11 rounded-large h-[44px] data-[selected=true]:bg-default-100"
        endContent={isCompact || hideEndContent ? null : item.endContent}
        startContent={
          isCompact ? null : item.icon ? (
            <Icon
              className={`text-default-500 group-data-[selected=true]:text-foreground ${iconClassName}`}
              icon={item.icon}
              width={24}
            />
          ) : (
            item.startContent
          )
        }
        textValue={item.title}
        title={isCompact ? null : item.title}
      >
        {isCompact ? (
          <Tooltip content={item.title} placement="right">
            <div className="flex w-full items-center justify-center">
              {item.icon ? (
                <Icon
                  className={`text-default-500 group-data-[selected=true]:text-foreground ${iconClassName}`}
                  icon={item.icon}
                  width={24}
                />
              ) : (
                item.startContent
              )}
            </div>
          </Tooltip>
        ) : null}
      </ListboxItem>
    );
  }, [isCompact, hideEndContent, iconClassName]);

  return (
    <Listbox
      ref={ref}
      aria-label="Sidebar menu"
      className={`list-none ${className}`}
      defaultSelectedKeys={[defaultSelectedKey]}
      selectionMode="single"
      onSelectionChange={(keys) => {
        const key = Array.from(keys)[0];
        setSelected(key);
        onSelect?.(key);
      }}
      {...props}
    >
      {items.map(renderItem)}
    </Listbox>
  );
});

Sidebar.displayName = "Sidebar";

wpm.export('page_component_sidebar', Sidebar);
</mo-ai-code>
```