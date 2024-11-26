import React, { useState, useCallback } from "react"
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
  value,
  onChange,
  placeholder = "搜索...",
  className,
}) => {
  const debouncedOnChange = useDebounce(onChange, 300)

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedOnChange(e.target.value)
  }, [debouncedOnChange])

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className={className}
      startContent={<Icon icon="mdi:magnify" className="text-default-400 w-5 h-5" />}
      endContent={
        value ? (
          <button
            className="focus:outline-none"
            onClick={() => onChange("")}
          >
            <Icon icon="mdi:close" className="text-default-400 w-5 h-5" />
          </button>
        ) : null
      }
    />
  )
}

export default SearchInput