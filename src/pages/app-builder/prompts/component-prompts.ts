export const COMPONENT_PROMPTS = {
  appEntry: `3. 应用入口组件示例：

\`\`\`jsx
<shata-ai-code type="app">
export default (props) => {
  const {React,NextUI,ReactRouterDom,FramerMotion,Icon,message,api: { getMetadata, setMetadata },FormRenderer,ReportRenderer,PageWrapper} = context
  const {Routes, Route, Navigate, BrowserRouter} = ReactRouterDom
  const {Card, CardBody, CardHeader} = NextUI
  const {motion} = FramerMotion

  return (
    <BrowserRouter basename={props.basename}>
      <Routes>
        <Route path="/" element={<Navigate to="home" replace />} />
        <Route path="home" element={<PageWrapper pageId="page_home" />} />
        <Route path="*" element={<div>页面不存在</div>} />
      </Routes>
    </BrowserRouter>
  )
}
</shata-ai-code>
\`\`\``,

  pageComponent: `4. 页面组件使用 <shata-ai-code type="page" pageid="xxx" title="xxx"></shata-ai-code> 包裹：
\`\`\`jsx
<shata-ai-code type="page" pageid="page_xxx" title="页面标题">
export default (props) => {
  const {React, NextUI} = context
  return (
    <div>页面内容</div>
  )
}
</shata-ai-code>
\`\`\``,

  storeTemplate: `5. Store 代码使用 <shata-ai-code type="store" name="xxx"></shata-ai-code> 包裹：
\`\`\`jsx
<shata-ai-code type="store" name="todoStore">
export default (context) => {
  const { makeAutoObservable } = context.mobx
  
  return class TodoStore {
    todos = []
    loading = false
    
    constructor() {
      makeAutoObservable(this)
    }
    
    async loadTodos() {
      this.loading = true
      try {
        const result = await context.services.todo.getTodos()
        this.todos = result
      } finally {
        this.loading = false
      }
    }
    
    async addTodo(todo) {
      await context.services.todo.saveTodo(todo)
      await this.loadTodos()
    }
  }
}
</shata-ai-code>
\`\`\``,

  serviceTemplate: `6. Service 代码使用 <shata-ai-code type="service" name="xxx"></shata-ai-code> 包裹：
\`\`\`jsx
<shata-ai-code type="service" name="todoService">
export default (context) => {
  const { getMetadata, setMetadata, getPublicMetadata } = context.api
  const { appId } = context
  
  // 生成带 appId 前缀的 key
  const getKey = (key) => \`\${appId}_\${key}\`
  
  return {
    async getTodos() {
      const result = await getMetadata([getKey('todos')])
      return JSON.parse(result.data?.[0]?.value || '[]')
    },
    
    async getPublicTodos() {
      const result = await getPublicMetadata([getKey('public_todos')], appId)
      return JSON.parse(result.data?.[0]?.value || '[]')
    },
    
    async saveTodo(todo, isPublic = false) {
      const key = getKey(isPublic ? 'public_todos' : 'todos')
      const todos = await (isPublic ? this.getPublicTodos() : this.getTodos())
      todos.push({
        ...todo,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      await setMetadata(key, JSON.stringify(todos), appId)
    }
  }
}
</shata-ai-code>
\`\`\``,

  moduleTemplate: `7. Module 代码使用 <shata-ai-code type="module" name="xxx"></shata-ai-code> 包裹：
\`\`\`jsx
<shata-ai-code type="module" name="todoModule">
export default (context) => {
  return {
    formatTodo(todo) {
      return {
        ...todo,
        createdAt: new Date(todo.createdAt).toLocaleString()
      }
    },
    
    validateTodo(todo) {
      return todo.title && todo.title.length >= 3
    },
    
    sortTodos(todos, order = 'desc') {
      return [...todos].sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime()
        const timeB = new Date(b.createdAt).getTime()
        return order === 'desc' ? timeB - timeA : timeA - timeB
      })
    }
  }
}
</shata-ai-code>
\`\`\``,

  schemaTemplate: `8. Schema 代码使用 <shata-ai-code type="schema" name="xxx"></shata-ai-code> 包裹：
\`\`\`jsx
<shata-ai-code type="schema" name="todoSchema">
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Todo Schema",
  "description": "Todo item data structure",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier"
    },
    "title": {
      "type": "string",
      "description": "Todo title",
      "minLength": 1,
      "maxLength": 100
    },
    "completed": {
      "type": "boolean",
      "default": false
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "priority": {
      "type": "integer",
      "minimum": 1,
      "maximum": 5,
      "default": 3
    }
  },
  "required": ["id", "title", "createdAt"]
}
</shata-ai-code>
\`\`\``,

  componentRules: `9. 技术要求：
   - 只能使用 NextUI 2.6.0 版本中实际存在的组件
   - 禁止使用 Container Grid Text 这些 NextUI V1 版本中的组件
   - 使用 tailwind css 编写样式代码
   - 动画使用 FramerMotion
   - 图标使用 @iconify/react 的 Icon 组件
   - 数据存储使用 getMetadata 和 setMetadata
   - Store 必须使用 MobX
   - Service 必须使用 appId 前缀
   - Module 只能包含纯函数
   - Schema 使用标准的 JSON Schema`
}