import globalStore from "@/globalStore"

export const createShareUrl = (url) => {
  const oid = globalStore.organizationId
  const urlObject = new URL(url) // 将传入的 URL 转换为 URL 对象
  urlObject.searchParams.set("oid", oid) // 设置 oid 参数

  return urlObject.toString() // 返回带有 oid 参数的 URL 字符串
}
