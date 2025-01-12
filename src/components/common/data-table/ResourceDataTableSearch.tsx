import React, { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Icon } from "@iconify/react"

interface DebouncedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
  useButton?: boolean
}

const DebouncedInput: React.FC<DebouncedInputProps> = ({
  value: initialValue,
  onChange,
  debounce = 150,
  useButton = true,
  className,
  ...props
}) => {
  const [value, setValue] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    if (!useButton) {
      const timeout = setTimeout(() => {
        onChange(value)
      }, debounce)
      return () => clearTimeout(timeout)
    }
  }, [value, debounce, onChange, useButton])

  const handleSearch = () => {
    if (useButton) {
      onChange(value)
    }
  }

  return (
    <div className='relative w-full max-w-md flex gap-2'>
      <motion.div
        className={cn("relative flex-1 group", isFocused && "ring-2 ring-primary/20 rounded-md")}
        initial={false}
        animate={{
          scale: isFocused ? 1.01 : 1,
          transition: { duration: 0.2 },
        }}
      >
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className='absolute -top-6 left-0 text-xs text-gray-500'
            >
              输入关键词搜索所有列
            </motion.div>
          )}
        </AnimatePresence>
        <Icon
          icon='mingcute:search-ai-fill'
          className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 
          transition-colors group-hover:text-primary h-5 w-5'
        />

        <input
          {...props}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "h-10 w-full rounded-md border bg-white pl-10 pr-4 text-sm",
            "placeholder:text-gray-500 focus:outline-none",
            "t-all duration-200 ease-in-out",
            "border-gray-200 hover:border-gray-300",
            "focus:border-primary focus:ring-2 focus:ring-primary/20",
            className
          )}
          placeholder='搜索所有列...'
          aria-label='搜索输入框'
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch()
            }
          }}
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setValue("")
                onChange("")
              }}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                hover:text-gray-600 focus:outline-none'
              aria-label='清除搜索'
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {useButton && (
        <Button
          onClick={handleSearch}
          className={cn(
            "h-10 px-4",
            "bg-primary text-white shadow-sm",
            "hover:bg-primary/90 hover:shadow-md",
            "active:scale-95 t-all duration-200",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          disabled={!value}
        >
          搜索
        </Button>
      )}
    </div>
  )
}

export default DebouncedInput
