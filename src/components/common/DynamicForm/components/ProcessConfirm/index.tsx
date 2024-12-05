import React, { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { ProcessStep as ProcessStepType, ProcessProgress } from "../../types"
import { useProcessConfirm } from "./hooks/useProcessConfirm"
import ProcessStep from "./ProcessStep"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/theme/cn"
import { Icon } from "@iconify/react"
import { Progress } from "@nextui-org/react"

interface DynamicProcessConfirmProps {
  steps: ProcessStepType[]
  form: UseFormReturn<any>
  isEditable?: boolean
  fieldName?: string
}

const ProcessProgressIndicator: React.FC<{
  progress: ProcessProgress
}> = ({ progress }) => {
  return (
    <div className="space-y-2 mb-4">
      <Progress
        aria-label="Progress"
        value={progress.percentage}
        className="max-w-md"
        color="primary"
      />
      <div className="flex justify-between text-sm text-gray-500">
        <span>已完成 {progress.completed}/{progress.total} 步</span>
        <span>{progress.percentage}%</span>
      </div>
    </div>
  )
}

const DynamicProcessConfirm: React.FC<DynamicProcessConfirmProps> = ({
  steps,
  form,
  isEditable = true,
  fieldName = "processConfirmations",
}) => {
  const { isConfirming, handleConfirm, handleCancel, calculateProgress } = useProcessConfirm({
    steps,
    form,
    fieldName,
    isEditable,
  })

  const [selectedStep, setSelectedStep] = React.useState<string>(steps[0]?.key || "")

  // 计算进度
  const progress = useMemo(() => calculateProgress(), [form.watch(fieldName)])

  // 检查步骤是否被阻塞
  const isStepBlocked = (step: ProcessStepType): { blocked: boolean; reason?: string } => {
    if (!step.dependencies?.length) return { blocked: false }

    for (const dep of step.dependencies) {
      const dependentStepData = form.watch(`${fieldName}.${dep.step}`)
      
      if (!dependentStepData?.confirmed) {
        return { 
          blocked: true, 
          reason: dep.message || `需要先完成 "${steps.find(s => s.key === dep.step)?.title}"` 
        }
      }

      if (dep.condition) {
        const { field, value, custom } = dep.condition
        if (field && value !== undefined) {
          if (dependentStepData.formData[field] !== value) {
            return { 
              blocked: true, 
              reason: dep.message || `依赖步骤的 ${field} 值不符合要求` 
            }
          }
        }
        if (custom && !custom(dependentStepData.formData)) {
          return { 
            blocked: true, 
            reason: dep.message || "自定义条件未满足" 
          }
        }
      }
    }

    return { blocked: false }
  }

  // 新增：监听表单变化并触发重新渲染
  React.useEffect(() => {
    const subscription = form.watch(() => {
      form.trigger(fieldName)
    })
    return () => subscription.unsubscribe()
  }, [form, fieldName])

  return (
    <div className="space-y-6">
      <ProcessProgressIndicator progress={progress} />
      
      <Tabs value={selectedStep} onValueChange={setSelectedStep}>
        <TabsList className="w-full">
          {steps.map((step) => {
            const stepData = form.watch(`${fieldName}.${step.key}`) || {}
            if (stepData.hidden) return null

            const { blocked, reason } = isStepBlocked(step)
            const isCompleted = stepData.confirmed
            const isCurrent = selectedStep === step.key

            return (
              <TabsTrigger
                key={step.key}
                value={step.key}
                disabled={blocked}
                className={cn(
                  "flex items-center gap-2 relative",
                  isCompleted && "text-blue-600",
                  blocked && "opacity-50 cursor-not-allowed"
                )}
                title={blocked ? reason : undefined}
              >
                <Icon 
                  icon={
                    isCompleted 
                      ? "mdi:check-circle" 
                      : blocked 
                      ? "mdi:lock" 
                      : "mdi:circle-outline"
                  } 
                  className={cn(
                    "w-5 h-5",
                    isCompleted && "text-blue-600",
                    blocked && "text-gray-400"
                  )}
                />
                <span>{step.title}</span>
                {step.weight && (
                  <span className="text-xs text-gray-500">
                    ({step.weight}分)
                  </span>
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {steps.map((step) => {
          const stepData = form.watch(`${fieldName}.${step.key}`) || {}
          if (stepData.hidden) return null

          return (
            <TabsContent key={step.key} value={step.key}>
              <ProcessStep
                step={step}
                form={form}
                isEditable={isEditable}
                fieldName={fieldName}
                isConfirming={isConfirming === step.key}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}

export default DynamicProcessConfirm