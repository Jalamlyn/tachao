import { useState, useEffect, useCallback } from "react"
import { UseFormReturn } from "react-hook-form"
import { ProcessStep, ProcessProgress } from "../../../types"
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
          required: step.required || false,
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

  const calculateProgress = useCallback((): ProcessProgress => {
    const values = form.getValues(fieldName) || {}
    console.log("Calculating progress with values:", values)
    
    const totalWeight = steps.reduce((sum, step) => sum + (step.weight || 1), 0)
    let completedWeight = 0
    let currentStepIndex = 0
    const status: ProcessProgress['status'] = {}

    steps.forEach((step, index) => {
      const stepData = values[step.key] || {}
      const stepWeight = step.weight || 1

      if (stepData.confirmed) {
        completedWeight += stepWeight
      } else if (currentStepIndex === 0) {
        currentStepIndex = index
      }

      // 检查步骤是否被阻塞
      const isBlocked = step.dependencies?.some(dep => {
        const dependentStep = values[dep.step]
        if (!dependentStep?.confirmed) return true
        if (dep.condition) {
          const { field, value, custom } = dep.condition
          if (field && value !== undefined) {
            return dependentStep.formData[field] !== value
          }
          if (custom) {
            return !custom(dependentStep.formData)
          }
        }
        return false
      }) ?? false

      status[step.key] = {
        isCompleted: stepData.confirmed,
        isBlocked,
        blockReason: isBlocked ? "依赖步骤未完成" : undefined
      }
    })

    const progress = {
      total: steps.length,
      completed: Object.values(values).filter(step => step.confirmed).length,
      current: currentStepIndex,
      percentage: Math.round((completedWeight / totalWeight) * 100),
      status
    }

    console.log("Calculated progress:", progress)
    return progress
  }, [steps, form, fieldName])

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
      // 使用批量更新
      const updates = {
        [`${fieldName}.${step.key}.confirmed`]: true,
        [`${fieldName}.${step.key}.confirmer`]: currentUser.name || currentUser.email,
        [`${fieldName}.${step.key}.confirmationDate`]: new Date().toISOString(),
      }

      // 批量设置值
      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })
      })

      // 触发表单更新
      await form.trigger(fieldName)
      
      // 手动触发重新计算进度
      calculateProgress()
    } catch (error) {
      console.error("Error confirming step:", error)
      message.error("确认失败")
    } finally {
      setIsConfirming("")
    }
  }

  const handleCancel = (step: ProcessStep) => {
    try {
      const updates = {
        [`${fieldName}.${step.key}.confirmed`]: false,
        [`${fieldName}.${step.key}.confirmer`]: "",
        [`${fieldName}.${step.key}.confirmationDate`]: "",
      }

      // 批量设置值
      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })
      })

      // 触发表单更新
      form.trigger(fieldName)
      
      // 手动触发重新计算进度
      calculateProgress()
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
    calculateProgress,
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
      updates.forEach(({ stepKey, updates }) => {
        Object.entries(updates).forEach(([key, value]) => {
          form.setValue(`${fieldName}.${stepKey}.${key}`, value)
        })
      })
    }
  }
}