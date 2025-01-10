import { useState, useCallback } from "react"
import { setMetadata, getMetadata, queryMetadataHistory, deleteMetadata } from "@/service/apis/api"
import { getCurrentAccountInfo } from "@/service/apis/user"
import { jsonParse, jsonStringify } from "@/utils"
import { generateOrderNumber } from "@/utils/generateOrderNumber"

interface FormIndex {
  id: string
  templateId: string
  status: string
  title: string
}

interface FormData {
  id: string
  templateId: string
  title: string
  data: any
  status: string
  versionCode: number
  modifiedBy: string
}

interface CopyFormOptions {
  resetStatus?: boolean
  resetDates?: boolean
  suffix?: string
  onBeforeCopy?: (form: FormData) => Promise<FormData>
}

export const useFormMetadata = () => {
  const [forms, setForms] = useState<FormData[]>([])

  const fetchForms = useCallback(async () => {
    try {
      const result = await getMetadata(["form_index"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        const formIndexes: FormIndex[] = jsonParse(result.data[0].value)

        const formDetailsPromises = formIndexes.map(async (formIndex) => {
          const formDetailResult = await getMetadata([`${formIndex.id}`])
          if (formDetailResult.data && formDetailResult.data.length > 0 && formDetailResult.data[0].value) {
            const formData: FormData = jsonParse(formDetailResult.data[0].value)
            return {
              ...formData,
              status: formIndex.status,
              title: formIndex.title,
              versionCode: formDetailResult.data[0].versionCode,
            }
          }
          return null
        })

        const formDetails = await Promise.all(formDetailsPromises)
        const validFormDetails = formDetails.filter((form): form is FormData => form !== null)
        setForms(validFormDetails)
        return validFormDetails
      } else {
        setForms([])
        return []
      }
    } catch (error) {
      console.error("Error fetching forms:", error)
      setForms([])
      return []
    }
  }, [])

  const addForm = useCallback(async (newForm: FormData) => {
    try {
      // 使用 orderNumber 作为 id 和 title
      const orderNumber = newForm.data?.basicInfo?.orderNumber
      const formId = orderNumber || newForm.id
      const formTitle = orderNumber || newForm.title

      // 保存新表单详情
      await setMetadata(
        `form_${formId}`,
        jsonStringify({
          ...newForm,
          id: formId,
          title: formTitle,
        })
      )

      // 获取当前的表单索引
      const result = await getMetadata(["forms"])
      let formIndexes: FormIndex[] = []
      if (result.data && result.data.length > 0 && result.data[0].value) {
        formIndexes = jsonParse(result.data[0].value)
      }

      // 添加新表单到索引
      const newFormIndex: FormIndex = {
        id: formId,
        templateId: newForm.templateId,
        status: newForm.status,
        title: formTitle,
      }
      formIndexes.push(newFormIndex)

      // 更新表单索引
      await setMetadata("forms", jsonStringify(formIndexes))

      // 更新本地状态
      const updatedForm = {
        ...newForm,
        id: formId,
        title: formTitle,
      }
      setForms((prevForms) => [...prevForms, updatedForm])

      return updatedForm
    } catch (error) {
      console.error("Error adding form:", error)
      return null
    }
  }, [])

  const deleteForm = useCallback(async (formId: string) => {
    try {
      await deleteMetadata({ name: `form_${formId}` }) // Delete the individual form data
      const result = await getMetadata(["forms"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        let formIndexes: FormIndex[] = jsonParse(result.data[0].value)
        formIndexes = formIndexes.filter((form) => form.id !== formId)
        await setMetadata("forms", jsonStringify(formIndexes))
      }
      setForms((prevForms) => prevForms.filter((form) => form.id !== formId))
      return true
    } catch (error) {
      console.error("Error deleting form:", error)
      return false
    }
  }, [])

  const getFormById = useCallback(async (formId: string) => {
    try {
      const formDetailResult = await getMetadata([`form_${formId}`])
      if (formDetailResult.data && formDetailResult.data.length > 0 && formDetailResult.data[0].value) {
        const formData: FormData = jsonParse(formDetailResult.data[0].value)
        return { ...formData, versionCode: formDetailResult.data[0].versionCode }
      }
      return null
    } catch (error) {
      console.error("Error getting form by id:", error)
      return null
    }
  }, [])

  const updateForm = useCallback(async (updatedForm: FormData) => {
    try {
      debugger
      const currentUser = await getCurrentAccountInfo()
      const orderNumber = updatedForm.data?.basicInfo?.orderNumber
      const formId = orderNumber || updatedForm.id
      const formTitle = orderNumber || updatedForm.title

      const formWithModifier = {
        ...updatedForm,
        id: formId,
        title: formTitle,
        modifiedBy: currentUser.name || currentUser.email || "Unknown User",
      }

      await setMetadata(`form_${formId}`, jsonStringify(formWithModifier))
      const result = await getMetadata(["forms"])
      if (result.data && result.data.length > 0 && result.data[0].value) {
        let formIndexes: FormIndex[] = jsonParse(result.data[0].value)
        const index = formIndexes.findIndex((form) => form.id === formId)
        if (index !== -1) {
          formIndexes[index] = {
            id: formId,
            templateId: updatedForm.templateId,
            status: updatedForm.status,
            title: formTitle,
          }
          await setMetadata("forms", jsonStringify(formIndexes))
        } else {
          formIndexes.push({
            id: formId,
            templateId: updatedForm.templateId,
            status: updatedForm.status,
            title: formTitle,
          })
          await setMetadata("forms", jsonStringify(formIndexes))
        }
      }
      setForms((prevForms) => prevForms.map((form) => (form.id === formId ? formWithModifier : form)))
      return true
    } catch (error) {
      console.error("Error updating form:", error)
      return false
    }
  }, [])

  const copyForm = useCallback(
    async (formId: string, options: CopyFormOptions = {}) => {
      const { resetStatus = true, resetDates = true, suffix = "_副本", onBeforeCopy } = options

      try {
        // 1. 获取原始表单数据
        const originalForm = await getFormById(formId)
        if (!originalForm) {
          throw new Error("Original form not found")
        }

        // 2. 创建新的表单数据
        let newForm = {
          ...originalForm,
          id: Date.now().toString(),
          orderNumber: generateOrderNumber(),
          title: `${originalForm.title}${suffix}`,
          createdAt: new Date().toISOString(),
          data: {
            ...originalForm.data,
            basicInfo: {
              ...originalForm.data.basicInfo,
              orderNumber: generateOrderNumber(),
            },
          },
        }

        // 3. 如果提供了 onBeforeCopy 钩子，执行它
        if (onBeforeCopy) {
          newForm = await onBeforeCopy(newForm)
        }

        // 4. 使用现有的 addForm 方法保存新表单
        const result = await addForm(newForm)
        if (!result) {
          throw new Error("Failed to copy form")
        }

        return result
      } catch (error) {
        console.error("Error copying form:", error)
        throw error
      }
    },
    [getFormById, addForm]
  )

  const updateFormStatus = useCallback(
    async (formId: string, newStatus: string) => {
      try {
        const form = await getFormById(formId)
        if (form) {
          const updatedForm = { ...form, status: newStatus }
          await updateForm(updatedForm)
          return true
        }
        return false
      } catch (error) {
        console.error("Error updating form status:", error)
        return false
      }
    },
    [getFormById, updateForm]
  )

  const getFormHistory = useCallback(async (names: any) => {
    try {
      const history = await queryMetadataHistory({ names })
      return history.data.map((item: any) => ({
        updatedAt: item.updatedAt,
        status: jsonParse(item.value).status,
        versionCode: item.versionCode,
        modifiedBy: jsonParse(item.value).modifiedBy || "Unknown User",
        value: item.value,
      }))
    } catch (error) {
      console.error("Error fetching form history:", error)
      return []
    }
  }, [])

  return {
    forms,
    fetchForms,
    addForm,
    deleteForm,
    getFormById,
    updateForm,
    updateFormStatus,
    getFormHistory,
    copyForm,
    getStatusesByTemplateId,
  }
}

const getStatusesByTemplateId = (templateId) => {
  console.log(templateId)
  switch (templateId) {
    case "salesOrder":
      return [
        { value: "pending_approval", label: "待审批", color: "warning" },
        { value: "approved", label: "审批通过", color: "success" },
        { value: "rejected", label: "审批不通过", color: "danger" },
      ]
    default:
      return [{ value: "Error", label: "未知状态", color: "danger" }]
  }
}
