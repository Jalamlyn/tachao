<mo-ai-code type="module" name="module_table_constants">
const {
  wpm
} = context;

// 列定义
const columns = [
  {
    key: "id",
    label: "加工单号"
  },
  {
    key: "name", 
    label: "加工单名称"
  },
  {
    key: "product",
    label: "加工产品"
  },
  {
    key: "supplier",
    label: "加工商"
  },
  {
    key: "process",
    label: "加工工序"
  },
  {
    key: "planQuantity",
    label: "计划加工数量"
  },
  {
    key: "processedQuantity", 
    label: "已加工数量"
  },
  {
    key: "qualifiedQuantity",
    label: "合格数量"
  },
  {
    key: "price",
    label: "加工单价"
  },
  {
    key: "amount",
    label: "加工金额"
  },
  {
    key: "status",
    label: "状态"
  },
  {
    key: "startDate",
    label: "开始日期"
  },
  {
    key: "endDate", 
    label: "完成日期"
  },
  {
    key: "actions",
    label: "操作"
  }
];

// 状态颜色映射
const statusColorMap = {
  pending: "warning", // 待发货
  processing: "primary", // 加工中
  inspecting: "secondary", // 质检中
  completed: "success", // 已完成
  rejected: "danger" // 已退回
};

// 状态文本映射
const statusTextMap = {
  pending: "待发货",
  processing: "加工中",
  inspecting: "质检中",
  completed: "已完成",
  rejected: "已退回"
};

const constants = {
  columns,
  statusColorMap,
  statusTextMap
};

context.wpm.export('module_table_constants', constants);
</mo-ai-code>