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
- 模块导出规范:
  * 使用 wpm.export(moduleName, moduleInstance) 导出模块
  * 模块名称要清晰且唯一
  * 在模块初始化完成后立即导出

- 模块导入规范:
  * 使用 await wpm.import(moduleName) 导入模块
  * 在组件或模块初始化时导入依赖
  * 处理导入失败的异常情况

- 依赖管理:
  * 避免循环依赖
  * 明确模块间的依赖关系
  * 合理组织模块层次结构

- 最佳实践:
  * 模块导入导出使用异步函数
  * 模块名称使用驼峰命名
  * 导入的模块优先在组件顶层声明
  * 避免运行时动态导入导出`
}