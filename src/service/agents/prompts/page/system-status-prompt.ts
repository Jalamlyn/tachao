import { getMetadata } from "@/service/apis/metadata"

export interface SystemStatus {
  apps: Array<{
    id: string
    title: string
    pages: Array<{
      id: string
      title: string
      isHome: boolean
    }>
  }>
  forms: Array<{
    id: string
    title: string
  }>
  reports: Array<{
    id: string
    title: string
  }>
}

export async function getSystemStatus(): Promise<SystemStatus> {
  try {
    // 获取所有索引数据
    const [appIndexResult, formIndexResult, reportIndexResult] = await Promise.all([
      getMetadata(["app_index"]),
      getMetadata(["template_index"]),
      getMetadata(["report_index"]),
    ])

    // 解析数据
    const apps = appIndexResult.data?.[0]?.value ? JSON.parse(appIndexResult.data[0].value) : []
    const forms = formIndexResult.data?.[0]?.value ? JSON.parse(formIndexResult.data[0].value) : []
    const reports = reportIndexResult.data?.[0]?.value ? JSON.parse(reportIndexResult.data[0].value) : []

    return { apps, forms, reports }
  } catch (error) {
    console.error("Error getting system status:", error)
    return { apps: [], forms: [], reports: [] }
  }
}

export function generateSystemStatusPrompt(status: SystemStatus): string {
  debugger
  return `
系统当前状态：

1. 应用列表：
${status.apps
  .map(
    (app) => `
- 应用：${app.title} (ID: ${app.id})
  页面列表：
  ${(app.pages || [])
    .map(
      (page) => `
    - ${page.title || "未命名页面"} (ID: ${page.id})
    - 类型：${page.isHome ? "首页" : "普通页面"}
  `
    )
    .join("\n")}`
  )
  .join("\n")}

2. 全局资源：
- 表单列表：
${status.forms
  .map(
    (form) => `
  - ${form.title} (ID: ${form.id})`
  )
  .join("\n")}

- 报表列表：
${status.reports
  .map(
    (report) => `
  - ${report.title} (ID: ${report.id})`
  )
  .join("\n")}

可用的渲染组件：

1. 页面渲染：
   const {PageRenderer} = context
   使用方法：<PageRenderer pageId="page_id" />
   
2. 表单渲染：
   const {FormRenderer} = context
   使用方法：<FormRenderer formId="form_id" />
   
3. 报表渲染：
   const {ReportRenderer} = context
   使用方法：<ReportRenderer reportId="report_id" />

页面导航：
1. 应用内导航：
   const navigate = useNavigate()
   navigate(\`/apps/\${appId}/pages/\${pageId}\`)

2. 应用间跳转：
   navigate(\`/apps/\${targetAppId}\`)

3. 新窗口打开：
   window.open(\`/apps/\${appId}/pages/\${pageId}\`, '_blank')

注意事项：
1. 每个应用都有自己的页面集合
2. 表单和报表是全局资源，可以在任何应用中使用
3. 跨应用跳转时注意权限控制
4. 建议使用新窗口打开其他应用的页面
5. 使用 PermissionCheck 组件进行权限控制
`
}
