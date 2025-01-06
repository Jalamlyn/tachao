```jsx
<mo-ai-code type="component" name="comp_theme_custom_radio">
const {
  wpm,
  React,
  observer,
  NextUI,
  cn
} = context;

const { useRadio, VisuallyHidden } = NextUI;

const ThemeCustomRadio = observer((props) => {
  const {variant} = props;
  const {
    Component,
    children,
    description,
    getBaseProps,
    getWrapperProps,
    getInputProps,
    getLabelProps,
    getLabelWrapperProps,
    getControlProps,
  } = useRadio(props);

  const wrapperProps = getWrapperProps();

  return (
    <Component
      {...getBaseProps()}
      className={cn(
        "group inline-flex flex-row-reverse justify-between overflow-visible hover:bg-content2",
        "max-w-[300px] cursor-pointer gap-4 rounded-large border-1 border-default-200 px-4 py-2.5 shadow-md",
        "relative h-[132px] flex-1 overflow-hidden",
      )}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <span
        {...getWrapperProps()}
        className={cn(
          wrapperProps["className"],
          "border-2 border-default",
          "group-data-[selected=true]:border-default-foreground",
        )}
      >
        <span
          {...getControlProps()}
          className={cn(
            "z-10 h-2 w-2 origin-center scale-0 rounded-full bg-default-foreground text-primary-foreground opacity-0 transition-transform-opacity group-data-[selected=true]:scale-100 group-data-[selected=true]:opacity-100 motion-reduce:transition-none",
          )}
        />
      </span>
      <div {...getLabelWrapperProps()}>
        {children && <span {...getLabelProps()}>{children}</span>}
        {description && (
          <span className="text-small text-foreground opacity-70">{description}</span>
        )}
      </div>
      <div className={cn("absolute left-[32px] top-[37px]", {hidden: variant !== "dark"})}>
        <div className="bg-black rounded-lg w-[240px] h-[117px] border border-[#3F3F46] p-4">
          <div className="flex flex-col gap-2">
            <div className="bg-[#27272A] h-3 w-1/3 rounded"></div>
            <div className="bg-[#27272A] h-3 w-1/2 rounded"></div>
            <div className="bg-[#27272A] h-3 w-2/3 rounded"></div>
          </div>
        </div>
      </div>
      <div className={cn("absolute left-[32px] top-[37px]", {hidden: variant !== "light"})}>
        <div className="bg-white rounded-lg w-[240px] h-[117px] border border-[#E4E4E7] p-4">
          <div className="flex flex-col gap-2">
            <div className="bg-[#F4F4F5] h-3 w-1/3 rounded"></div>
            <div className="bg-[#F4F4F5] h-3 w-1/2 rounded"></div>
            <div className="bg-[#F4F4F5] h-3 w-2/3 rounded"></div>
          </div>
        </div>
      </div>
    </Component>
  );
});

context.wpm.export('comp_theme_custom_radio', ThemeCustomRadio);
</mo-ai-code>
```