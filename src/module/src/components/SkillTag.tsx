import { context } from "@/lib/context"

const {
  wpm,
  React,
  observer,
  Icon,
  NextUI,
  ReactRouterDom,
  ReactHookForm,
  ReactToPrint,
  FramerMotion,
  message,
  appId,
  api,
  ai,
  mobx,
  recharts,
  cn,
  xlsx,
  esm,
} = context

const { Card, CardBody, Progress } = NextUI
const { motion } = FramerMotion

const SkillTag = observer(({ skill, onClick, isSelected }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      layout
    >
      <Card
        isPressable
        onPress={() => onClick(skill)}
        className={cn(
          "w-full overflow-hidden transition-all duration-300",
          "bg-gradient-to-br from-white to-default-50",
          "dark:from-default-50 dark:to-default-100",
          isSelected && [
            "border-2 border-pink-500",
            "shadow-lg shadow-pink-500/20",
            "bg-gradient-to-br from-pink-500/5 to-pink-500/10",
          ]
        )}
      >
        <CardBody className='p-3'>
          <div className='flex flex-col items-center'>
            <div
              className={cn(
                "w-16 h-16 rounded-2xl mb-3",
                "flex items-center justify-center",
                "bg-gradient-to-br from-pink-500/5 to-pink-500/10",
                "transform transition-transform duration-300",
                isSelected && "scale-110"
              )}
            >
              <Icon
                icon={skill.icon}
                className={cn(
                  "w-8 h-8 transition-colors duration-300",
                  isSelected ? "text-pink-500" : "text-default-600"
                )}
              />
            </div>

            <h3
              className={cn(
                "text-lg font-semibold mb-2 text-center",
                "transition-colors duration-300",
                isSelected ? "text-pink-500" : "text-foreground"
              )}
            >
              {skill.name}
            </h3>

            <div className='flex items-center gap-2 mb-3'>
              <div
                className={cn("flex items-center gap-1 px-2 py-1 rounded-full", "bg-default-100 dark:bg-default-50")}
              >
                <Icon
                  icon='solar:users-group-rounded-bold-duotone'
                  className={cn("w-4 h-4", isSelected ? "text-pink-500" : "text-default-500")}
                />
                <span className='text-sm font-medium text-default-600'>{skill.users}人</span>
              </div>
            </div>

            <div className='w-full space-y-2'>
              <div className='flex items-center justify-between px-1'>
                <div className='flex items-center gap-1'>
                  <Icon
                    icon='solar:star-bold'
                    className={cn("w-4 h-4", isSelected ? "text-pink-500" : "text-pink-400")}
                  />
                  <span className='text-sm font-medium'>{skill.rating}</span>
                </div>
                <span className='text-xs text-default-400'>评分</span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  )
})

context.wpm.export("comp_skill_tag", SkillTag)
SkillTag.displayName = "SkillTag"
