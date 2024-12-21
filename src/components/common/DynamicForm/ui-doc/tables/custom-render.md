# 自定义渲染表格

## 基础自定义渲染
```typescript
{
  key: "customTable",
  title: "自定义渲染表格",
  config: {
    columns: [
      {
        key: "status",
        title: "状态",
        type: "text",
        render: (value) => {
          const color = value === "active" ? "green" : "red"
          return <span style={{ color }}>{value}</span>
        }
      }
    ]
  }
}
```
基础的单元格自定义渲染。

## 复杂自定义渲染
```typescript
{
  key: "complexCustomTable",
  title: "复杂自定义渲染表格",
  config: {
    columns: [
      {
        key: "actions",
        title: "操作",
        type: "custom",
        render: (value, record, index) => {
          return (
            <div className="flex gap-2">
              <button onClick={() => handleEdit(record)}>编辑</button>
              <button onClick={() => handleDelete(index)}>删除</button>
            </div>
          )
        }
      }
    ]
  }
}
```
支持复杂的自定义渲染逻辑。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "自定义渲染表格示例"
  },
  renderConfig: {
    tables: [
      {
        key: "customRenderTable",
        title: "自定义渲染表格",
        description: "展示各种自定义渲染方式",
        config: {
          columns: [
            {
              key: "name",
              title: "名称",
              type: "text",
              width: 150,
              required: true
            },
            {
              key: "status",
              title: "状态",
              type: "select",
              width: 120,
              options: [
                { label: "活跃", value: "active" },
                { label: "禁用", value: "disabled" }
              ],
              render: (value) => {
                const style = {
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "500"
                }
                
                if (value === "active") {
                  return (
                    <span style={{ ...style, backgroundColor: "#e6f4ff", color: "#0066ff" }}>
                      活跃
                    </span>
                  )
                }
                
                return (
                  <span style={{ ...style, backgroundColor: "#fff2f0", color: "#ff4d4f" }}>
                    禁用
                  </span>
                )
              }
            },
            {
              key: "progress",
              title: "进度",
              type: "number",
              width: 200,
              render: (value) => {
                const percent = Number(value) || 0
                return (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ 
                      flex: 1,
                      height: "8px",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "4px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${percent}%`,
                        height: "100%",
                        backgroundColor: "#0066ff",
                        transition: "width 0.3s ease"
                      }} />
                    </div>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      {percent}%
                    </span>
                  </div>
                )
              }
            },
            {
              key: "tags",
              title: "标签",
              type: "text",
              width: 200,
              render: (value) => {
                if (!value) return null
                const tags = value.split(",")
                return (
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {tags.map((tag, index) => (
                      <span key={index} style={{
                        padding: "2px 8px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "4px",
                        fontSize: "12px"
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )
              }
            },
            {
              key: "avatar",
              title: "头像",
              type: "upload",
              width: 100,
              render: (value) => {
                if (!value?.downloadUrl) return null
                return (
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    overflow: "hidden"
                  }}>
                    <img 
                      src={value.downloadUrl} 
                      alt="avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </div>
                )
              }
            },
            {
              key: "actions",
              title: "操作",
              type: "custom",
              width: 200,
              render: (value, record, index) => {
                return (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => {
                        console.log("Edit:", record)
                      }}
                      style={{
                        padding: "4px 12px",
                        border: "1px solid #0066ff",
                        borderRadius: "4px",
                        color: "#0066ff",
                        backgroundColor: "transparent",
                        cursor: "pointer"
                      }}
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => {
                        console.log("Delete row:", index)
                      }}
                      style={{
                        padding: "4px 12px",
                        border: "1px solid #ff4d4f",
                        borderRadius: "4px",
                        color: "#ff4d4f",
                        backgroundColor: "transparent",
                        cursor: "pointer"
                      }}
                    >
                      删除
                    </button>
                  </div>
                )
              }
            }
          ]
        }
      }
    ]
  }
}
```