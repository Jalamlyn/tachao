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

### 字段联动

使用 watch 函数来实现字段联动：

```typescript
const config: DynamicFormConfig = {
  watch: (form) => {
    // 使用单个 watch 处理所有字段变化
    const subscription = form.watch((value, { name }) => {
      // 根据字段名称处理不同的联动逻辑
      switch(name) {
        case 'type':
          // 根据类型控制字段显示
          form.setValue("extraField.hidden", value !== "special");
          break;
          
        case 'needApproval':
          // 根据条件设置必填
          form.setValue("approver.required", value === true);
          break;
          
        case 'price':
        case 'quantity':
          // 自动计算金额
          const price = form.getValues('price') || 0;
          const quantity = form.getValues('quantity') || 0;
          form.setValue("amount", price * quantity);
          break;
      }
    });

    return () => subscription.unsubscribe();
  }
};
```

### 自定义组件渲染

要使用自定义组件渲染，需要同时满足两个条件：
1. 设置字段类型为 "custom"
2. 提供 render 函数

示例：
```javascript
{
  name: "applicant",
  label: "申请人",
  type: "custom",  // 必须设置为 custom
  render: ({ field, form, isEditable }) => (
    <div className="flex items-center space-x-2">
      <Input 
        {...field}
        disabled={!isEditable} 
        className="flex-grow" 
      />
      <Button 
        color="primary" 
        variant="solid" 
        size="sm"
        isDisabled={!isEditable}
        onClick={() => {
          // 自定义按钮点击逻辑
          console.log('验证申请人', field.value);
        }}
      >
        核验
      </Button>
    </div>
  )
}
```

注意事项：
1. 如果没有设置 type: "custom"，即使提供了 render 函数也不会被调用
2. render 函数接收 { field, form, isEditable } 作为参数
3. 自定义组件只能使用 shadcn UI 组件库中的组件，Button 组件必须使用 NextUI 的 Button
4. 要考虑表单的可编辑状态，使用 isEditable 控制组件的禁用状态

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