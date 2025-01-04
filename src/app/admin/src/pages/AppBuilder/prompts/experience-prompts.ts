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
  },
  
}

export default EXPERIENCE_PROMPTS
