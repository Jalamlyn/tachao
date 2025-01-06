```jsx
<mo-ai-code type="module" name="module_expense">
const {
  wpm,
  React,
  ReactRouterDom,
  observer,
  NextUI,
  Icon,
  FramerMotion,
  message,
  api,
  ai,
  mobx,
  appId
} = context;

const expenseStore = await context.wpm.import('store_expense');

class ExpenseModule {
  // 处理自然语言输入
  async processNaturalLanguage(text) {
    try {
      const messages = [
        {
          role: 'system',
          content: [{
            type: 'text',
            text: `你是一个记账助手,请从用户输入中提取信息并以下列格式返回:
<mo-ai-script type="json">
{
  "amount": "数字",
  "category": "food/shopping/transport/entertainment/other 中的一个",
  "date": "YYYY-MM-DD格式的日期",
  "description": "字符串描述",
  "paymentMethod": "cash/alipay/wechat/card 中的一个"
}
</mo-ai-script>

注意事项:
1. 必须使用<mo-ai-script>标签包装返回内容
2. 不要使用\`\`\`json这样的标记
3. type属性必须指定为json
4. 返回的JSON必须符合上述格式和字段类型要求`
          }]
        },
        {
          role: 'user',
          content: text
        }
      ];

      await ai.chat(messages, {
        onResult: (result) => {
          try {
            // 使用正则表达式提取<mo-ai-script>标签中的内容
            const match = result.match(/<mo-ai-script type="json">([\s\S]*?)<\/mo-ai-script>/);
            if (!match) {
              throw new Error('Invalid response format');
            }
            const jsonContent = match[1];
            const parsedResult = JSON.parse(jsonContent);
            expenseStore.setCurrentExpense(parsedResult);
            message.success('已识别消费信息');
          } catch (e) {
            message.error('解析结果失败');
            console.error('Parse error:', e);
          }
        },
        onError: (error) => {
          message.error('处理失败');
          console.error('AI processing error:', error);
        }
      });
    } catch (error) {
      message.error('处理失败');
      console.error('Error:', error);
    }
  }

  // 处理小票图片
  async processReceiptImage(file) {
    try {
      // 转换图片为base64
      const base64Image = await this.convertToBase64(file);

      const messages = [
        {
          role: 'system',
          content: [{
            type: 'text',
            text: `你是一个票据识别助手,请从上传的小票图片中提取信息并以下列格式返回:
<mo-ai-script type="json">
{
  "amount": "数字",
  "category": "food/shopping/transport/entertainment/other 中的一个",
  "date": "YYYY-MM-DD格式的日期",
  "description": "字符串描述",
  "paymentMethod": "cash/alipay/wechat/card 中的一个"
}
</mo-ai-script>

注意事项:
1. 必须使用<mo-ai-script>标签包装返回内容
2. 不要使用\`\`\`json这样的标记
3. type属性必须指定为json
4. 返回的JSON必须符合上述格式和字段类型要求`
          }]
        },
        {
          role: 'user',
          content: '请识别这张小票的信息',
          images: [base64Image]
        }
      ];

      await ai.chat(messages, {
        onResult: (result) => {
          try {
            // 使用正则表达式提取<mo-ai-script>标签中的内容
            const match = result.match(/<mo-ai-script type="json">([\s\S]*?)<\/mo-ai-script>/);
            if (!match) {
              throw new Error('Invalid response format');
            }
            const jsonContent = match[1];
            const parsedResult = JSON.parse(jsonContent);
            expenseStore.setCurrentExpense(parsedResult);
            message.success('已识别小票信息');
          } catch (e) {
            message.error('解析结果失败');
            console.error('Parse error:', e);
          }
        },
        onError: (error) => {
          message.error('识别失败');
          console.error('AI processing error:', error);
        }
      });
    } catch (error) {
      message.error('处理失败');
      console.error('Error:', error);
    }
  }

  // 将文件转换为base64
  async convertToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }
}

const module = new ExpenseModule();
context.wpm.export('module_expense', module);
</mo-ai-code>
```
