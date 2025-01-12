import { Button, Chip } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { AnimatePresence, motion } from "framer-motion"
export const getRenderHeader =
  (setIsTagManageModalOpen, tagsIndex, selectedTags, setSelectedTags, handleClearTags, tagsVersion) =>
  ({ value, onChange, placeholder }) => (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <input
            type='text'
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className='w-full max-w-sm px-3 py-2 rounded-lg border border-default-200 focus:outline-none focus:ring-2 focus:ring-primary'
          />
        </div>
        <Button
          color='primary'
          variant='flat'
          onClick={() => setIsTagManageModalOpen(true)}
          startContent={<Icon icon='mdi:tag-plus' />}
        >
          管理标签
        </Button>
      </div>

      {tagsIndex && (
        <div className='relative'>
          <AnimatePresence>
            {selectedTags.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className='absolute right-2 top-1.5 z-10'
              >
                <Button
                  size='sm'
                  variant='flat'
                  color='default'
                  onClick={handleClearTags}
                  startContent={<Icon icon='mdi:close' className='w-4 h-4' />}
                >
                  清除筛选
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <div className='flex flex-wrap items-center gap-2 min-h-[40px] p-2 rounded-lg bg-default-50'>
            {tagsIndex.tags
              .filter((tag) => tag.type === "template")
              .map((tag) => (
                <motion.div
                  key={`${tag.id}-${tagsVersion}`}
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Chip
                    startContent={
                      selectedTags.includes(tag.id) && <Icon className='ml-2 w-5 h-5' icon='line-md:check-all' />
                    }
                    onClick={() => {
                      setSelectedTags((prev) =>
                        prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
                      )
                    }}
                    className={`cursor-pointer transition-transform hover:scale-105 bg-${tag.color}-500 text-white`}
                    classNames={{
                      base: "t-all duration-200",
                      content: "transition-colors duration-200",
                    }}
                  >
                    <div className='flex justify-center items-center'>
                      {tag.name}
                      <span className='ml-2 text-xs'>({tagsIndex.relations.template.byTag[tag.id]?.length || 0})</span>
                    </div>
                  </Chip>
                </motion.div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
