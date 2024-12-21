# 表单验证

## 基础字段验证
```typescript
{
  basicFields: {
    groups: [
      {
        key: "basicValidation",
        title: "基础验证",
        fields: [
          {
            name: "required",
            label: "必填字段",
            type: "text",
            required: true
          },
          {
            name: "pattern",
            label: "正则验证",
            type: "text",
            pattern: /^[A-Za-z0-9]+$/,
            description: "只能输入字母和数字"
          }
        ]
      }
    ]
  }
}
```
基础的字段验证配置。

## 自定义验证
```typescript
{
  basicFields: {
    groups: [
      {
        key: "customValidation",
        title: "自定义验证",
        fields: [
          {
            name: "password",
            label: "密码",
            type: "password",
            validators: [
              (value) => {
                if (value && value.length < 6) {
                  return "密码长度不能小于6位"
                }
                if (!/[A-Z]/.test(value)) {
                  return "密码必须包含大写字母"
                }
              }
            ]
          },
          {
            name: "confirmPassword",
            label: "确认密码",
            type: "password",
            validators: [
              (value, data) => {
                if (value !== data.password) {
                  return "两次输入的密码不一致"
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```
支持自定义验证逻辑。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "表单验证示例"
  },
  renderConfig: {
    basicFields: {
      groups: [
        {
          key: "userInfo",
          title: "用户信息",
          icon: "mdi:account",
          fields: [
            {
              name: "username",
              label: "用户名",
              type: "text",
              required: true,
              validators: [
                (value) => {
                  if (!value) return "用户名不能为空"
                  if (value.length < 3) return "用户名至少3个字符"
                  if (value.length > 20) return "用户名最多20个字符"
                  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
                    return "用户名只能包含字母、数字和下划线，且必须以字母开头"
                  }
                }
              ]
            },
            {
              name: "email",
              label: "邮箱",
              type: "text",
              required: true,
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              validators: [
                async (value) => {
                  if (!value) return
                  // 模拟异步验证邮箱是否已注册
                  await new Promise(resolve => setTimeout(resolve, 500))
                  if (value === "test@example.com") {
                    return "该邮箱已被注册"
                  }
                }
              ]
            },
            {
              name: "phone",
              label: "手机号",
              type: "text",
              required: true,
              pattern: /^1[3-9]\d{9}$/,
              description: "请输入11位手机号"
            }
          ]
        },
        {
          key: "security",
          title: "安全设置",
          icon: "mdi:shield-lock",
          fields: [
            {
              name: "password",
              label: "密码",
              type: "password",
              required: true,
              validators: [
                (value) => {
                  if (!value) return "密码不能为空"
                  if (value.length < 8) return "密码长度不能小于8位"
                  if (value.length > 20) return "密码长度不能超过20位"
                  if (!/[A-Z]/.test(value)) return "密码必须包含大写字母"
                  if (!/[a-z]/.test(value)) return "密码必须包含小写字母"
                  if (!/[0-9]/.test(value)) return "密码必须包含数字"
                  if (!/[^A-Za-z0-9]/.test(value)) return "密码必须包含特殊字符"
                }
              ]
            },
            {
              name: "confirmPassword",
              label: "确认密码",
              type: "password",
              required: true,
              validators: [
                (value, data) => {
                  if (!value) return "请确认密码"
                  if (value !== data.password) return "两次输入的密码不一致"
                }
              ]
            },
            {
              name: "securityQuestion",
              label: "密保问题",
              type: "select",
              required: true,
              options: [
                { label: "您的出生地是？", value: "birthplace" },
                { label: "您母亲的姓名是？", value: "mothername" },
                { label: "您的小学校名是？", value: "school" }
              ]
            },
            {
              name: "securityAnswer",
              label: "密保答案",
              type: "text",
              required: true,
              validators: [
                (value, data) => {
                  if (!value) return "请输入密保答案"
                  if (value === data.password) return "密保答案不能与密码相同"
                }
              ]
            }
          ]
        }
      ]
    }
  },
  validate: async (values) => {
    const errors = []
    
    // 表单级验证
    try {
      // 模拟异步验证
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 验证用户名是否已存在
      if (values.username === "admin") {
        errors.push("用户名已存在")
      }
      
      // 验证密码强度
      const passwordStrength = calculatePasswordStrength(values.password)
      if (passwordStrength < 80) {
        errors.push("密码强度不足，建议增加复杂度")
      }
      
      if (errors.length > 0) {
        return {
          valid: false,
          errors
        }
      }
      
      return {
        valid: true
      }
    } catch (error) {
      console.error("Validation error:", error)
      return {
        valid: false,
        errors: ["表单验证失败，请重试"]
      }
    }
  }
}

// 辅助函数：计算密码强度
function calculatePasswordStrength(password: string): number {
  if (!password) return 0
  
  let strength = 0
  
  // 长度检查
  strength += Math.min(password.length * 4, 40)
  
  // 字符类型检查
  if (/[A-Z]/.test(password)) strength += 10
  if (/[a-z]/.test(password)) strength += 10
  if (/[0-9]/.test(password)) strength += 10
  if (/[^A-Za-z0-9]/.test(password)) strength += 10
  
  // 复杂性检查
  const uniqueChars = new Set(password).size
  strength += Math.min(uniqueChars * 2, 20)
  
  return Math.min(strength, 100)
}
```