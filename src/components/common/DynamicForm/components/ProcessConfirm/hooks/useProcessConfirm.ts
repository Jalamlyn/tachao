import { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { ProcessStep } from "../../../types"
import message from "@/components/Message"
import { getCurrentAccountInfo } from "@/service/apis/user"

interface UseProcessConfirmProps {
  steps: ProcessStep[]
  form: UseFormReturn<any>
  fieldName?: string
  isEditable?: boolean
}

export const useProcessConfirm = ({
  steps,
  form,
  fieldName = "processConfirmations",
  isEditable = true,
}: UseProcessConfirmProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isConfirming, setIsConfirming] = useState<string>("")

  // 获取当前用户信息
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentAccountInfo()
        setCurrentUser(user)
      } catch (error) {
        console.error("Failed to fetch user info:", error)
        message.error("获取用户信息失败")
      }
    }

    if (!currentUser && isEditable) {
      fetchUser()
    }
  }, [currentUser, isEditable])

  // 初始化流程确认数据
  useEffect(() => {
    const currentValues = form.getValues(fieldName) || {}
    const updates: Record<string, any> = {}
    let needsUpdate = false

    steps.forEach((step) => {
      if (!currentValues[step.key]) {
        updates[`${fieldName}.${step.key}`] = {
          confirmed: false,
          confirmer: "",
          confirmationDate: "",
          formData: {},
        }
        needsUpdate = true
      }
    })

    if (needsUpdate) {
      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value)
      })
    }
  }, [steps, fieldName, form])

  // 修改 watch 处理
  useEffect(() => {
    // 直接使用 watch，让 React Hook Form 处理清理
    steps.forEach(step => 
      form.watch(`${fieldName}.${step.key}`, (value) => {
        // ... 处理逻辑
      })
    );

    // 返回空的清理函数
    return () => {};
  }, [steps, fieldName, form]);

  // 确认步骤
  const handleConfirm = async (step: ProcessStep) => {
    if (!currentUser) {
      message.error("未能获取用户信息")
      return
    }

    if (step.fields) {
      const formDataPath = `${fieldName}.${step.key}.formData`
      const isValid = await form.trigger(formDataPath)
      if (!isValid) {
        message.error("请完成必填字段")
        return
      }
    }

    setIsConfirming(step.key)
    try {
      const updates = {
        [`${fieldName}.${step.key}.confirmed`]: true,
        [`${fieldName}.${step.key}.confirmer`]: currentUser.name || currentUser.email,
        [`${fieldName}.${step.key}.confirmationDate`]: new Date().toISOString(),
      }

      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value)
      })

      form.trigger(`${fieldName}.${step.key}`)
      message.success("确认成功")
    } catch (error) {
      console.error("Error confirming step:", error)
      message.error("确认失败")
    } finally {
      setIsConfirming("")
    }
  }

  // 取消确认
  const handleCancel = (step: ProcessStep) => {
    try {
      const updates = {
        [`${fieldName}.${step.key}.confirmed`]: false,
        [`${fieldName}.${step.key}.confirmer`]: "",
        [`${fieldName}.${step.key}.confirmationDate`]: "",
      }

      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value)
      })

      form.trigger(`${fieldName}.${step.key}`)
      message.success("已取消确认")
    } catch (error) {
      console.error("Error canceling confirmation:", error)
      message.error("取消确认失败")
    }
  }

  return {
    currentUser,
    isConfirming,
    handleConfirm,
    handleCancel,
  }
}