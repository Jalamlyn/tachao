import React, { useState, useCallback, useEffect } from "react"
import { Input } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { useDebounce } from "@/hooks/useDebounce"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const SearchInput: React.FC<SearchInputProps> = ({
  value: externalValue,
  onChange,
  placeholder = "搜索...",
  className,
}) => {
  // 内部状态用于控制输入值
  const [internalValue, setInternalValue] = useState(externalValue)

  // 使用防抖来更新父组件的值
  const debouncedOnChange = useDebounce(onChange, 300)

  // 当外部值改变时同步内部状态
  useEffect(() => {
    setInternalValue(externalValue)
  }, [externalValue])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      // 立即更新内部状态,保证输入流畅
      setInternalValue(newValue)
      // 防抖更新父组件值
      debouncedOnChange(newValue)
    },
    [debouncedOnChange]
  )

  const handleClear = useCallback(() => {
    setInternalValue("")
    onChange("")
  }, [onChange])

  return (
    <Input
      value={internalValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      startContent={<Icon icon='mdi:magnify' className='text-default-400 w-5 h-5' />}
      endContent={
        internalValue ? (
          <button className='focus:outline-none' onClick={handleClear}>
            <Icon icon='mdi:close' className='text-default-400 w-5 h-5' />
          </button>
        ) : null
      }
    />
  )
}

export default SearchInput
