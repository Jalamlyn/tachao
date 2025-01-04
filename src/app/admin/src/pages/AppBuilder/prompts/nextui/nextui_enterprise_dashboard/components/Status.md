```jsx
<mo-ai-code type="component" name="comp_status">
const {
  wpm,
  React,
  observer,
  NextUI,
  Icon
} = context;

const Status = observer(({ status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "paused":
        return "warning";
      case "deleted":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <NextUI.Chip
      className="capitalize"
      color={getStatusColor(status)}
      size="sm"
      variant="flat"
    >
      {status}
    </NextUI.Chip>
  );
});

wpm.export('comp_status', Status);
</mo-ai-code>
```
