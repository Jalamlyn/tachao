export const TECH_PROMPTS = {
  nextUI: `NextUI 组件使用规范:
- 使用 NextUI 2.6.0 版本
- 只使用实际存在的组件
- 禁止使用 V1 版本组件
- 遵循组件文档规范

Tailwind CSS 使用规范:
- 使用 Tailwind CSS 编写样式
- 遵循 Tailwind 最佳实践
- 使用响应式设计类
- 合理使用自定义类

Framer Motion 动画规范:
- 使用 Framer Motion 实现动画
- 保持动画流畅性
- 实现合适的过渡效果
- 注意性能优化

MobX 状态管理规范:
1. 基本规则:
- 使用 makeAutoObservable 初始化
- 保持状态最小化
- 使用 observer 包装组件
- 遵循 MobX 最佳实践

2. 状态获取规范（重要）:
- 禁止在 action 中获取状态
- 所有数据获取必须通过状态或计算属性实现
- action 方法只能用于修改状态，不能用于获取状态

3. 正确的模式:
\`\`\`typescript
class TodoStore {
  todos = []
  filter = 'all'
  
  constructor() {
    makeAutoObservable(this)
  }
  
  // ✅ 正确：使用计算属性获取状态
  get filteredTodos() {
    return this.todos.filter(todo => {
      if (this.filter === 'all') return true
      if (this.filter === 'completed') return todo.completed
      return !todo.completed
    })
  }
  
  // ✅ 正确：action 只用于修改状态
  addTodo(title: string) {
    this.todos.push({ title, completed: false })
  }
  
  // ✅ 正确：action 只处理状态更新
  setFilter(filter: string) {
    this.filter = filter
  }
}
\`\`\`

4. 错误的模式:
\`\`\`typescript
class TodoStore {
  todos = []
  
  constructor() {
    makeAutoObservable(this)
  }
  
  // ❌ 错误：不要在 action 中获取和返回状态
  getCompletedTodos() {
    return this.todos.filter(todo => todo.completed)
  }
  
  // ❌ 错误：不要在 action 中进行状态计算
  getTodoCount() {
    return this.todos.length
  }
  
  // ❌ 错误：不要混合状态获取和修改
  async fetchAndUpdateTodos() {
    const todos = await api.getTodos()
    this.todos = todos
    return this.todos // 不要返回状态
  }
}
\`\`\`

5. 最佳实践:
- 使用计算属性（computed）进行状态派生
- 保持 action 方法的单一职责
- 状态查询使用 getter 或计算属性
- action 只负责状态修改
- 避免在 action 中返回状态
- 组件中使用 observer 确保响应式更新

6. 组件使用示例:
\`\`\`typescript
const TodoList = observer(() => {
  const store = useTodoStore()
  
  // ✅ 正确：直接使用状态和计算属性
  return (
    <div>
      <h2>Todos ({store.filteredTodos.length})</h2>
      {store.filteredTodos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
      <button onClick={() => store.addTodo("New Todo")}>Add Todo</button>
    </div>
  )
})
\`\`\`

7. 异步操作处理:
\`\`\`typescript
class TodoStore {
  todos = []
  loading = false
  error = null
  
  constructor() {
    makeAutoObservable(this)
  }
  
  // ✅ 正确：action 只处理状态更新
  async fetchTodos() {
    this.loading = true
    this.error = null
    
    try {
      const todos = await api.getTodos()
      this.setTodos(todos)
    } catch (error) {
      this.error = error.message
    } finally {
      this.loading = false
    }
  }
  
  // ✅ 正确：私有 action 处理状态更新
  private setTodos(todos) {
    this.todos = todos
  }
  
  // ✅ 正确：使用计算属性获取状态
  get hasTodos() {
    return this.todos.length > 0
  }
  
  get isLoading() {
    return this.loading
  }
  
  get hasError() {
    return !!this.error
  }
}
\`\`\`

8. 注意事项:
- 始终使用 makeAutoObservable 或 makeObservable
- 保持状态扁平化，避免深层嵌套
- 使用计算属性而不是方法获取派生状态
- action 方法名应该使用动词开头
- 私有的状态更新方法使用 private 修饰符
- 避免在 action 中包含复杂的业务逻辑
- 组件中使用 observer 确保更新

数据存储规范:
- 使用 appId 前缀隔离数据
- 区分 public 和 private 访问
- 统一使用 JSON 格式
- 处理数据验证和错误

Recharts 可视化规范:
1. 基本使用规则:
- 必须从 context 中获取 Recharts
- 使用响应式容器包装图表
- 保持数据格式一致性
- 处理数据加载和错误状态

2. 图表类型选择指南:
- 折线图：适用于趋势和时间序列数据
- 柱状图：适用于分类数据比较
- 饼图：适用于占比展示（不超过 8 个分类）
- 面积图：适用于累计值和趋势
- 散点图：适用于相关性分析
- 雷达图：适用于多维度数据对比

3. 正确的使用模式:
\`\`\`jsx
const ChartExample = observer(() => {
  const { Recharts } = context;
  const { 
    ResponsiveContainer, 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    Tooltip, 
    Legend 
  } = Recharts;

  // ✅ 正确：使用响应式容器
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8884d8" 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
\`\`\`

4. 性能优化:
- 使用 memo 优化重渲染
- 控制数据点数量
- 按需加载图表组件
- 使用防抖处理窗口调整
- 大数据集使用数据采样

5. 响应式设计:
- 使用 ResponsiveContainer
- 设置最小宽度和高度
- 适配不同屏幕尺寸
- 移动端优化显示
- 处理图表溢出

6. 交互设计:
- 自定义 Tooltip 内容
- 点击事件处理
- 缩放和平移控制
- 图例交互
- 数据筛选

7. 数据处理最佳实践:
\`\`\`typescript
// ✅ 正确：数据转换和格式化
const formatChartData = (rawData) => {
  return rawData.map(item => ({
    name: formatDate(item.date),
    value: Number(item.value),
    category: item.type
  }));
};

// ✅ 正确：自定义 Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-white p-2 border rounded shadow">
      <p className="text-sm">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};
\`\`\`

8. 图表定制指南:
- 使用主题色系
- 自定义图表组件
- 动画效果设置
- 坐标轴配置
- 图例样式调整

9. 错误处理:
- 数据加载状态
- 空数据展示
- 错误边界处理
- 降级方案
- 友好的错误提示

10. 辅助功能:
- 颜色对比度
- 图表描述
- 键盘导航
- 屏幕阅读器支持
- 交互提示

Web Package Manager (WPM) 使用规范:
- 模块导入规范:
  * 使用 await context.wpm.import(moduleName) 导入模块
  * 在组件或模块初始化时导入依赖
  * 处理导入失败的异常情况
  * 在使用 context.wpm.import 前必须确保模块已经导出
  * 检查所有导入模块的存在性

- 模块导出规范:
  * 页面模块: context.wpm.export('page_xxx', PageComponent)
  * Store模块: context.wpm.export('store_xxx', storeInstance)
  * Service模块: context.wpm.export('service_xxx', serviceInstance)
  * 通用模块: context.wpm.export('module_xxx', moduleInstance)
  * 入口模块必须使用 context.appId

- 依赖管理:
  * 避免循环依赖
  * 明确模块间的依赖关系
  * 合理组织模块层次结构
  * 按正确顺序创建和导出模块

- 错误示例:
  * ❌ 错误 - 导入未创建的模块
    const HomePage = await context.wpm.import('page_home'); // 如果 page_home 未导出则会失败
  
  * ✅ 正确 - 先导出再导入
    // 在 page_home.js 中
    const HomePage = () => { /* ... */ };
    context.wpm.export('page_home', HomePage);
    
    // 在其他文件中
    const HomePage = await context.wpm.import('page_home'); // 现在可以安全导入
`,
}