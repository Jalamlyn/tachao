## 基本字段配置

基本字段是表单的主要组成部分，每个字段都有以下属性：

```typescript
interface FormField {
  name: string;                // 字段名称
  label: string;               // 字段标签
  type: FormFieldType;         // 字段类型
  placeholder?: string;        // 占位文本
  disabled?: boolean;          // 是否禁用
  hidden?: boolean;            // 是否隐藏
  required?: boolean;          // 是否必填
  tooltip?: TooltipConfig;     // 提示信息配置
  validators?: Array<(value: any, allValues?: any) => string | undefined>;  // 验证器
  showWhen?: {                // 条件显示配置
    field: string;
    value: any;
    operator?: "eq" | "neq" | "gt" | "lt" | "contains";
  };
}
```

支持的字段类型：
- text：文本输入
- password：密码输入
- number：数字输入
- email：邮箱输入
- tel：电话输入
- url：URL输入
- textarea：多行文本
- select：下拉选择
- date：日期选择
- datetime：日期时间选择
- custom：自定义组件
- resource：资源选择

示例：
```javascript
const basicFields = [
  {
    name: "name",
    label: "姓名",
    type: "text",
    required: true,
    tooltip: {
      content: "请输入真实姓名",
      placement: "right"
    }
  },
  {
    name: "leaveType",
    label: "请假类型",
    type: "select",
    required: true,
    options: [
      { label: "年假", value: "annual" },
      { label: "事假", value: "personal" },
      { label: "病假", value: "sick" }
    ]
  }
];
```