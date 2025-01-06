<mo-ai-code type="module" name="module_table_constants">
const {
  wpm
} = context;

// 列定义
const columns = [
  {
    key: "id",
    label: "计划编号"
  },
  {
    key: "name", 
    label: "计划名称"
  },
  {
    key: "product",
    label: "产品名称"
  },
  {
    key: "workshop",
    label: "工序名称" 
  },
  {
    key: "planQuantity",
    label: "计划数量"
  },
  {
    key: "finishQuantity", 
    label: "完成数量"
  },
  {
    key: "qualifiedQuantity",
    label: "合格数量"
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
    label: "结束日期"
  },
  {
    key: "actions",
    label: "操作"
  }
];

// 状态颜色映射
const statusColorMap = {
  pending: "warning",
  processing: "primary",
  completed: "success",
  cancelled: "danger"
};

const constants = {
  columns,
  statusColorMap
};

context.wpm.export('module_table_constants', constants);
</mo-ai-code>