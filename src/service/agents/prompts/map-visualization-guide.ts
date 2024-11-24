export const mapVisualizationGuide = `
# 地图可视化指南

## 1. 数据格式规范
\`\`\`typescript
// 地图数据格式
interface MapDataItem {
  name: string          // 位置名称
  address: string       // 详细地址
  value: number        // 数值(用于确定点的大小和颜色)
  [key: string]: any   // 其他自定义数据
}

// 完整的图表配置
{
  type: 'map',
  title: string,
  data: MapDataItem[],
  options?: {
    center?: [number, number],
    zoom?: number,
    style?: 'normal' | 'dark'
  },
  style?: {
    pointColor?: string | ((value: number) => string),
    symbolSize?: number | ((value: number) => number)
  }
}
\`\`\`

## 2. 常见可视化场景

### 2.1 销售数据地理分布
\`\`\`javascript
// 示例: 展示各地区销售额分布
{
  type: 'map',
  title: '销售额地理分布',
  data: salesData.map(item => ({
    name: item.cityName,
    address: item.address,
    value: item.salesAmount,
    orderCount: item.orderCount
  })),
  tooltip: {
    fields: [
      { key: 'value', label: '销售额', format: v => \`￥\${v.toLocaleString()}\` },
      { key: 'orderCount', label: '订单数' }
    ]
  }
}
\`\`\`

### 2.2 用户分布热力图
\`\`\`javascript
// 示例: 用户密度分布
{
  type: 'map',
  title: '用户分布热力图',
  data: userData.map(item => ({
    name: item.region,
    address: item.address,
    value: item.userCount
  })),
  style: {
    pointColor: (value, min, max) => {
      const ratio = (value - min) / (max - min)
      return \`rgba(255, 0, 0, \${0.2 + ratio * 0.8})\`
    },
    symbolSize: (value, clustering) => clustering ? Math.sqrt(value) * 3 : Math.sqrt(value) * 5
  }
}
\`\`\`

### 2.3 门店覆盖分析
\`\`\`javascript
// 示例: 门店网络覆盖
{
  type: 'map',
  title: '门店网络覆盖',
  data: storeData.map(item => ({
    name: item.storeName,
    address: item.address,
    value: item.coverage,
    sales: item.monthlyRevenue,
    staff: item.employeeCount
  })),
  tooltip: {
    fields: [
      { key: 'sales', label: '月营收', format: v => \`￥\${v.toLocaleString()}\` },
      { key: 'staff', label: '员工数' },
      { key: 'value', label: '覆盖范围', format: v => \`\${v}km\` }
    ]
  }
}
\`\`\`

## 3. 数据处理最佳实践

### 3.1 数据聚合
\`\`\`javascript
// 按地区聚合数据
const aggregateByRegion = (data) => {
  return Object.values(data.reduce((acc, item) => {
    if (!acc[item.region]) {
      acc[item.region] = {
        name: item.region,
        address: item.region,
        value: 0,
        count: 0
      }
    }
    acc[item.region].value += item.value
    acc[item.region].count += 1
    return acc
  }, {}))
}
\`\`\`

### 3.2 数值归一化
\`\`\`javascript
// 数值归一化处理
const normalizeValues = (data) => {
  const values = data.map(item => item.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  return data.map(item => ({
    ...item,
    normalizedValue: (item.value - min) / (max - min)
  }))
}
\`\`\`

## 4. 分析洞察生成

### 4.1 地理分布特征
- 识别数据密集区域
- 计算区域集中度
- 发现异常点分布

### 4.2 区域对比分析
- 计算区域间差异
- 识别高低值区域
- 分析地理相关性

### 4.3 时空演变分析
- 计算区域变化趋势
- 识别快速发展区域
- 预测未来发展趋势

## 5. 注意事项
1. 确保地址信息准确完整
2. 处理地理编码失败情况
3. 考虑数据量对性能的影响
4. 合理使用聚合功能
5. 注意颜色和大小的视觉效果
`