import { Icon } from "@iconify/react"

// 空状态组件 - 分析报表
export const EmptyAnalysisState: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] p-8'>
      <div className='w-48 h-48 mb-8 relative'>
        <div>
          <Icon icon='hugeicons:ai-chat-02' className='w-full h-full text-primary/30' />
        </div>
      </div>
      <h3 className='text-xl font-medium text-foreground mb-2'>开始分析您的数据</h3>
      <p className='text-default-500 mb-8 text-center max-w-md'>使用左侧的 AI 助手来分析您的数据，生成图表和洞察报告</p>
      <div className='flex flex-col gap-4 items-center'>
        <div className='p-4 bg-primary/5 rounded-lg'>
          <p className='text-sm text-default-600'>示例提示语:</p>
          <ul className='list-disc pl-6 space-y-2 text-primary'>
            <li>帮我分析数据的整体分布情况</li>
            <li>生成一个饼图展示状态分布</li>
            <li>计算各个指标的平均值</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// 空状态组件 - 代码视图
export const EmptyCodeState: React.FC = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-[400px] p-8'>
      <div className='w-48 h-48 mb-8 relative'>
        <div>
          <Icon icon='mdi:code-braces' className='w-full h-full text-primary/30' />
        </div>
      </div>
      <h3 className='text-xl font-medium text-foreground mb-2'>等待生成分析代码</h3>
      <p className='text-default-500 mb-4 text-center max-w-md'>当 AI 助手生成分析结果后，这里会显示相应的代码</p>
    </div>
  )
}
