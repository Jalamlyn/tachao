import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Icon } from "@iconify/react"
import { UseFormReturn } from "react-hook-form"
import { PROCESS_STEPS, PROCESS_STEP_LABELS, PROCESS_STEP_DESCRIPTIONS } from "../types/DeliveryOrder"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/theme/cn"
import { format } from "date-fns"

interface ProcessConfirmationProps {
  form: UseFormReturn<any>
  isEditable: boolean
  isInitializing: boolean
  onConfirm: (step: string) => void
  onCancelConfirmation: (step: string) => void
}

const ProcessConfirmation: React.FC<ProcessConfirmationProps> = ({
  form,
  isEditable,
  isInitializing,
  onConfirm,
  onCancelConfirmation,
}) => {
  const processConfirmations = form.watch("data.processConfirmations") || {}

  const renderConfirmationStep = (step: string) => {
    const confirmation = processConfirmations[step] || {}
    const isConfirmed = confirmation?.confirmed

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "p-8 rounded-2xl transition-all duration-300",
          "hover:shadow-lg hover:shadow-blue-500/5",
          isConfirmed
            ? "bg-gradient-to-br from-blue-50/80 to-blue-50/40 border border-blue-100/50"
            : "bg-white border border-gray-100"
        )}
      >
        <div className='flex justify-between items-start'>
          <motion.div className='flex items-center gap-4 mb-2'>
            <motion.div
              animate={{
                scale: isConfirmed ? [1, 1.2, 1] : 1,
                rotate: isConfirmed ? [0, 15, 0] : 0,
              }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                times: isConfirmed ? [0, 0.6, 1] : [0],
              }}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                "shadow-sm transition-colors duration-300",
                isConfirmed ? "bg-blue-100/80 text-blue-600" : "bg-gray-100/80 text-gray-400"
              )}
            >
              <Icon icon={isConfirmed ? "mdi:check-circle" : "mdi:clock-outline"} className='w-7 h-7' />
            </motion.div>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>{PROCESS_STEP_LABELS[step]}</h3>
              <p className={cn("text-sm mt-1", isConfirmed ? "text-blue-600" : "text-gray-500")}>
                {isConfirmed ? "已确认" : "待确认"}
              </p>
            </div>
          </motion.div>

          {isEditable && (
            <div className='flex gap-2'>
              <AnimatePresence mode='wait'>
                {!isConfirmed ? (
                  <motion.div
                    key='confirm'
                    initial={{ opacity: 0, scale: 0.9, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      onClick={() => onConfirm(step)}
                      variant='outline'
                      size='sm'
                      type='button'
                      className='gap-2 border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 hover:border-blue-300 text-blue-700
                        transition-all duration-300 hover:scale-105'
                    >
                      <Icon icon='mdi:check' className='w-4 h-4' />
                      确认
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key='cancel'
                    initial={{ opacity: 0, scale: 0.9, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      onClick={() => onCancelConfirmation(step)}
                      variant='outline'
                      size='sm'
                      className='gap-2 border-red-200 bg-red-50/50 hover:bg-red-100/50 hover:border-red-300 text-red-700
                        transition-all duration-300 hover:scale-105'
                    >
                      <Icon icon='mdi:close' className='w-4 h-4' />
                      取消确认
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <p className='mt-4 text-gray-600 text-sm leading-relaxed'>{PROCESS_STEP_DESCRIPTIONS[step]}</p>

        <motion.div className='mt-8 space-y-6'>
          <div className='grid grid-cols-2 gap-6'>
            <FormField
              control={form.control}
              name={`data.processConfirmations.${step}.confirmer`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-gray-700 flex items-center gap-2'>
                    <Icon icon='mdi:account' className='w-5 h-5 text-blue-500' />
                    确认人
                  </FormLabel>
                  <FormControl>
                    <input {...field} disabled className='w-full h-10 px-3 rounded-md border bg-gray-50/80 backdrop-blur-sm' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`data.processConfirmations.${step}.confirmationDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-gray-700 flex items-center gap-2'>
                    <Icon icon='mdi:calendar' className='w-5 h-5 text-blue-500' />
                    确认日期
                  </FormLabel>
                  <FormControl>
                    <input
                      value={field.value ? format(new Date(field.value), "yyyy-MM-dd HH:mm") : ""}
                      disabled
                      className='w-full h-10 px-3 rounded-md border bg-gray-50/80 backdrop-blur-sm font-mono'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {!isInitializing && (isEditable || confirmation?.comments) && (
            <FormField
              control={form.control}
              name={`data.processConfirmations.${step}.comments`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-gray-700 flex items-center gap-2'>
                    <Icon icon='mdi:comment-text-outline' className='w-5 h-5 text-blue-500' />
                    确认意见
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={!isEditable || isConfirmed}
                      className='min-h-[100px] bg-white/80 backdrop-blur-sm resize-none'
                      placeholder='请输入确认意见...'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </motion.div>
      </motion.div>
    )
  }

  return (
    <Card className='overflow-hidden'>
      <CardContent className='p-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='flex items-center gap-3 mb-4'
        >
          <div className='w-12 h-12 rounded-xl bg-blue-100/50 flex items-center justify-center'>
            <Icon icon='mdi:clipboard-check-outline' className='w-7 h-7 text-blue-600' />
          </div>
          <div>
            <h2 className='text-2xl font-semibold text-gray-900'>处理确认</h2>
            <p className='text-gray-500 mt-1'>跟踪并确认订单处理的每个环节</p>
          </div>
        </motion.div>

        <Tabs defaultValue={Object.values(PROCESS_STEPS)[0]} className='space-y-8'>
          <div className='relative'>
            <motion.div
              className='absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            />
            <motion.div
              className='absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            />

            <div className='overflow-x-auto scrollbar-hide'>
              <TabsList className='w-max flex-nowrap bg-transparent px-4 gap-2'>
                <AnimatePresence>
                  {Object.values(PROCESS_STEPS).map((step, index) => {
                    const confirmation = processConfirmations[step] || {}
                    const isConfirmed = confirmation?.confirmed
                    return (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          delay: index * 0.1,
                          duration: 0.3,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                      >
                        <TabsTrigger
                          value={step}
                          className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-300",
                            "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                            "hover:bg-blue-50",
                            isConfirmed && "text-blue-600",
                            "whitespace-nowrap min-w-[120px] justify-center",
                            "relative overflow-hidden group"
                          )}
                        >
                          <motion.div
                            className={cn(
                              "absolute inset-0 bg-blue-100/10",
                              "group-hover:opacity-100 opacity-0 transition-opacity duration-300"
                            )}
                            layoutId="tab-highlight"
                            transition={{ duration: 0.3 }}
                          />
                          <motion.div
                            animate={{
                              scale: isConfirmed ? [1, 1.2, 1] : 1,
                              rotate: isConfirmed ? [0, 15, 0] : 0,
                            }}
                            transition={{ 
                              duration: 0.5,
                              ease: "easeOut",
                              times: isConfirmed ? [0, 0.6, 1] : [0]
                            }}
                          >
                            <Icon
                              icon={isConfirmed ? "mdi:check-circle" : "mdi:clock-outline"}
                              className={cn(
                                "w-5 h-5",
                                "transition-transform duration-300 ease-spring",
                                "group-hover:scale-110"
                              )}
                            />
                          </motion.div>
                          <span className="relative z-10">{PROCESS_STEP_LABELS[step]}</span>
                        </TabsTrigger>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </TabsList>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {Object.values(PROCESS_STEPS).map((step) => (
              <TabsContent key={step} value={step} className='mt-6 focus-visible:outline-none'>
                {renderConfirmationStep(step)}
              </TabsContent>
            ))}
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default ProcessConfirmation