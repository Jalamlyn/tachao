```jsx
<mo-ai-code type="component" name="comp_copy_text">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon,
  message
} = context;

const CopyText = observer(({ children }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      message.success("已复制");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      message.error("复制失败");
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span>{children}</span>
      <NextUI.Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={handleCopy}
      >
        <Icon
          className="text-default-400"
          icon={copied ? "solar:check-circle-bold" : "solar:copy-linear"}
          width={16}
        />
      </NextUI.Button>
    </div>
  );
});

wpm.export('comp_copy_text', CopyText);
</mo-ai-code>
```
