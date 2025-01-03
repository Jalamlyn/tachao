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

const expenseStore = await wpm.import('store_expense');

class ExpenseModule {
  // 处理自然语言输入
  async processNaturalLanguage(text) {
    try {
      const messages = [
        {
          role: 'system',
          content: `你是一个记账助手,请从用户输入中提取以下信息:
            - 金额(amount)
            - 类别(category): 可选值 food/shopping/transport/entertainment/other
            - 日期(date): YYYY-MM-DD格式
            - 描述(description)
            - 支付方式(paymentMethod): 可选值 cash/alipay/wechat/card
            请以JSON格式返回结果`
        },
        {
          role: 'user',
          content: text
        }
      ];

      await ai.chat(messages, {
        onResult: (result) => {
          try {
            const parsedResult = JSON.parse(result);
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
          content: `你是一个票据识别助手,请从上传的小票图片中提取以下信息:
            - 金额(amount)
            - 类别(category): 可选值 food/shopping/transport/entertainment/other
            - 日期(date): YYYY-MM-DD格式
            - 商家信息(description)
            - 支付方式(paymentMethod): 可选值 cash/alipay/wechat/card
            请以JSON格式返回结果`
        },
        {
          role: 'user',
          content: [
            {
              type: 'image',
              data: base64Image
            },
            {
              type: 'text',
              data: '请识别这张小票的信息'
            }
          ]
        }
      ];

      await ai.chat(messages, {
        onResult: (result) => {
          try {
            const parsedResult = JSON.parse(result);
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
wpm.export('module_expense', module);
</mo-ai-code>
```