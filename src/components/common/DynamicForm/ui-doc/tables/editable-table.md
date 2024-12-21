# 可编辑表格

## 基础可编辑表格
```typescript
{
  key: "editableTable",
  title: "可编辑表格",
  config: {
    columns: [
      {
        key: "name",
        title: "名称",
        type: "text",
        editable: true
      },
      {
        key: "remark",
        title: "备注",
        type: "text",
        editable: true
      }
    ]
  }
}
```
支持单元格编辑。

## 带验证的可编辑表格
```typescript
{
  key: "validationTable",
  title: "带验证的表格",
  config: {
    columns: [
      {
        key: "email",
        title: "邮箱",
        type: "text",
        editable: true,
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        validators: [
          (value) => {
            if (!value) return "邮箱不能为空"
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              return "请输入有效的邮箱地址"
            }
          }
        ]
      }
    ]
  }
}
```
支持表格数据验证。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "可编辑表格示例"
  },
  renderConfig: {
    tables: [
      {
        key: "contactTable",
        title: "联系人列表",
        description: "请填写联系人信息",
        config: {
          columns: [
            {
              key: "name",
              title: "姓名",
              type: "text",
              width: 150,
              required: true,
              editable: true
            },
            {
              key: "gender",
              title: "性别",
              type: "select",
              width: 100,
              editable: true,
              options: [
                { label: "男", value: "male" },
                { label: "女", value: "female" }
              ]
            },
            {
              key: "phone",
              title: "电话",
              type: "text",
              width: 150,
              editable: true,
              required: true,
              pattern: /^1[3-9]\d{9}$/,
              validators: [
                (value) => {
                  if (!value) return "电话不能为空"
                  if (!/^1[3-9]\d{9}$/.test(value)) {
                    return "请输入有效的手机号"
                  }
                }
              ]
            },
            {
              key: "email",
              title: "邮箱",
              type: "text",
              width: 200,
              editable: true,
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            {
              key: "department",
              title: "部门",
              type: "text",
              width: 150,
              editable: true
            },
            {
              key: "position",
              title: "职位",
              type: "text",
              width: 150,
              editable: true
            },
            {
              key: "status",
              title: "状态",
              type: "select",
              width: 100,
              editable: true,
              options: [
                { label: "在职", value: "active" },
                { label: "离职", value: "inactive" }
              ],
              formatConfig: {
                type: "text",
                conditions: [
                  {
                    condition: value => value === "active",
                    format: () => "在职",
                    style: { color: "green" }
                  },
                  {
                    condition: value => value === "inactive",
                    format: () => "离职",
                    style: { color: "red" }
                  }
                ]
              }
            },
            {
              key: "remark",
              title: "备注",
              type: "text",
              width: 200,
              editable: true
            }
          ]
        }
      }
    ]
  }
}
```