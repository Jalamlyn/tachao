export default {
  resourcePrompt: {
    async getResourcePrompt(resources) {
      try {
        const resourceDescription = resources
          .map((resource) => {
            const { id, title, indexFields } = resource
            const structure = indexFields.rawData || indexFields.rowData || {}

            return `
资源ID: ${id}
资源标题: ${title}
数据结构:
${JSON.stringify(structure)}`
          })
          .join("\n\n")

        return `
系统中存在以下业务数据资源，你可以参考这些信息来理解用户的业务场景：

${resourceDescription}

数据获取方法：
1. 使用 getMetadata 方法获取详细数据：
   const result = await getMetadata([resourceId])
   const resourceData = result.data[0]

2. 返回的数据结构示例：
{
  "id": "资源ID",
  "type": "resource",
  "title": "资源标题",
  "status": "active",
  "data": [  // 这是资源的具体数据数组，包含所有记录
    {
      "字段1": "值1",
      "字段2": "值2",
      "dataid": "记录唯一标识"
    },
    // ... 更多记录
  ],
  "versionCode": "版本号",
  "modifiedBy": "修改人",
  "createdAt": "创建时间",
  "updatedAt": "更新时间",
  "indexFields": {  // 索引字段，通常包含第一条记录的数据
    "type": "excel",
    "size": "文件大小",
    "fileName": "文件名",
    "rowData": {  // 第一行数据
      "字段1": "值1",
      "字段2": "值2",
      "dataid": "记录唯一标识"
    },
    "createdAt": "创建时间",
    "updatedAt": "更新时间"
  }
}

使用说明：
1. 这些是用户系统中的主要数据表格
2. 每个资源都可以通过 getMetadata 获取详细数据
3. data 数组包含表格的所有记录
4. indexFields 包含表格的基本信息和第一条记录
5. dataid 字段是每条记录的唯一标识

注意事项：
1. 在生成代码时，应该使用 try-catch 处理数据获取可能的错误
2. 数据获取是异步操作，需要使用 async/await
3. 获取数据后应该进行数据有效性验证
4. 在展示数据时要考虑数据可能为空的情况
5. 可以使用 indexFields 中的结构来了解表格的字段定义

示例用法：

// 获取特定资源的详细数据
async function getResourceDetails(resourceId) {
  try {
    const result = await getMetadata([resourceId])
    const resourceData = JSON.parse(result.data?.[0]?.value)
    
    // 获取所有记录
    const records = resourceData.data
    
    // 获取表格结构
    const structure = resourceData.indexFields.rowData
    
    return {
      records,
      structure
    }
  } catch (error) {
    console.error('Failed to get resource details:', error)
    throw error
  }
}

当用户询问特定资源的信息时，你可以：
1. 使用资源ID通过 getMetadata 获取详细数据
2. 从返回的数据中获取需要的信息
3. 根据数据结构生成相应的代码或回答
4. 注意处理异常情况和数据验证`
      } catch (error) {
        console.error("Failed to get resource prompt:", error)
        return ""
      }
    },
  },
}
