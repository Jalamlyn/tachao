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
          hidden: false,
        }
        needsUpdate = true
      }
    })

    if (needsUpdate) {
      form.batch(() => {
        Object.entries(updates).forEach(([field, value]) => {
          form.setValue(field, value)
        })
      })
    }
  }, [steps, fieldName, form])

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
      form.batch(() => {
        form.setValue(`${fieldName}.${step.key}.confirmed`, true)
        form.setValue(`${fieldName}.${step.key}.confirmer`, currentUser.name || currentUser.email)
        form.setValue(`${fieldName}.${step.key}.confirmationDate`, new Date().toISOString())
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

  const handleCancel = (step: ProcessStep) => {
    try {
      form.batch(() => {
        form.setValue(`${fieldName}.${step.key}.confirmed`, false)
        form.setValue(`${fieldName}.${step.key}.confirmer`, "")
        form.setValue(`${fieldName}.${step.key}.confirmationDate`, "")
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

export const createProcessWatch = (form: UseFormReturn<any>, fieldName: string) => {
  return {
    setStepVisibility: (stepKey: string, visible: boolean) => {
      form.setValue(`${fieldName}.${stepKey}.hidden`, !visible)
    },

    setStepRequired: (stepKey: string, required: boolean) => {
      form.setValue(`${fieldName}.${stepKey}.required`, required)
    },

    watchStepStatus: (stepKey: string, callback: (status: any) => void) => {
      return form.watch(`${fieldName}.${stepKey}.status`, callback)
    },

    batchUpdateSteps: (updates: Array<{ 
      stepKey: string, 
      updates: Record<string, any> 
    }>) => {
      form.batch(() => {
        updates.forEach(({ stepKey, updates }) => {
          Object.entries(updates).forEach(([key, value]) => {
            form.setValue(`${fieldName}.${stepKey}.${key}`, value)
          })
        })
      })
    }
  }
}