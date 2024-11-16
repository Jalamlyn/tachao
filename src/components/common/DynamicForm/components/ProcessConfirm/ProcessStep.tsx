import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { ProcessStep as ProcessStepType } from "../../types"
import { UseFormReturn } from "react-hook-form"
import ProcessStepForm from "./ProcessStepForm"
import ProcessStepConfirmation from "./ProcessStepConfirmation"
import { motion, AnimatePresence } from "framer-motion"

interface ProcessStepProps {
  step: ProcessStepType
  form: UseFormReturn<any>
  isEditable?: boolean
  fieldName?: string
  isConfirming: boolean
  onConfirm: (step: ProcessStepType) => void
  onCancel: (step: ProcessStepType) => void
}

const ProcessStep: React.FC<ProcessStepProps> = ({
  step,
  form,
  isEditable = true,
  fieldName = "processConfirmations",
  isConfirming,
  onConfirm,
  onCancel,
}) => {
  const stepData = form.watch(`${fieldName}.${step.key}`) || {}
  const isConfirmed = stepData.confirmed
  const isLoading = isConfirming
  const isRequired = stepData.required

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Card
        className={cn(
          "border-l-4 transition-all duration-300 ease-in-out transform hover:shadow-lg",
          isConfirmed ? "border-l-blue-500 bg-blue-50/30" : "border-l-gray-200"
        )}
      >
        <CardContent className='p-4 md:p-6'>
          <div className='flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6 mb-4 md:mb-6'>
            <div className='flex items-start gap-4'>
              <motion.div
                initial={false}
                transition={{ duration: 0.3 }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-300",
                  isConfirmed ? "bg-blue-100 text-blue-600 ring-2 ring-blue-200 shadow-md" : "bg-gray-50 text-gray-400"
                )}
              >
                <Icon
                  icon={isConfirmed ? "line-md:check-all" : "line-md:uploading"}
                  className={cn("w-5 h-5 transition-transform duration-300", isConfirmed ? "scale-110" : "")}
                />
              </motion.div>
              <div className='flex-1 min-w-0'>
                <h3
                  className={cn(
                    "text-lg font-semibold break-all transition-colors duration-300",
                    isConfirmed ? "text-blue-600" : "text-gray-900"
                  )}
                >
                  {step.title}
                  {isRequired && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className='text-red-500 ml-1'
                    >
                      *
                    </motion.span>
                  )}
                </h3>
                {step.description && (
                  <p className='text-gray-500 mt-1 text-sm leading-relaxed break-all'>{step.description}</p>
                )}
              </div>
            </div>

            {isEditable && (
              <div className='flex w-full md:w-auto'>
                <AnimatePresence mode='wait'>
                  {!isConfirmed ? (
                    <motion.div
                      key='confirm'
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        onClick={() => onConfirm(step)}
                        variant='bordered'
                        size='sm'
                        isLoading={isLoading}
                        className={cn(
                          "font-medium w-full md:w-auto transition-all duration-300",
                          isLoading ? "opacity-70" : "hover:bg-blue-50 hover:text-blue-600 hover:scale-105"
                        )}
                        startContent={!isLoading && <Icon icon='mdi:check' className='w-4 h-4' />}
                      >
                        <span className='hidden md:inline'>确认</span>
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key='cancel'
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        onClick={() => onCancel(step)}
                        variant='bordered'
                        size='sm'
                        color='danger'
                        className='font-medium hover:bg-red-50 hover:scale-105 transition-all duration-300 w-full md:w-auto'
                        startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
                      >
                        <span className='hidden md:inline'>取消确认</span>
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <AnimatePresence>
            {step.fields && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProcessStepForm
                  step={step}
                  form={form}
                  isEditable={isEditable}
                  isConfirmed={isConfirmed}
                  fieldName={fieldName}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isConfirmed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <ProcessStepConfirmation confirmer={stepData.confirmer} confirmationDate={stepData.confirmationDate} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ProcessStep
