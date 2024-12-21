# 文本输入字段

## 基础文本输入
```typescript
{
  name: "basicText",
  label: "基础文本",
  type: "text",
  required: true,
  placeholder: "请输入文本"
}
```
支持单行文本输入,可以设置必填、占位符等基本属性。

## 多行文本
```typescript
{
  name: "longText",
  label: "详细描述", 
  type: "textarea",
  rows: 4,
  maxLength: 500,
  showCount: true,
  description: "最多输入500字"
}
```
使用textarea类型支持多行文本输入,可以设置行数和字数限制。

## 特殊格式文本
```typescript
{
  name: "email",
  label: "邮箱",
  type: "text",
  required: true,
  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  formatConfig: {
    type: "text",
    format: (value) => value?.toLowerCase()
  },
  description: "请输入有效的邮箱地址"
}
```
可以通过pattern设置验证规则,formatConfig配置格式化规则。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "文本输入示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "textGroup",
          title: "文本字段示例",
          fields: [
            {
              name: "username",
              label: "用户名",
              type: "text",
              required: true,
              placeholder: "请输入用户名",
              description: "用户名长度3-20个字符",
              validators: [
                (value) => {
                  if(value && (value.length < 3 || value.length > 20)) {
                    return "用户名长度必须在3-20个字符之间"
                  }
                }
              ]
            },
            {
              name: "bio",
              label: "个人简介",
              type: "textarea", 
              rows: 4,
              maxLength: 200,
              showCount: true,
              description: "简单介绍一下自己"
            },
            {
              name: "email",
              label: "邮箱",
              type: "text",
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              description: "请输入有效的邮箱地址"
            },
            {
              name: "website",
              label: "个人网站",
              type: "text",
              formatConfig: {
                type: "text",
                format: (value) => {
                  if(!value) return value
                  if(!value.startsWith('http')) {
                    return `https://${value}`
                  }
                  return value
                }
              },
              description: "如果不包含http,会自动添加https://"
            }
          ]
        }
      ]
    }
  }
}
```