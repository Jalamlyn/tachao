import nextui_checkout_complete from "./nextui/nextui_checkout_complete"
import nextui_table_with_filters from "./nextui/nextui_table_with_filters"

export const EXPERIENCE_PROMPTS = {
  // API 使用最佳实践
  apiExperience: {
    // 元数据API示例
    metadata: `
    以下是处理元数据的最佳实践示例:
    
    1. 保存数据示例:
    \`\`\`javascript
    // 正确的方式 - 使用try-catch处理错误
    const saveUserPreferences = async (preferences) => {
      try {
        // 使用 appId 作为命名空间
        await context.api.setMetadata(\`\${context.appId}_user_preferences\`, {
          ...preferences,
          updatedAt: new Date().toISOString()
        });
        context.message.success('保存成功');
      } catch (error) {
        context.message.error('保存失败');
        console.error('Error saving preferences:', error);
      }
    }
    \`\`\`

    2. 读取数据示例:
    \`\`\`javascript
    // 正确的方式 - 包含完整的错误处理
    const loadUserData = async () => {
      try {
        const result = await context.api.getMetadata([\`\${context.appId}_user_data\`]);
        if (result.data?.[0]?.value) {
          return JSON.parse(result.data[0].value);
        }
        return null;
      } catch (error) {
        context.message.error('加载失败');
        return null;
      }
    }
    \`\`\`

    3. 批量数据处理:
    \`\`\`javascript
    // 正确的方式 - 批量处理多个数据
    const batchLoadData = async (keys) => {
      try {
        const prefixedKeys = keys.map(key => \`\${context.appId}_\${key}\`);
        const result = await context.api.getMetadata(prefixedKeys);
        return result.data.reduce((acc, item) => {
          if (item?.value) {
            acc[item.name.replace(\`\${context.appId}_\`, '')] = JSON.parse(item.value);
          }
          return acc;
        }, {});
      } catch (error) {
        context.message.error('批量加载失败');
        return {};
      }
    }
    \`\`\`
    `,

    // AI API示例
    aiApi: `
    以下是使用AI能力的最佳实践:

    1. 基础使用(非流式):
    \`\`\`javascript
    try {
      await context.ai.chat([
        { role: 'user', content: '你好,请介绍一下自己' }
      ], {
        onResult: (result) => {
          console.log('完整结果:', result);
        },
        onError: (error) => {
          context.message.error('AI处理失败');
          console.error('错误:', error);
        }
      });
    } catch (error) {
      // 处理错误
      console.error('Chat failed:', error);
    }
    \`\`\`

    2. 流式处理:
    \`\`\`javascript
    try {
      let content = '';
      await context.ai.chat([
        { role: 'user', content: '请生成一段代码' }
      ], {
        onChunk: (chunk) => {
          // 处理每个文本块
          content += chunk;
          // 实时更新UI
          updateUI(content);
        },
        onResult: (fullText) => {
          // 处理完整结果
          console.log('生成完成:', fullText);
        },
        onError: (error) => {
          context.message.error('生成失败');
          console.error('错误:', error);
        }
      });
    } catch (error) {
      // 处理错误
      console.error('Stream chat failed:', error);
    }
    \`\`\`

    3. 会话管理:
    \`\`\`javascript
    const chatManager = {
      messages: [],
      
      async sendMessage(content) {
        try {
          // 添加用户消息
          this.messages.push({
            role: 'user',
            content
          });
          
          let response = '';
          await context.ai.chat(
            this.messages,
            {
              onChunk: (chunk) => {
                response += chunk;
                // 实时更新UI
                updateUI(response);
              },
              onResult: (fullResponse) => {
                // 添加AI响应到消息历史
                this.messages.push({
                  role: 'assistant',
                  content: fullResponse
                });
                // 更新完整响应
                updateFullResponse(fullResponse);
              },
              onError: (error) => {
                context.message.error('发送消息失败');
                console.error('Chat error:', error);
              }
            }
          );
        } catch (error) {
          context.message.error('发送消息失败');
          throw error;
        }
      },
      
      clearHistory() {
        this.messages = [];
      }
    }
    \`\`\`
    `,
  },
  uiExperience: {
    nextui_checkout_complete,
    nextui_table_with_filters,
  },
}

export default EXPERIENCE_PROMPTS
