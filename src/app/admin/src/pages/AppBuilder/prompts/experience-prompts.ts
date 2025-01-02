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

    4. 数据版本控制:
    \`\`\`javascript
    // 正确的方式 - 实现数据版本控制
    const saveVersionedData = async (data) => {
      try {
        const timestamp = Date.now();
        await context.api.setMetadata(\`\${context.appId}_data_\${timestamp}\`, {
          data,
          version: timestamp,
          createdAt: new Date().toISOString()
        });
        return timestamp;
      } catch (error) {
        context.message.error('版本保存失败');
        throw error;
      }
    }
    \`\`\`
    `,

    // AI API示例
    aiApi: `
    以下是使用AI能力的最佳实践:

    1. 流式输出处理:
    \`\`\`javascript
    const handleStream = async (messages, onChunk) => {
      const abortController = new AbortController();
      
      try {
        let accumulatedText = '';
        
        const handleChunk = (chunk) => {
          accumulatedText += chunk;
          onChunk?.(chunk);
        };

        await context.ai.chat(
          messages,
          handleChunk,
          () => abortController.abort(),
          true // 使用流式输出
        );

        return accumulatedText;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Stream aborted');
        }
        throw error;
      }
    }
    \`\`\`

    2. 图片分析处理:
    \`\`\`javascript
    const analyzeImage = async (base64Image) => {
      try {
        const response = await context.ai.process({
          text: "分析这张图片的内容",
          images: [base64Image],
          temperature: 0.7
        });
        return response;
      } catch (error) {
        context.message.error('图片分析失败');
        throw error;
      }
    }
    \`\`\`

    3. 多模态输入处理:
    \`\`\`javascript
    const handleMultiModal = async (text, images) => {
      try {
        const response = await context.ai.process({
          text,
          images: images.map(img => ({
            type: 'image_url',
            image_url: {
              url: img,
              detail: 'high'
            }
          })),
          temperature: 0.7
        });
        return response;
      } catch (error) {
        context.message.error('处理失败');
        throw error;
      }
    }
    \`\`\`

    4. AI 会话管理:
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
            (chunk) => {
              response += chunk;
            },
            () => {},
            true
          );
          
          // 添加AI响应
          this.messages.push({
            role: 'assistant',
            content: response
          });
          
          return response;
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
    `
  }
};

export default EXPERIENCE_PROMPTS;