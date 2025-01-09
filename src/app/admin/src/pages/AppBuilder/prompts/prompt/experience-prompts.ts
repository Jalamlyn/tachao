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

    4. 删除数据示例:
    \`\`\`javascript
    // 正确的方式 - 删除指定版本的数据
    const deleteOldVersion = async (name, versionCode) => {
      try {
        await context.api.deleteMetadata({
          name: \`\${context.appId}_\${name}\`,
          versionCode
        });
        context.message.success('删除成功');
        
        // 记录删除操作
        context.api.log.info('删除旧版本数据', {
          name,
          versionCode
        });
      } catch (error) {
        context.message.error('删除失败');
        context.api.log.error('删除数据失败', {
          name,
          versionCode,
          error: error.message
        });
      }
    }

    // 数据版本清理示例
    const cleanupOldVersions = async (name, keepLatest = 5) => {
      try {
        // 获取历史记录
        const history = await context.api.queryMetadataHistory({
          names: [\`\${context.appId}_\${name}\`],
          limit: 100 // 获取足够多的历史记录
        });

        // 按版本号排序
        const versions = history.data
          .sort((a, b) => b.versionCode - a.versionCode)
          .slice(keepLatest); // 保留最新的几个版本

        // 删除旧版本
        for (const version of versions) {
          await context.api.deleteMetadata({
            name: version.name,
            versionCode: version.versionCode
          });
        }

        context.message.success(\`清理完成，保留最新的\${keepLatest}个版本\`);
        
        // 记录清理操作
        context.api.log.info('清理旧版本数据', {
          name,
          keepLatest,
          deletedCount: versions.length
        });
      } catch (error) {
        context.message.error('清理失败');
        context.api.log.error('清理旧版本失败', {
          name,
          keepLatest,
          error: error.message
        });
      }
    }
    \`\`\`

    5. 最佳实践说明:
    - 始终使用 try-catch 处理错误
    - 为所有操作添加适当的日志记录
    - 使用 appId 作为命名空间前缀
    - 定期清理旧版本数据
    - 保持合理的版本数量
    - 在删除前进行确认
    - 提供用户友好的反馈
    `,
  },
  
}

export default EXPERIENCE_PROMPTS