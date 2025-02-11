export default`
    以下是处理元数据的最佳实践示例:

    0. Metadata 数据结构定义:
    \`\`\`typescript
    // Metadata 索引结构
    interface MetadataIndex {
      name: string;           // 元数据名称
      versionCode: number;    // 版本号
      createdAt: string;      // 创建时间
      updatedAt: string;      // 更新时间
      createdBy: string;      // 创建者
      updatedBy: string;      // 更新者
    }

    // Metadata 详情结构
    interface MetadataDetail extends MetadataIndex {
      value: string;          // 元数据值（JSON字符串）
    }

    // Metadata 查询结果
    interface MetadataQueryResult {
      data: MetadataDetail[];
      total: number;
      page: number;
      pageSize: number;
    }

    // Metadata 历史记录查询结果
    interface MetadataHistoryResult {
      data: MetadataDetail[];
      total: number;
    }
    \`\`\`

    1. 保存数据示例:
    \`\`\`javascript
    // 正确的方式 - 使用try-catch处理错误
    const saveUserPreferences = async (preferences) => {
      try {
        // 使用 appId 作为命名空间
        const metadataName = \`\${context.appId}_user_preferences\`;
        const metadataValue = {
          ...preferences,
          updatedAt: new Date().toISOString()
        };

        const response = await context.api.setMetadata(metadataName, metadataValue);
        // response 结构: { name: string, versionCode: number }
        
        context.message.success('保存成功');
        return response;
      } catch (error) {
        context.message.error('保存失败');
        console.error('Error saving preferences:', error);
        return null;
      }
    }
    \`\`\`

    2. 读取数据示例:
    \`\`\`javascript
    // 正确的方式 - 包含完整的错误处理
    const loadUserData = async () => {
      try {
        const metadataName = \`\${context.appId}_user_data\`;
        const result = await context.api.getMetadata([metadataName]);
        // result 结构: {
        //   data: [{
        //     name: string,
        //     versionCode: number,
        //     value: string,
        //     createdAt: string,
        //     updatedAt: string,
        //     createdBy: string,
        //     updatedBy: string
        //   }]
        // }

        if (result.data?.[0]?.value) {
          return JSON.parse(result.data[0].value);
        }
        return null;
      } catch (error) {
        context.message.error('加载失败');
        return null;
      }
    }

    // 使用索引查询示例
    const queryMetadataWithIndex = async () => {
      try {
        const result = await context.api.queryMetadataIndex({
          names: [\`\${context.appId}_user_data\`],
          page: 1,
          pageSize: 10
        });
        // result 结构: {
        //   data: [{
        //     name: string,
        //     versionCode: number,
        //     createdAt: string,
        //     updatedAt: string,
        //     createdBy: string,
        //     updatedBy: string
        //   }],
        //   total: number,
        //   page: number,
        //   pageSize: number
        // }

        return result;
      } catch (error) {
        context.message.error('查询失败');
        return null;
      }
    }

    // 根据索引获取详情示例
    const getMetadataDetail = async (name, versionCode) => {
      try {
        const result = await context.api.getMetadataByVersion({
          name,
          versionCode
        });
        // result 结构: {
        //   name: string,
        //   versionCode: number,
        //   value: string,
        //   createdAt: string,
        //   updatedAt: string,
        //   createdBy: string,
        //   updatedBy: string
        // }

        if (result?.value) {
          return {
            ...result,
            parsedValue: JSON.parse(result.value)
          };
        }
        return null;
      } catch (error) {
        context.message.error('获取详情失败');
        return null;
      }
    }


    3. 批量数据处理:

    // 正确的方式 - 批量处理多个数据
    const batchLoadData = async (keys) => {
      try {
        const prefixedKeys = keys.map(key => \`\${context.appId}_\${key}\`);
        const result = await context.api.getMetadata(prefixedKeys);
        // result 结构: {
        //   data: [{
        //     name: string,
        //     versionCode: number,
        //     value: string,
        //     createdAt: string,
        //     updatedAt: string,
        //     createdBy: string,
        //     updatedBy: string
        //   }]
        // }

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

    // 批量查询索引示例
    const batchQueryIndex = async (names, page = 1, pageSize = 10) => {
      try {
        const prefixedNames = names.map(name => \`\${context.appId}_\${name}\`);
        const result = await context.api.queryMetadataIndex({
          names: prefixedNames,
          page,
          pageSize
        });
        
        return {
          items: result.data.map(item => ({
            ...item,
            originalName: item.name.replace(\`\${context.appId}_\`, '')
          })),
          pagination: {
            total: result.total,
            page: result.page,
            pageSize: result.pageSize
          }
        };
      } catch (error) {
        context.message.error('批量查询失败');
        return {
          items: [],
          pagination: {
            total: 0,
            page,
            pageSize
          }
        };
      }
    }


    4. 历史版本查询示例:

    // 查询历史版本
    const queryHistory = async (name) => {
      try {
        const result = await context.api.queryMetadataHistory({
          names: [\`\${context.appId}_\${name}\`],
          limit: 10
        });
        // result 结构: {
        //   data: [{
        //     name: string,
        //     versionCode: number,
        //     value: string,
        //     createdAt: string,
        //     updatedAt: string,
        //     createdBy: string,
        //     updatedBy: string
        //   }],
        //   total: number
        // }

        return result.data.map(item => ({
          ...item,
          parsedValue: JSON.parse(item.value)
        }));
      } catch (error) {
        context.message.error('查询历史记录失败');
        return [];
      }
    }

    // 比较不同版本
    const compareVersions = async (name, versionCode1, versionCode2) => {
      try {
        const [version1, version2] = await Promise.all([
          context.api.getMetadataByVersion({
            name: \`\${context.appId}_\${name}\`,
            versionCode: versionCode1
          }),
          context.api.getMetadataByVersion({
            name: \`\${context.appId}_\${name}\`,
            versionCode: versionCode2
          })
        ]);

        return {
          version1: {
            ...version1,
            parsedValue: JSON.parse(version1.value)
          },
          version2: {
            ...version2,
            parsedValue: JSON.parse(version2.value)
          }
        };
      } catch (error) {
        context.message.error('版本比较失败');
        return null;
      }
    }


    5. 最佳实践说明:
    - 始终使用 try-catch 处理错误
    - 为所有操作添加适当的日志记录
    - 使用 TypeScript 接口定义数据结构
    - 正确处理 value 字段的序列化和反序列化
    - 使用 appId 作为命名空间前缀
    - 合理使用索引和详情接口
    - 批量操作时注意性能和错误处理
    - 提供用户友好的错误提示
    
    以下是获取和使用当前登录用户信息的最佳实践示例:

    1. 定义用户信息类型:
    \`\`\`typescript
    interface UserInfo {
      id: string;
      name: string;
      account: string;
      organizationId: string;
      groupId: string | null;
      phone: string;
      forOutsourcing: boolean;
      createdAt: string;
      updatedAt: string;
      createdBy: string | null;
      updatedBy: string | null;
      active: boolean;
      deleted: boolean;
    }
    \`\`\`

    2. 基本获取用户信息示例:
    \`\`\`javascript
    // 正确的方式 - 包含错误处理和类型检查
    const getCurrentUser = async () => {
      try {
        const userInfo = await context.api.getCurrentAccountInfo();
        return userInfo;
      } catch (error) {
        context.message.error('获取用户信息失败');
        context.api.log.error('获取用户信息失败', error);
        return null;
      }
    }
    \`\`\`

    3. 带缓存的用户信息获取:
    \`\`\`javascript
    // 使用内存缓存存储用户信息
    let cachedUserInfo = null;
    let cacheExpireTime = 0;
    const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

    const getCurrentUserWithCache = async () => {
      const now = Date.now();
      
      // 如果缓存有效，直接返回缓存的用户信息
      if (cachedUserInfo && now < cacheExpireTime) {
        return cachedUserInfo;
      }

      try {
        const userInfo = await context.api.getCurrentAccountInfo();
        
        // 更新缓存
        cachedUserInfo = userInfo;
        cacheExpireTime = now + CACHE_DURATION;
        
        return userInfo;
      } catch (error) {
        context.message.error('获取用户信息失败');
        context.api.log.error('获取用户信息失败', error);
        return null;
      }
    }
    \`\`\`

    4. 用户权限检查示例:
    \`\`\`javascript
    // 检查用户是否是管理员
    const isAdmin = async () => {
      try {
        const userInfo = await context.api.getCurrentAccountInfo();
        return userInfo.account === 'admin';
      } catch (error) {
        context.api.log.error('检查管理员权限失败', error);
        return false;
      }
    }

    // 检查用户所属组织
    const checkUserOrganization = async (requiredOrgId) => {
      try {
        const userInfo = await context.api.getCurrentAccountInfo();
        return userInfo.organizationId === requiredOrgId;
      } catch (error) {
        context.api.log.error('检查用户组织失败', error);
        return false;
      }
    }
    \`\`\`

    5. 用户信息初始化和更新示例:
    \`\`\`javascript
    // 在应用启动时初始化用户信息
    const initializeUserContext = async () => {
      try {
        const userInfo = await context.api.getCurrentAccountInfo();
        
        // 存储用户偏好设置
        await context.api.setMetadata(\`\${context.appId}_user_preferences\`, {
          userId: userInfo.id,
          lastLogin: new Date().toISOString(),
          preferences: {
            theme: 'light',
            language: 'zh-CN'
          }
        });

        // 记录用户登录
        context.api.log.info('用户登录成功', {
          userId: userInfo.id,
          account: userInfo.account,
          organizationId: userInfo.organizationId
        });

        return userInfo;
      } catch (error) {
        context.message.error('初始化用户信息失败');
        context.api.log.error('初始化用户信息失败', error);
        return null;
      }
    }
    \`\`\``