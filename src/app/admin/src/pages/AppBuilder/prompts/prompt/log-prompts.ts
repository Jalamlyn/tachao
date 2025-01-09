export const LOG_PROMPTS = {
  logPrompt: `
系统提供了以下日志工具API，你可以用它来进行问题排查和日志记录：

1. 日志工具API说明：
api.log = {
  // 记录信息级别日志
  info: (message: string, details?: any) => void,
  
  // 记录警告级别日志
  warn: (message: string, details?: any) => void,
  
  // 记录错误级别日志
  error: (message: string, details?: any) => void,
  
  // 记录调试级别日志
  debug: (message: string, details?: any) => void,
  
  // 清除所有日志
  clear: () => void
}

2. 使用示例：

\`\`\`jsx
const { React, NextUI, api } = context;

const MyComponent = () => {
  const handleOperation = async () => {
    try {
      api.log.info("开始执行操作");
      
      // 记录带详细信息的日志
      api.log.debug("检查参数", {
        param1: "value1",
        param2: "value2"
      });
      
      // 执行某些操作...
      
      api.log.info("操作执行成功");
    } catch (error) {
      api.log.error("操作执行失败", {
        error: error.message,
        stack: error.stack
      });
    }
  };
  
  return (
    <Button onPress={handleOperation}>
      执行操作
    </Button>
  );
};
\`\`\`

3. 问题排查最佳实践：
- 使用不同日志级别
  * info: 常规信息
  * warn: 警告信息
  * error: 错误信息
  * debug: 调试信息

- 记录关键节点
  * 操作开始和结束
  * 重要函数调用
  * 状态变更
  * 错误发生

- 包含上下文信息
  * 参数值
  * 状态数据
  * 错误详情
  * 时间戳

- 日志内容规范
  * 清晰描述事件
  * 包含必要的上下文
  * 避免敏感信息
  * 保持简洁明了

4. 常见使用场景：
- 功能调试
- 错误追踪
- 性能分析
- 用户行为跟踪
- 状态变更记录

5. 注意事项：
- 避免记录敏感信息
- 合理使用日志级别
- 保持日志信息简洁
- 及时清理不需要的日志

6. 问题排查流程：
1) 收集信息
   - 记录用户操作步骤
   - 记录系统状态
   - 记录错误信息

2) 分析问题
   - 查看错误日志
   - 检查状态变化
   - 分析调用链路

3) 定位原因
   - 复现问题
   - 分析日志
   - 确定根因

4) 验证解决
   - 实施修复
   - 验证结果
   - 记录解决方案

7. 日志最佳实践：
\`\`\`jsx
// 1. 记录操作开始
api.log.info("开始处理用户请求", {
  userId: "123",
  action: "submit"
});

// 2. 记录关键步骤
api.log.debug("验证用户输入", {
  formData: {
    name: "John",
    age: 25
  }
});

// 3. 记录警告信息
api.log.warn("用户输入数据不完整", {
  missing: ["email", "phone"]
});

// 4. 记录错误信息
api.log.error("保存数据失败", {
  error: "Database connection failed",
  retry: 3
});

// 5. 记录操作结果
api.log.info("请求处理完成", {
  duration: "2.5s",
  status: "success"
});
\`\`\`

8. 性能考虑：
- 避免过多日志
- 适时清理日志
- 控制日志大小
- 优化日志内容

9. 安全建议：
- 不记录密码
- 不记录令牌
- 脱敏个人信息
- 控制访问权限`,
}