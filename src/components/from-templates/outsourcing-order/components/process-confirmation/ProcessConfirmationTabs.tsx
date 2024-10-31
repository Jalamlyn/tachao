import React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icon } from "@iconify/react"
import { cn } from "@/theme/cn"
import { PROCESS_STEPS, PROCESS_STEP_LABELS } from "../../types/OutsourcingOrder"
import { motion, AnimatePresence } from "framer-motion"

interface ProcessConfirmationTabsProps {
  processConfirmations: Record<string, any>
  children: React.ReactNode
}

const ProcessConfirmationTabs: React.FC<ProcessConfirmationTabsProps> = ({ processConfirmations, children }) => {
  return (
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
        {children}
      </AnimatePresence>
    </Tabs>
  )
}

export default ProcessConfirmationTabs