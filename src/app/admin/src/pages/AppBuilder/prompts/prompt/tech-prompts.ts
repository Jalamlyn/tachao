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

  wpm: `Web Package Manager (WPM) 使用规范:
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

- 依赖检查清单:
  * 检查所有 import 的模块是否已创建
  * 确认所有模块都已正确导出
  * 验证模块导入导出的顺序是否正确
  * 确保没有循环依赖
`,

  reactHookForm: `React Hook Form 表单处理规范:
1. 基本规则：
   - 必须从 context 中解构 ReactHookForm
   - 使用 useForm hook 初始化表单
   - 使用 register 方法注册表单字段
   - 使用 handleSubmit 处理表单提交
   - 使用 formState 访问表单状态

2. 表单验证：
   - 使用 register 的第二个参数定义验证规则
   - 使用 formState.errors 处理错误
   - 实现实时验证反馈
   - 支持自定义验证规则

3. 使用示例：
\`\`\`jsx
const { 
  React, 
  NextUI, 
  ReactHookForm 
} = context;

const { Input, Button } = NextUI;
const { useForm } = ReactHookForm;

const FormComponent = () => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      username: '',
      email: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      // 处理表单提交
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <Input
        label="用户名"
        {...register('username', {
          required: '用户名是必填的',
          minLength: {
            value: 3,
            message: '用户名至少3个字符'
          }
        })}
        isInvalid={!!errors.username}
        errorMessage={errors.username?.message}
      />

      <Input
        label="邮箱"
        {...register('email', {
          required: '邮箱是必填的',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: '请输入有效的邮箱地址'
          }
        })}
        isInvalid={!!errors.email}
        errorMessage={errors.email?.message}
      />

      <Button
        type="submit"
        color="primary"
        isLoading={isSubmitting}
      >
        提交
      </Button>
    </form>
  );
};
\`\`\`

4. 最佳实践：
   - 使用 defaultValues 设置初始值
   - 实现表单验证和错误提示
   - 处理表单提交状态
   - 使用 watch 监听字段变化
   - 实现表单重置功能
   - 处理异步验证
   - 支持动态表单字段

5. 性能优化：
   - 使用 shouldUnregister 控制字段注销
   - 合理使用 mode 配置验证时机
   - 避免不必要的重渲染
   - 使用 useFormContext 共享表单状态

6. 错误处理：
   - 显示字段级错误信息
   - 处理表单级错误
   - 支持服务端验证
   - 提供清晰的错误提示

7. 高级功能：
   - 支持文件上传
   - 实现多步骤表单
   - 处理动态表单数组
   - 集成自定义验证规则
   - 实现表单状态持久化

8. 注意事项：
   - 禁止直接操作 DOM
   - 正确处理表单重置
   - 处理表单提交防抖
   - 实现适当的错误边界
   - 保持表单状态一致性`
}