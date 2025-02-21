import { message } from "./Message"

/**
 * 创建单条元数据
 */
export const createCloudMetadata = async (
  name: string,
  value: any,
  wyyyID: string,
  options: CloudMetadataOptions = {}
) => {
  const { envType = "pre", onError } = options

  try {
    const { data } = await window.mo_app.models.metadata.create({
      data: {
        wyyyID,
        key: name,
        data: typeof value === "string" ? value : JSON.stringify(value),
      },
      
    })
    return { id: data.id }
  } catch (error) {
    console.error("Error creating metadata:", error)
    onError?.(error)
    throw error
  }
}

/**
 * 批量创建元数据
 */
export const createCloudMetadataBatch = async (
  data: Array<{ name: string; value: any }>,
  wyyyID: string,
  options: CloudMetadataOptions = {}
) => {
  const { envType = "pre", onError } = options

  try {
    const createData = data.map((item) => ({
      wyyyID,
      key: item.name,
      data: typeof item.value === "string" ? item.value : JSON.stringify(item.value),
    }))

    const { data: result } = await window.mo_app.models.metadata.createMany({
      data: createData,
      
    })

    return { idList: result.idList }
  } catch (error) {
    console.error("Error batch creating metadata:", error)
    onError?.(error)
    throw error
  }
}

/**
 * 获取单条元数据
 */
export const getCloudMetadataOne = async (key: string, wyyyID: string, options: CloudMetadataOptions = {}) => {
  const { envType = "pre", onError } = options

  try {
    const { data } = await window.mo_app.models.metadata.get({
      filter: {
        where: {
          $and: [{ wyyyID: { $eq: wyyyID } }, { key: { $eq: key } }],
        },
      },
      
    })

    return data
  } catch (error) {
    console.error("Error getting single metadata:", error)
    onError?.(error)
    throw error
  }
}

/**
 * 获取元数据列表
 */
export const getCloudMetadata = async (
  name: string,
  wyyyID: string,
  options: CloudMetadataOptions & {
    pageSize?: number
    pageNumber?: number
    getCount?: boolean
  } = {}
) => {
  const { envType = "pre", pageSize = 10, pageNumber = 1, getCount = true, onError } = options
  try {
    const { data } = await window.mo_app.models.metadata.list({
      filter: {
        where: {
          $and: [{ wyyyID: { $eq: wyyyID } }, { key: { $eq: name } }],
        },
      },
      pageSize,
      pageNumber,
      getCount,
    })

    return data
  } catch (error) {
    console.error("Error getting metadata list:", error)
    onError?.(error)
    throw error
  }
}

/**
 * 获取单条元数据
 */
export const getCloudMetadataById = async (id: string, wyyyID: string, options: CloudMetadataOptions = {}) => {
  const { envType = "pre", onError } = options

  try {
    const { data } = await window.mo_app.models.metadata.get({
      filter: {
        where: {
          $and: [{ _id: { $eq: id } }, { wyyyID: { $eq: wyyyID } }],
        },
      },
      
    })

    return data
  } catch (error) {
    console.error("Error getting metadata by id:", error)
    onError?.(error)
    throw error
  }
}

/**
 * 更新单条元数据
 */
export const updateCloudMetadata = async (
  id: string,
  value: any,
  wyyyID: string,
  options: CloudMetadataOptions = {}
) => {
  const { envType = "pre", onError } = options

  try {
    const { data } = await window.mo_app.models.metadata.update({
      data: {
        data: typeof value === "string" ? value : JSON.stringify(value),
      },
      filter: {
        where: {
          $and: [{ _id: { $eq: id } }, { wyyyID: { $eq: wyyyID } }],
        },
      },
      
    })

    return { count: data.count }
  } catch (error) {
    console.error("Error updating metadata:", error)
    onError?.(error)
    throw error
  }
}

/**
 * 批量更新元数据
 */
export const updateCloudMetadataBatch = async (
  filter: any,
  value: any,
  wyyyID: string,
  options: CloudMetadataOptions = {}
) => {
  const { envType = "pre", onError } = options

  try {
    const { data } = await window.mo_app.models.metadata.updateMany({
      data: {
        data: typeof value === "string" ? value : JSON.stringify(value),
      },
      filter: {
        where: {
          $and: [{ wyyyID: { $eq: wyyyID } }, ...filter],
        },
      },
      
    })

    return { count: data.count }
  } catch (error) {
    console.error("Error batch updating metadata:", error)
    onError?.(error)
    throw error
  }
}

/**
 * 删除单条元数据
 */
export const deleteCloudMetadata = async (id: string, wyyyID: string, options: CloudMetadataOptions = {}) => {
  const { envType = "pre", onError } = options

  try {
    const { data } = await window.mo_app.models.metadata.delete({
      filter: {
        where: {
          $and: [{ _id: { $eq: id } }, { wyyyID: { $eq: wyyyID } }],
        },
      },
      
    })

    return { count: data.count }
  } catch (error) {
    console.error("Error deleting metadata:", error)
    onError?.(error)
    throw error
  }
}

/**
 * 批量删除元数据
 */
export const deleteCloudMetadataBatch = async (filter: any, wyyyID: string, options: CloudMetadataOptions = {}) => {
  const { envType = "pre", onError } = options

  try {
    const { data } = await window.mo_app.models.metadata.deleteMany({
      filter: {
        where: {
          $and: [{ wyyyID: { $eq: wyyyID } }, ...filter],
        },
      },
      
    })

    return { count: data.count }
  } catch (error) {
    console.error("Error batch deleting metadata:", error)
    onError?.(error)
    throw error
  }
}
