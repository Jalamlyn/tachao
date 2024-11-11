import React, { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SimpleDataTableSearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
  className?: string
}

const SimpleDataTableSearch: React.FC<SimpleDataTableSearchProps> = ({
  value: initialValue,
  onChange,
  debounce = 150,
  className,
  ...props
}) => {
  const [value, setValue] = useState(initialValue)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)
    return () => clearTimeout(timeout)
  }, [value, debounce, onChange])

  return (
    <div className='relative w-full max-w-md'>
      <Search
        className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 
          transition-colors group-hover:text-primary'
      />

      <Input
        {...props}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "h-10 w-full rounded-md border bg-white pl-10 pr-4 text-sm",
          className
        )}
        placeholder='搜索所有列...'
        aria-label='搜索输入框'
      />
    </div>
  )
}

export default SimpleDataTableSearch
