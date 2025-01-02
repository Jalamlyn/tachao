export const ENV_PROMPTS = {
  preview: `8. 环境说明：
   - 应用运行在预览环境中
   - 基础路径为 /app-preview/{appId}
   - 所有路由路径都是相对于应用根路径的
   - 路由路径始终使用相对路径（不要以"/"开头）
   - 系统会自动处理基础路径的拼接`,

  routing: `路由环境配置:
- 使用相对路径
- 自动处理基础路径
- 支持路由嵌套
- 处理404路由`,

  basePath: `基础路径说明:
- 预览环境: /app-preview/{appId}
- 运行环境: /app-run/{appId}
- 自动处理路径拼接
- 保持路径一致性`
}