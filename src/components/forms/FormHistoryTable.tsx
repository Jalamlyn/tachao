import React, { useState, useEffect } from "react"
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react"
import { useFormMetadata } from "../from-templates/hook/useFormMetadata"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import { localDB } from "@/utils/localDB"
import { Icon } from "@iconify/react"

interface FormHistoryTableProps {
  formId: string
}

const FormHistoryTable: React.FC<FormHistoryTableProps> = ({ formId }) => {
  const { getFormHistory } = useFormMetadata()
  const [history, setHistory] = useState<
    Array<{
      updatedAt: string
      value: string
      versionCode: number
      modifiedBy: string
    }>
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [compareResult, setCompareResult] = useState<string>("")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isComparing, setIsComparing] = useState(false)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const formHistory = await getFormHistory([`${formId}`])
        setHistory(formHistory)
      } catch (err) {
        console.error("获取历史记录失败:", err)
        setError("获取历史记录失败，请稍后重试。")
      } finally {
        setIsLoading(false)
      }
    }
    fetchHistory()
  }, [formId, getFormHistory])

  const compareDiff = (currentVersion: any, previousVersion: any) => {
    try {
      console.log(currentVersion, previousVersion)
      const currentObj = JSON.parse(currentVersion.value || "{}")
      const previousObj = JSON.parse(previousVersion.value || "{}")

      const diff = compareObjects(previousObj, currentObj)
      return formatDiff(diff)
    } catch (error) {
      console.error("比较版本失败:", error)
      return "比较版本时发生错误，请确保数据格式正确。"
    }
  }

  const compareObjects = (oldObj: any, newObj: any, path: string = ""): any => {
    const result: any = { added: {}, deleted: {}, updated: {} }

    // Check for deleted properties
    Object.keys(oldObj).forEach((key) => {
      if (key === "versionCode") return // 排除 versionCode 字段
      const currentPath = path ? `${path}.${key}` : key
      if (!(key in newObj)) {
        result.deleted[currentPath] = oldObj[key]
      }
    })

    // Check for added or updated properties
    Object.keys(newObj).forEach((key) => {
      if (key === "versionCode") return // 排除 versionCode 字段
      const currentPath = path ? `${path}.${key}` : key
      if (!(key in oldObj)) {
        result.added[currentPath] = newObj[key]
      } else if (
        typeof newObj[key] === "object" &&
        newObj[key] !== null &&
        typeof oldObj[key] === "object" &&
        oldObj[key] !== null
      ) {
        const nestedDiff = compareObjects(oldObj[key], newObj[key], currentPath)
        Object.keys(nestedDiff).forEach((diffType) => {
          Object.assign(result[diffType], nestedDiff[diffType])
        })
      } else if (newObj[key] !== oldObj[key]) {
        result.updated[currentPath] = { old: oldObj[key], new: newObj[key] }
      }
    })

    return result
  }

  const formatDiff = (diff: any): string => {
    let result = ""

    if (Object.keys(diff.added).length > 0) {
      result += "## 新增\n"
      for (const [key, value] of Object.entries(diff.added)) {
        result += `- \`${key}\`: <span style="color: green;">${JSON.stringify(value)}</span>\n`
      }
      result += "\n"
    }

    if (Object.keys(diff.deleted).length > 0) {
      result += "## 删除\n"
      for (const [key, value] of Object.entries(diff.deleted)) {
        result += `- \`${key}\`: <span style="color: red; text-decoration: line-through;">${JSON.stringify(
          value
        )}</span>\n`
      }
      result += "\n"
    }

    if (Object.keys(diff.updated).length > 0) {
      result += "## 更新\n"
      for (const [key, value] of Object.entries(diff.updated)) {
        result += `- \`${key}\`: <span style="color: red; text-decoration: line-through;">${JSON.stringify(
          value.old
        )}</span> → <span style="color: green;">${JSON.stringify(value.new)}</span>\n`
      }
      result += "\n"
    }

    return result
  }

  const compareVersions = async (currentVersion: any, previousVersion: any) => {
    setIsComparing(true)
    onOpen()
    try {
      // 生成缓存键
      const cacheKey = `${formId}_compare_${currentVersion.versionCode}_${previousVersion.versionCode}_diff`

      // 尝试从缓存中获取结果
      const cachedResult = localDB.getItem(cacheKey)
      if (cachedResult) {
        setCompareResult(cachedResult)
        setIsComparing(false)
        return
      }

      const result = compareDiff(currentVersion, previousVersion)
      setCompareResult(result)

      // 将结果存入缓存
      localDB.setItem(cacheKey, result)
    } catch (error) {
      console.error("比较版本失败:", error)
      setCompareResult("比较版本时发生错误，请稍后重试。")
    } finally {
      setIsComparing(false)
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Icon icon='mdi:loading' className='w-8 h-8 animate-spin' />
      </div>
    )
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>
  }

  return (
    <div className='mt-6'>
      <h3 className='text-lg font-semibold mb-2'>修改记录</h3>
      {history.length > 0 ? (
        <Table aria-label='修改记录'>
          <TableHeader>
            <TableColumn>时间</TableColumn>
            <TableColumn>版本</TableColumn>
            <TableColumn>修改详情</TableColumn>
            <TableColumn>修改人</TableColumn>
          </TableHeader>
          <TableBody>
            {history.map((record, index) => (
              <TableRow key={index}>
                <TableCell>{record.updatedAt}</TableCell>
                <TableCell>{record.versionCode}</TableCell>
                <TableCell>
                  {index < history.length - 1 ? (
                    <button
                      className='bg-primary text-white px-2 py-1 rounded text-sm'
                      onClick={() => compareVersions(record, history[index + 1])}
                    >
                      查看修改详情
                    </button>
                  ) : (
                    "初始版本"
                  )}
                </TableCell>
                <TableCell>{record.modifiedBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div>暂无修改记录</div>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size='3xl'>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex flex-col gap-1'>修改记录</ModalHeader>
              <ModalBody>
                {isComparing ? (
                  <Spinner label='正在生成修改记录...' />
                ) : (
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>{compareResult}</ReactMarkdown>
                )}
              </ModalBody>
              <ModalFooter>
                <button className='bg-danger text-white px-4 py-2 rounded' onClick={onClose}>
                  关闭
                </button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default FormHistoryTable
