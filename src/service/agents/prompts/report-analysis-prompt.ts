// 基础数据结构定义
const structureDefinition = `
返回结果必须严格遵循以下数据结构:

{
  type: 'analyze',
  data: Array<any>,
  analysis: {
    // 统计摘要,包含关键指标
    summary: {
      [key: string]: number | string | Record<string, any>
    },
    
    // 图表数据,必须在顶层
    charts?: Array<{
      type: string, // 图表类型
      title: string, // 图表标题
      data: Array<{
        name: string,
        value: number
      }>
    }>,
    
    // 表格数据,必须在顶层
    tables?: Array<{
      title: string,
      columns: Array<{
        key: string,
        title: string
      }>,
      data: Array<any>
    }>,
    
    // 数据洞察,必须在顶层
    insights: Array<string>,

    // 流程分析数据(可选)
    processAnalysis?: {
      // 流程概要信息
      summary?: {
        totalProcessNodes: number,    // 总节点数
        completedNodes: number,       // 已完成节点数
        completionRate: string,       // 完成率(百分比)
        averageProcessTime: string    // 平均处理时长(必须是时间描述)
      },
      
      // 节点状态信息
      nodeStatus?: Record<string, string>,  // 必须是状态描述字符串
      
      // 流程耗时信息
      processDuration?: {
        total: string,                // 总耗时(必须是时间描述)
        nodesDuration: Record<string, string>  // 各节点耗时(必须是时间描述)
      },
      
      // 审批人工作量统计
      approvers?: Record<string, number>,
      
      // 流程状态统计
      processStatus?: Record<string, number>
    }
  }
}
`;

// 数据计算规则
const calculationRules = `
重要规则:
1. 所有统计值必须通过传入的data数据计算得到,不允许使用固定值或魔法数字
2. 必须对data中的数值进行类型转换和有效性验证
3. 必须处理空值和异常情况
4. 时间相关的值必须转换为描述字符串(如:'2.5天')
5. 状态描述必须使用字符串(如:'已完成','进行中')

示例计算代码:
// 数据验证
const validData = data.filter(item => item && typeof item === 'object');

// 基础统计
const totalCount = validData.length;
const completedCount = validData.filter(item => item.status === 'completed').length;
const completionRate = totalCount > 0 ? \`\${((completedCount / totalCount) * 100).toFixed(1)}%\` : '0%';

// 流程节点统计
const totalProcessNodes = validData.reduce((count, item) => {
  return count + (Array.isArray(item.nodes) ? item.nodes.length : 0);
}, 0);

// 时间计算
const averageTime = validData.reduce((total, item) => {
  const duration = Number(item.duration) || 0;
  return total + duration;
}, 0) / (validData.length || 1);

const formatDuration = (days) => {
  if (days < 1) return \`\${(days * 24).toFixed(1)}小时\`;
  return \`\${days.toFixed(1)}天\`;
};

// 节点状态映射
const getNodeStatus = (status) => {
  const statusMap = {
    completed: '已完成',
    processing: '进行中',
    pending: '待处理'
  };
  return statusMap[status] || '未知状态';
};
`;

// 图表配置示例
const chartExamples = `
图表配置示例:
// 饼图示例
{
  type: 'pie',
  title: '状态分布',
  data: [
    { name: '已完成', value: completedCount },
    { name: '进行中', value: processingCount },
    { name: '待处理', value: pendingCount }
  ]
}

// 柱状图示例
{
  type: 'bar',
  title: '审批人工作量',
  data: Object.entries(approverStats).map(([name, count]) => ({
    name,
    value: count
  }))
}
`;

// 表格配置示例
const tableExamples = `
表格配置示例:
{
  title: '流程明细',
  columns: [
    { key: 'processId', title: '流程ID' },
    { key: 'status', title: '状态' },
    { key: 'duration', title: '耗时' },
    { key: 'approver', title: '审批人' }
  ],
  data: validData.map(item => ({
    processId: item.id,
    status: getNodeStatus(item.status),
    duration: formatDuration(item.duration),
    approver: item.approver
  }))
}
`;

// 完整示例
const fullExample = `
完整示例:
const result = {
  type: 'analyze',
  data: data,
  analysis: {
    summary: {
      totalCount,
      completedCount,
      completionRate,
      averageProcessTime: formatDuration(averageTime)
    },
    charts: [{
      type: 'pie',
      title: '状态分布',
      data: [
        { name: '已完成', value: completedCount },
        { name: '进行中', value: processingCount }
      ]
    }],
    tables: [{
      title: '流程明细',
      columns: [
        { key: 'processId', title: '流程ID' },
        { key: 'status', title: '状态' }
      ],
      data: validData.map(item => ({
        processId: item.id,
        status: getNodeStatus(item.status)
      }))
    }],
    insights: [
      \`总流程数: \${totalCount}个\`,
      \`完成率: \${completionRate}\`,
      \`平均处理时长: \${formatDuration(averageTime)}\`
    ],
    processAnalysis: {
      summary: {
        totalProcessNodes,
        completedNodes: completedCount,
        completionRate,
        averageProcessTime: formatDuration(averageTime)
      },
      nodeStatus: validData.reduce((acc, item) => {
        if (item.nodeName) {
          acc[item.nodeName] = getNodeStatus(item.status);
        }
        return acc;
      }, {}),
      processDuration: {
        total: formatDuration(totalDuration),
        nodesDuration: calculateNodesDuration(validData)
      },
      approvers: calculateApproverStats(validData),
      processStatus: calculateProcessStatus(validData)
    }
  }
};
`;

// 导出提示词生成函数
const generateReportAnalysisPrompt = (data: any[]) => {
  const basePrompt = `你是一个智能报表分析助手，负责帮助用户对数据进行分析。
请仔细分析用户的需求，生成相应的分析代码。

数据示例:
${JSON.stringify(data.slice(0, 3), null, 2)}

数据总行数: ${data.length}

${structureDefinition}

${calculationRules}

${chartExamples}

${tableExamples}

${fullExample}

请确保生成的代码:
1. 严格遵循数据结构定义
2. 所有值都通过data计算得到
3. 进行适当的数据验证和类型转换
4. 使用正确的时间和状态描述字符串
5. charts、tables、insights必须在analysis的顶层
`;

  return basePrompt;
};

export default generateReportAnalysisPrompt;