export const ROUTER_PROMPTS = {
  routingSystem: `现在支持完整的 React Router 路由系统
   - 使用 Routes 和 Route 组件进行路由配置
   - 禁止使用 useRoutes 钩子
   - 实现路由嵌套和布局`,

  routingRules: `6. 路由规范：
   - 使用相对路径（不要以"/"开头）
   - 必须包含默认路由重定向
   - 每个页面都必须配置路由
   - 必须处理 404 路由
   - 路由路径必须使用小写字母
   - 路由参数使用 kebab-case 命名`,

  navigationSystem: `7. 页面导航：
   - 使用 useNavigate 进行编程式导航
   - 使用 Link 组件进行声明式导航
   - 支持路由参数传递
   - 处理导航状态和加载`
}