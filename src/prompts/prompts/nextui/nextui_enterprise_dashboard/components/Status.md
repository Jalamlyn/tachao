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
      case "pending":
        return "warning";
      case "processing":
        return "primary";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "待计划";
      case "processing":
        return "进行中";
      case "completed":
        return "已完成";
      case "cancelled":
        return "已取消";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "solar:hourglass-line-duotone";
      case "processing":
        return "solar:running-round-line-duotone";
      case "completed":
        return "solar:check-circle-line-duotone";
      case "cancelled":
        return "solar:close-circle-line-duotone";
      default:
        return "solar:question-circle-line-duotone";
    }
  };

  return (
    <NextUI.Chip
      startContent={<Icon className="text-base" icon={getStatusIcon(status)} />}
      className="capitalize"
      color={getStatusColor(status)}
      size="sm"
      variant="flat"
    >
      {getStatusText(status)}
    </NextUI.Chip>
  );
});

context.wpm.export('comp_status', Status);
</mo-ai-code>