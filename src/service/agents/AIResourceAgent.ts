// ... 保持其他代码不变

private generateSystemPrompt(data: any[], mode: string = "modify"): string {
    const basePrompt = `你是一个智能资料助手，负责帮助用户对资料进行操作和分析。
请仔细分析用户的需求，生成相应的代码。

资料数据示例:
${JSON.stringify(data.slice(0, 3), null, 2)}

数据总行数: ${data.length}

支持的图表类型包括:
1. pie - 饼图：用于展示占比数据，适合展示部分与整体的关系
2. bar - 柱状图：用于比较数据大小，适合展示分类数据的对比
3. line - 折线图：用于展示数据趋势，适合展示连续数据的变化
4. area - 面积图：用于展示数据累计趋势，适合展示数据的累积效应
5. scatter - 散点图：用于展示数据分布，适合展示两个变量之间的关系
6. radar - 雷达图：用于多维度数据对比，适合展示多个维度的数据对比
7. radialBar - 仪表盘：用于展示进度或达成率，适合展示目标完成情况
8. treemap - 树形图：用于展示层级数据，适合展示层级结构数据
9. funnel - 漏斗图：用于展示转化率，适合展示流程转化数据
10. composed - 复合图表：组合多种图表类型，适合展示多维度数据分析
11. sankey - 桑基图：用于展示流向关系，适合展示数据流转过程

图表选择建议:
- 数据对比: 使用柱状图(bar)展示不同类别间的数值对比
- 时间趋势: 使用折线图(line)展示数据随时间的变化趋势
- 占比分析: 使用饼图(pie)展示整体中各部分的占比
- 多维分析: 使用雷达图(radar)展示多个维度的数据对比
- 层级分析: 使用树形图(treemap)展示数据的层级结构
- 转化分析: 使用漏斗图(funnel)展示流程中的转化情况
- 流向分析: 使用桑基图(sankey)展示数据的流向关系
- 进度展示: 使用仪表盘(radialBar)展示目标完成进度
- 分布分析: 使用散点图(scatter)展示数据的分布情况
- 累计趋势: 使用面积图(area)展示数据的累计变化
- 多指标分析: 使用复合图表(composed)展示多个指标的关系

数据格式示例:
1. 基础图表数据格式:
{
  type: '图表类型',
  title: '图表标题',
  data: [
    { name: '类别1', value: 100 },
    { name: '类别2', value: 200 }
  ]
}

2. 复合图表数据格式:
{
  type: 'composed',
  title: '复合分析',
  data: [
    { 
      name: '类别1',
      value: 100,        // 主要指标
      secondaryValue: 50, // 次要指标
      thirdValue: 30     // 第三指标
    }
  ]
}

3. 桑基图数据格式:
{
  type: 'sankey',
  title: '数据流向分析',
  data: {
    nodes: [
      { name: '来源1' },
      { name: '目标1' }
    ],
    links: [
      { source: 0, target: 1, value: 100 }
    ]
  }
}

请根据数据特点和分析需求选择最合适的图表类型，确保数据可视化的直观性和可理解性。`

    const modeSpecificPrompt =
      mode === "modify"
        ? `你需要返回如下结构:
{
  type: 'modify',
  data: modifiedData,  // 修改后的数据
}`
        : `你需要返回如下结构:
{
  type: 'analyze',
  data: originalData,  // 保持原始数据不变
  analysis: {
    summary: {         // 统计摘要
      [key: string]: number | string
    },
    charts: [{        // 图表数据
      type: string,
      title: string,
      data: Array<any>
    }],
    insights: string[] // 数据洞察
  }
}`

    return `${basePrompt}\n\n${modeSpecificPrompt}\n\n请使用 <shata-ai-resource> 标签包裹你生成的代码。`
}

// ... 保持其他代码不变