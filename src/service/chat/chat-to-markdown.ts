import { message } from "@/components/Message"
import { uploadAPI } from "@/app/admin/src/pages/AppBuilder/components/functionContext"
import { jsonParse } from "@/utils"

/**
 * PDF文件转换为Markdown
 * @param file PDF文件对象
 * @returns 转换后的markdown文本
 */
export async function pdfToMarkdown(file: File) {
  try {
    // 1. 首先上传文件
    const fileInfo = await uploadAPI.uploadFile(file, {
      maxSize: 10 * 1024 * 1024, // 限制10MB
      onProgress: (percent) => {
        console.log("Upload progress:", percent)
      },
      onError: (error) => {
        message.error(`文件上传失败: ${error.message}`)
        throw error
      },
    })

    if (!fileInfo || !fileInfo.fileUrl) {
      throw new Error("文件上传失败,未获取到URL")
    }

    // 2. 调用转换接口
    const response = await fetch("https://1259692580-b9dznk0gp5.na-siliconvalley.tencentscf.com/to-markdown", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: fileInfo.fileUrl,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`转换失败: ${response.status} ${response.statusText}. ${errorText}`)
    }

    const result = await response.text()

    try {
      // 尝试解析JSON响应
      const parsedResult = jsonParse(result)
      return parsedResult
    } catch (e) {
      // 如果不是JSON格式,直接返回文本
      return result
    }
  } catch (error) {
    console.error("PDF转Markdown失败:", error)
    message.error(`PDF转Markdown失败: ${error.message}`)
    throw error
  }
}
