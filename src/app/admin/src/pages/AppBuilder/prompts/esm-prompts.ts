export const ESM_PROMPTS = {
  esmPrompt: `
系统提供了 ESM 动态导入功能，可以在运行时动态导入 npm 包，具体说明如下：

1. ESM 导入说明：
context.esm 是一个 tagged template literal 函数，用于动态导入 npm 包：
- 支持指定版本号
- 支持导入特定导出
- 返回 Promise，需要使用 await

2. 使用示例：

\`\`\`jsx
const { React, NextUI, esm } = context;

// 示例1: 导入完整包
const lodash = await context.esm\`
  import * as _ from "npm:lodash@4.17.21";
  export default _;
\`;

// 示例2: 导入特定函数
const { format } = await context.esm\`
  import { format } from "npm:date-fns@2.30.0";
  export { format };
\`;

// 示例3: 导入多个包
const { marked, DOMPurify } = await context.esm\`
  import { marked } from "npm:marked@9.1.2";
  import DOMPurify from "npm:dompurify@3.0.6";
  export { marked, DOMPurify };
\`;

// 在组件中使用
const MyComponent = () => {
  const [html, setHtml] = React.useState("");
  
  React.useEffect(() => {
    const markdown = "# Hello World";
    // 使用导入的包
    const dirty = marked(markdown);
    const clean = DOMPurify.sanitize(dirty);
    setHtml(clean);
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};
\`\`\`

3. 注意事项：
- ESM 导入是异步的，需要使用 await
- 建议指定具体的版本号避免不兼容
- 导入语句必须使用 ES 模块语法
- 必须显式声明导出内容
- 包名前需要加 npm: 前缀

4. 常见使用场景：
- 数据处理工具库(lodash, ramda)
- 日期处理(date-fns, dayjs)
- 文本处理(marked, showdown)
- 数学计算(mathjs)
- 数据验证(yup, zod)
- 工具函数库(utility-types)

5. 性能优化：
- 按需导入，只导入需要的函数
- 缓存导入结果避免重复加载
- 合理使用动态导入时机

6. 最佳实践：
- 在组件外提前导入依赖
- 使用 try-catch 处理导入错误
- 提供加载状态反馈
- 合理处理降级方案
`,
}