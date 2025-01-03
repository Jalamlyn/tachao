```jsx
<mo-ai-code type="module" name="module_table_constants">
const {
  wpm
} = context;

// 列定义
const columns = [
  {
    key: "id",
    label: "ID"
  },
  {
    key: "name",
    label: "名称"
  },
  {
    key: "status",
    label: "状态"
  },
  {
    key: "createdAt",
    label: "创建时间"
  },
  {
    key: "actions",
    label: "操作"
  }
];

// 状态颜色映射
const statusColorMap = {
  active: "success",
  paused: "warning",
  deleted: "danger"
};

const constants = {
  columns,
  statusColorMap
};

wpm.export('module_table_constants', constants);
</mo-ai-code>
```
