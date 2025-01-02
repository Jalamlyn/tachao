export const TECH_PROMPTS = {
  nextUI: `NextUI 组件使用规范:
- 使用 NextUI 2.6.0 版本
- 只使用实际存在的组件
- 禁止使用 V1 版本组件
- 遵循组件文档规范`,

  tailwind: `Tailwind CSS 使用规范:
- 使用 Tailwind CSS 编写样式
- 遵循 Tailwind 最佳实践
- 使用响应式设计类
- 合理使用自定义类`,

  framerMotion: `Framer Motion 动画规范:
- 使用 Framer Motion 实现动画
- 保持动画流畅性
- 实现合适的过渡效果
- 注意性能优化`,

  mobx: `MobX 状态管理规范:
- 使用 makeAutoObservable 初始化
- 保持状态最小化
- 使用异步 action 处理副作用
- 遵循 MobX 最佳实践`,

  metadata: `数据存储规范:
- 使用 appId 前缀隔离数据
- 区分 public 和 private 访问
- 统一使用 JSON 格式
- 处理数据验证和错误`,

  schema: `JSON Schema 规范:
- 使用 draft-07 版本
- 完整的字段描述
- 合理的验证规则
- 清晰的数据结构`,

  wpm: `Web Package Manager (WPM) 使用规范:
- 模块导入规范:
  * 使用 await wpm.import(moduleName) 导入模块
  * 在组件或模块初始化时导入依赖
  * 处理导入失败的异常情况
  * 在使用 wpm.import 前必须确保模块已经导出
  * 检查所有导入模块的存在性

- 模块导出规范:
  * 页面模块: wpm.export('page_xxx', PageComponent)
  * Store模块: wpm.export('store_xxx', storeInstance)
  * Service模块: wpm.export('service_xxx', serviceInstance)
  * 通用模块: wpm.export('module_xxx', moduleInstance)
  * 入口模块必须使用 context.appId

- 依赖管理:
  * 避免循环依赖
  * 明确模块间的依赖关系
  * 合理组织模块层次结构
  * 按正确顺序创建和导出模块

- 错误示例:
  * ❌ 错误 - 导入未创建的模块
    const HomePage = await wpm.import('page_home'); // 如果 page_home 未导出则会失败
  
  * ✅ 正确 - 先导出再导入
    // 在 page_home.js 中
    const HomePage = () => { /* ... */ };
    wpm.export('page_home', HomePage);
    
    // 在其他文件中
    const HomePage = await wpm.import('page_home'); // 现在可以安全导入

- 依赖检查清单:
  * 检查所有 import 的模块是否已创建
  * 确认所有模块都已正确导出
  * 验证模块导入导出的顺序是否正确
  * 确保没有循环依赖
`
}