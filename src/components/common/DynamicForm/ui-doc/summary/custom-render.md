# 自定义渲染汇总

## 基础自定义渲染
```typescript
{
  summaryGroups: [
    {
      key: "customSummary",
      title: "自定义渲染汇总",
      fields: [
        {
          name: "status",
          label: "状态",
          type: "custom",
          render: (value) => {
            const color = value === "active" ? "green" : "red"
            return <span style={{ color }}>{value}</span>
          }
        }
      ]
    }
  ]
}
```
基础的自定义渲染配置。

## 复杂自定义渲染
```typescript
{
  summaryGroups: [
    {
      key: "complexCustomSummary",
      title: "复杂自定义渲染汇总",
      fields: [
        {
          name: "progress",
          label: "进度",
          type: "custom",
          render: (value) => {
            return (
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${value}%` }}
                />
                <span>{value}%</span>
              </div>
            )
          }
        }
      ]
    }
  ]
}
```
支持复杂的自定义渲染。

## 完整示例
```typescript
const formConfig = {
  metadata: {
    title: "自定义渲染汇总示例"
  },
  renderConfig: {
    summaryGroups: [
      {
        key: "customRenderSummary",
        title: "自定义渲染汇总",
        icon: "mdi:palette",
        description: "展示各种自定义渲染效果",
        layout: "grid",
        columns: 3,
        fields: [
          {
            name: "status",
            label: "状态指示器",
            type: "custom",
            render: (value) => {
              const statuses = {
                success: { color: "#52c41a", text: "正常" },
                warning: { color: "#faad14", text: "警告" },
                error: { color: "#ff4d4f", text: "错误" }
              }
              const status = statuses[value] || statuses.warning
              
              return (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: status.color,
                      boxShadow: `0 0 8px ${status.color}`
                    }}
                  />
                  <span style={{ color: status.color }}>{status.text}</span>
                </div>
              )
            }
          },
          {
            name: "progress",
            label: "进度指示器",
            type: "custom",
            render: (value) => {
              const percent = Number(value) || 0
              const getColor = (p) => {
                if (p >= 80) return "#52c41a"
                if (p >= 50) return "#1890ff"
                return "#ff4d4f"
              }
              
              return (
                <div style={{ width: "100%" }}>
                  <div style={{ 
                    height: "8px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${percent}%`,
                      height: "100%",
                      backgroundColor: getColor(percent),
                      transition: "all 0.3s ease"
                    }} />
                  </div>
                  <div style={{
                    marginTop: "4px",
                    fontSize: "12px",
                    color: getColor(percent)
                  }}>
                    {percent}% 完成
                  </div>
                </div>
              )
            }
          },
          {
            name: "trend",
            label: "趋势图",
            type: "custom",
            render: (value) => {
              const data = Array.isArray(value) ? value : []
              const max = Math.max(...data)
              const min = Math.min(...data)
              const range = max - min
              
              return (
                <div style={{ 
                  display: "flex",
                  alignItems: "flex-end",
                  gap: "2px",
                  height: "40px"
                }}>
                  {data.map((point, index) => {
                    const height = range ? ((point - min) / range) * 100 : 0
                    return (
                      <div
                        key={index}
                        style={{
                          flex: 1,
                          height: `${height}%`,
                          backgroundColor: point >= data[index - 1] ? "#52c41a" : "#ff4d4f",
                          transition: "height 0.3s ease"
                        }}
                      />
                    )
                  })}
                </div>
              )
            }
          },
          {
            name: "tags",
            label: "标签组",
            type: "custom",
            render: (value) => {
              const tags = Array.isArray(value) ? value : []
              const colors = {
                high: "#ff4d4f",
                medium: "#faad14",
                low: "#52c41a"
              }
              
              return (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        backgroundColor: colors[tag.priority] || "#f0f0f0",
                        color: colors[tag.priority] ? "white" : "inherit",
                        fontSize: "12px"
                      }}
                    >
                      {tag.text}
                    </span>
                  ))}
                </div>
              )
            }
          },
          {
            name: "rating",
            label: "评分",
            type: "custom",
            render: (value) => {
              const score = Number(value) || 0
              const maxScore = 5
              
              return (
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  {Array.from({ length: maxScore }).map((_, index) => (
                    <span
                      key={index}
                      style={{
                        color: index < score ? "#faad14" : "#d9d9d9",
                        fontSize: "16px"
                      }}
                    >
                      ★
                    </span>
                  ))}
                  <span style={{ marginLeft: "8px", color: "#666" }}>
                    {score.toFixed(1)}
                  </span>
                </div>
              )
            }
          },
          {
            name: "timeline",
            label: "时间线",
            type: "custom",
            render: (value) => {
              const events = Array.isArray(value) ? value : []
              
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {events.map((event, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px"
                      }}
                    >
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#1890ff",
                          marginTop: "6px"
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "14px", color: "#333" }}>
                          {event.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {event.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          }
        ]
      }
    ]
  }
}
```