export const COMPONENT_PROMPTS = {
  appEntry: `3. 应用入口组件示例：

\`\`\`jsx
<mo-ai-code type="app">
// 解构所有可用的 context 依赖，即使暂时不使用也要保留，以便后续扩展
const { 
  wpm, 
  React, 
  ReactRouterDom, 
  observer, 
  appId, 
  Icon, 
  FramerMotion,
  NextUI,
  message,
  api,
  ai,
  mobx 
} = context;

const { Routes, Route, Navigate } = ReactRouterDom;

// 导入前必须确保这些页面模块已经创建并导出
const HomePage = await context.wpm.import('page_home')
const SettingsPage = await context.wpm.import('page_settings')
const NotFoundPage = await context.wpm.import('page_notFound')

// 加载状态组件
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => {
  return (
      <Routes>
        {/* 默认路由重定向 */}
        <Route 
          path="/" 
          element={<Navigate to="home" replace />} 
        />

        {/* 主页路由 */}
        <Route
          path="home"
          element={
              <HomePage />
          }
        />

        {/* 设置页路由 */}
        <Route
          path="settings"
          element={
              <SettingsPage />
          }
        />

        {/* 404路由 */}
        <Route
          path="*"
          element={
              <NotFoundPage />
          }
        />
      </Routes>
  );
};

// 重要：入口模块必须使用 context.appId 作为模块名
context.wpm.export(appId, App);
</mo-ai-code>
\`\`\``,

  pageComponent: `4. 页面组件使用 <mo-ai-code type="page" name="page_xxx" title="xxx"></mo-ai-code> 包裹：
\`\`\`jsx
<mo-ai-code type="page" name="page_xxx" title="页面标题">
// 解构所有可用的 context 依赖，即使暂时不使用也要保留，以便后续扩展
const { 
  wpm, 
  React, 
  observer, 
  Icon, 
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId 
} = context;

const { useState, useEffect } = React;

// 导入前必须确保这些模块已经创建并导出
const SubComponent = await context.wpm.import('subComponent')
const todoStore = await context.wpm.import('todoStore');
const todoService = await context.wpm.import('todoService');

const PageComponent = observer(() => {
  return (
    <div>
        <SubComponent />
    </div>
  );
});

// 重要：必须导出页面组件，否则其他模块无法导入
context.wpm.export('page_xxx', PageComponent);
</mo-ai-code>
\`\`\``,

  storeTemplate: `5. Store 代码使用 <mo-ai-code type="store" name="store_xxx"></mo-ai-code> 包裹：
\`\`\`jsx
<mo-ai-code type="store" name="store_todo">
// 解构所有可用的 context 依赖，即使暂时不使用也要保留，以便后续扩展
const { 
  wpm, 
  mobx,
  React, 
  observer, 
  Icon, 
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  api,
  ai,
  appId 
} = context;

const { makeAutoObservable } = mobx;

// 导入前必须确保 todoService 模块已经创建并导出
const todoService = await context.wpm.import('todoService');

class TodoStore {
    todos = []
    loading = false
    
    constructor() {
      makeAutoObservable(this)
    }
    
    async loadTodos() {
      this.loading = true
      try {
        const result = await todoService.getTodos()
        this.todos = result
      } finally {
        this.loading = false
      }
    }
}

const store = new TodoStore();
// 重要：必须导出 store 实例，否则其他模块无法导入
context.wpm.export('store_todo', store);
</mo-ai-code>
\`\`\``,

  serviceTemplate: `6. Service 代码使用 <mo-ai-code type="service" name="service_xxx"></mo-ai-code> 包裹：
\`\`\`jsx
<mo-ai-code type="service" name="service_todo">
// 解构所有可用的 context 依赖，即使暂时不使用也要保留，以便后续扩展
const { 
  wpm, 
  api,
  React, 
  observer, 
  Icon, 
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  ai,
  mobx,
  appId 
} = context;

const { getMetadata, setMetadata } = api;

// 导入前必须确保 todoModule 模块已经创建并导出
const todoModule = await context.wpm.import('todoModule');

const service = {
  async getTodos() {
    const result = await getMetadata(['todos']);
    return result.data;
  },
  
  async saveTodo(todo) {
    await setMetadata('todos', todo);
  }
};

// 重要：必须导出 service 实例，否则其他模块无法导入
context.wpm.export('service_todo', service);
</mo-ai-code>
\`\`\``,

  moduleTemplate: `7. Module 代码使用 <mo-ai-code type="module" name="module_xxx"></mo-ai-code> 包裰：
\`\`\`jsx
<mo-ai-code type="module" name="module_todo">
// 解构所有可用的 context 依赖，即使暂时不使用也要保留，以便后续扩展
const { 
  wpm,
  React, 
  observer, 
  Icon, 
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId 
} = context;

const module = {
  formatTodo(todo) {
    return {
      ...todo,
      createdAt: new Date(todo.createdAt).toLocaleString()
    }
  },
  
  validateTodo(todo) {
    return todo.title && todo.title.length >= 3
  }
};

// 重要：必须导出 module 实例，否则其他模块无法导入
context.wpm.export('module_todo', module);
</mo-ai-code>
\`\`\``,

  componentTemplate: `8. Component 代码使用 <mo-ai-code type="component" name="comp_xxx"></mo-ai-code> 包裹：
\`\`\`jsx
<mo-ai-code type="component" name="comp_button">
// 解构所有可用的 context 依赖，即使暂时不使用也要保留，以便后续扩展
const { 
  wpm,
  React, 
  observer, 
  Icon, 
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId 
} = context;

const { Button } = NextUI;

const CustomButton = observer(({ children, icon, ...props }) => {
  return (
    <Button 
      {...props}
      startContent={icon && <Icon icon={icon} className="w-4 h-4" />}
    >
      {children}
    </Button>
  );
});

// 重要：必须导出组件，否则其他模块无法导入
context.wpm.export('comp_button', CustomButton);
</mo-ai-code>
\`\`\``,

  utilsTemplate: `9. Utils 代码使用 <mo-ai-code type="util" name="util_xxx"></mo-ai-code> 包裹：
\`\`\`jsx
<mo-ai-code type="util" name="util_date">
// 解构所有可用的 context 依赖，即使暂时不使用也要保留，以便后续扩展
const { 
  wpm,
  React, 
  observer, 
  Icon, 
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId 
} = context;

/**
 * @description 日期工具函数集合
 * @namespace DateUtils
 */
const utils = {
  /**
   * 格式化日期
   * @param {Date|string|number} date - 要格式化的日期
   * @param {string} format - 格式模板，例如 'YYYY-MM-DD HH:mm:ss'
   * @returns {string} 格式化后的日期字符串
   */
  formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return format
      .replace('YYYY', year.toString())
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  },

  /**
   * 获取相对时间描述
   * @param {Date|string|number} date - 要计算的日期
   * @returns {string} 相对时间描述
   */
  getRelativeTime(date) {
    const now = new Date()
    const target = new Date(date)
    const diff = now.getTime() - target.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return \`\${minutes}分钟前\`
    if (hours < 24) return \`\${hours}小时前\`
    if (days < 30) return \`\${days}天前\`
    
    return this.formatDate(date)
  },

  /**
   * 判断是否为同一天
   * @param {Date|string|number} date1 - 第一个日期
   * @param {Date|string|number} date2 - 第二个日期
   * @returns {boolean} 是否为同一天
   */
  isSameDay(date1, date2) {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    )
  }
};

// 重要：必须导出工具函数，否则其他模块无法导入
context.wpm.export('util_date', utils);
</mo-ai-code>
\`\`\``,

  constantsTemplate: `10. Constants 代码使用 <mo-ai-code type="constant" name="constant_xxx"></mo-ai-code> 包裹：
\`\`\`jsx
<mo-ai-code type="constant" name="constant_app">
// 解构所有可用的 context 依赖，即使暂时不使用也要保留，以便后续扩展
const { 
  wpm,
  React, 
  observer, 
  Icon, 
  NextUI,
  ReactRouterDom,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId 
} = context;

/**
 * @description 应用全局常量配置
 * @namespace AppConstants
 */
const constants = {
  // API相关常量
  API: {
    // 接口超时时间（毫秒）
    TIMEOUT: 30000,
    
    // 响应状态码
    STATUS: {
      SUCCESS: 200,
      CREATED: 201,
      BAD_REQUEST: 400,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      SERVER_ERROR: 500
    },
    
    // 错误消息
    ERROR_MESSAGES: {
      NETWORK_ERROR: '网络连接失败，请检查网络设置',
      TIMEOUT_ERROR: '请求超时，请稍后重试',
      SERVER_ERROR: '服务器错误，请稍后重试',
      AUTH_ERROR: '认证失败，请重新登录'
    }
  },

  // 业务状态常量
  BUSINESS: {
    // 数据状态
    STATUS: {
      DRAFT: 'draft',
      PENDING: 'pending',
      ACTIVE: 'active',
      INACTIVE: 'inactive',
      ARCHIVED: 'archived'
    },
    
    // 用户角色
    ROLES: {
      ADMIN: 'admin',
      USER: 'user',
      GUEST: 'guest'
    },
    
    // 操作类型
    ACTIONS: {
      CREATE: 'create',
      UPDATE: 'update',
      DELETE: 'delete',
      PUBLISH: 'publish',
      ARCHIVE: 'archive'
    }
  },

  // UI相关常量
  UI: {
    // 主题
    THEME: {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system'
    },
    
    // 响应式断点
    BREAKPOINTS: {
      XS: 320,
      SM: 640,
      MD: 768,
      LG: 1024,
      XL: 1280,
      XXL: 1536
    },
    
    // 动画时长
    ANIMATION: {
      FAST: 200,
      NORMAL: 300,
      SLOW: 500
    },
    
    // 分页配置
    PAGINATION: {
      DEFAULT_PAGE_SIZE: 10,
      PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
    }
  },

  // 验证规则
  VALIDATION: {
    // 密码规则
    PASSWORD: {
      MIN_LENGTH: 8,
      MAX_LENGTH: 20,
      PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
      ERROR_MESSAGE: '密码必须包含大小写字母和数字，长度8-20位'
    },
    
    // 用户名规则
    USERNAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 20,
      PATTERN: /^[a-zA-Z0-9_-]{3,20}$/,
      ERROR_MESSAGE: '用户名只能包含字母、数字、下划线和连字符，长度3-20位'
    }
  }
};

// 重要：必须导出常量，否则其他模块无法导入
context.wpm.export('constant_app', constants);
</mo-ai-code>
\`\`\``,

  markdownTemplate: `11. Markdown 文档使用 <mo-ai-code type="markdown" name="markdown_xxx"></mo-ai-code> 包裹：
\`\`\`markdown
<mo-ai-code type="markdown" name="markdown_docs" title="文档标题">
# 标题

这是一个 Markdown 文档示例。Markdown 类型的代码块:
- 不会被编译
- 直接作为纯文本存储
- 适合存储文档、说明、注释等

## 使用场景

1. 项目文档
2. API 说明
3. 使用指南
4. 开发规范
5. 更新日志

## 格式说明

支持所有标准的 Markdown 语法:
- 标题 (#)
- 列表 (- 或 1.)
- 链接 [文本](URL)
- 图片 ![描述](URL)
- 代码块 (\`\`\`)
- 表格
- 等等...

## 最佳实践

1. 使用有意义的 name 属性
2. 添加清晰的 title 属性
3. 保持文档结构清晰
4. 适当使用格式化
5. 定期更新维护

## 示例代码

\`\`\`javascript
// 这里可以包含代码示例
function example() {
  console.log('这是一个示例');
}
\`\`\`

## 注意事项

1. markdown 类型不会被编译和执行
2. 主要用于存储和展示文档内容
3. 可以与其他类型的模块配合使用
4. 支持完整的 Markdown 语法
</mo-ai-code>
\`\`\``,

  componentRules: `12. 技术要求：
   - 入口模块(type="app")必须使用 context.appId 作为模块名
   - 非组件模块使用 await context.wpm.import 直接导入
   - 只能使用 NextUI 2.6.0 版本中实际存在的组件
   - 禁止使用 Container Grid Text 这些 NextUI V1 版本中的组件
   - 使用 tailwind css 编写样式代码
   - 动画使用 FramerMotion
   - 图标使用 @iconify/react 的 Icon 组件, 从 context 中获取
   - 数据存储使用 getMetadata 和 setMetadata
   - Store 必须使用 MobX
   - Service 必须使用 appId 前缀
   - Module 只能包含纯函数
   - Component 必须使用 comp_ 前缀
   - Component 应该是独立可复用的
   - Component 不应包含业务逻辑
   - Component 通过 props 接收数据和回调
   - 使用 context.wpm.export 导出自定义模块
   - 使用 context.wpm.import 导入自定义模块,不能导入三方模块
   - 所有依赖都从 context 中获取, 不允许直接引入
   - observer 可以包裹初 type=app 以外的组件, 避免不必要的渲染
   - 避免循环依赖
   - 在使用 context.wpm.import 前必须确保模块已经导出
   - 检查所有导入模块的存在性
   - 按正确顺序创建和导出模块
   - 导航组件只能用 ReactRouterDom 的组件,比如 Link, NavLink 等
   - 必须在每个模块开头解构所有 context 依赖，即使暂时不使用也要保留，以便后续扩展
   - NextUI Button 使用 onPress 代替 onClick
   - markdown 类型的模块不会被编译和执行，直接存储原始内容`,
}