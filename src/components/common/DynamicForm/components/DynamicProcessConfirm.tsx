import React, { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { format } from "date-fns"
import { ProcessStep } from "../types"
import message from "@/components/Message"
import { getCurrentAccountInfo } from "@/service/apis/user"
import DynamicFormFields from "./DynamicFormFields"

interface DynamicProcessConfirmProps {
  steps: ProcessStep[]
  form: UseFormReturn<any>
  isEditable?: boolean
  fieldName?: string
}

const DynamicProcessConfirm: React.FC<DynamicProcessConfirmProps> = ({
  steps,
  form,
  isEditable = true,
  fieldName = "processConfirmations",
}) => {
  // 添加用户信息状态
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isConfirming, setIsConfirming] = useState<string>("");

  // 获取用户信息
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentAccountInfo();
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        message.error('获取用户信息失败');
      }
    };

    if (!currentUser) {
      fetchUser();
    }
  }, []);

  // 初始化状态
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
          formData: {} // 添加表单数据的初始值
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

  // 简化的确认处理
  const handleConfirm = async (step: ProcessStep) => {
    if (!currentUser) {
      message.error('未能获取用户信息');
      return;
    }

    // 如果有表单字段，先验证
    if (step.fields) {
      const formDataPath = `${fieldName}.${step.key}.formData`;
      const isValid = await form.trigger(formDataPath);
      if (!isValid) {
        message.error("请完成必填字段");
        return;
      }
    }

    setIsConfirming(step.key);
    try {
      const updates = {
        [`${fieldName}.${step.key}.confirmed`]: true,
        [`${fieldName}.${step.key}.confirmer`]: currentUser.name || currentUser.email,
        [`${fieldName}.${step.key}.confirmationDate`]: new Date().toISOString(),
      }

      Object.entries(updates).forEach(([field, value]) => {
        form.setValue(field, value)
      })

      // 触发重新渲染
      form.trigger(`${fieldName}.${step.key}`)
      message.success("确认成功")
    } catch (error) {
      console.error("Error confirming step:", error)
      message.error("确认失败")
    } finally {
      setIsConfirming("");
    }
  }

  // 简化的取消处理
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

  return (
    <div className='space-y-6'>
      {steps.map((step) => {
        const stepData = form.watch(`${fieldName}.${step.key}`) || {}
        const isConfirmed = stepData.confirmed
        const isLoading = isConfirming === step.key;

        return (
          <Card key={step.key}>
            <CardContent className='p-6'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-4'>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isConfirmed ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon
                      icon={step.icon || (isConfirmed ? "mdi:check-circle" : "mdi:clock-outline")}
                      className='w-7 h-7'
                    />
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold'>{step.title}</h3>
                    {step.description && <p className='text-gray-500 mt-1'>{step.description}</p>}
                  </div>
                </div>

                {isEditable && (
                  <div>
                    {!isConfirmed ? (
                      <Button
                        onClick={() => handleConfirm(step)}
                        variant='bordered'
                        size='sm'
                        isLoading={isLoading}
                        startContent={!isLoading && <Icon icon='mdi:check' className='w-4 h-4' />}
                      >
                        确认
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleCancel(step)}
                        variant='bordered'
                        size='sm'
                        color='danger'
                        startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
                      >
                        取消确认
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* 添加流程表单字段 */}
              {step.fields && (
                <div className='mt-4 border-t pt-4'>
                  <DynamicFormFields
                    fields={step.fields}
                    form={form}
                    isEditable={isEditable && !isConfirmed}
                    orderNumberFieldConfig={undefined}
                  />
                </div>
              )}

              {isConfirmed && (
                <div className='grid grid-cols-2 gap-6 mt-4'>
                  <div>
                    <label className='text-sm text-gray-500'>确认人</label>
                    <p>{stepData.confirmer}</p>
                  </div>
                  <div>
                    <label className='text-sm text-gray-500'>确认时间</label>
                    <p>
                      {stepData.confirmationDate && format(new Date(stepData.confirmationDate), "yyyy-MM-dd HH:mm:ss")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default DynamicProcessConfirm