import React, { useState } from "react"
import { Input } from "@nextui-org/react"
import { Icon } from "@iconify/react"

interface SearchInputProps {
  onSearch: (query: string) => void
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch }) => {
  const [value, setValue] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)
    onSearch(newValue)
  }

  return (
    <Input
      value={value}
      onChange={handleChange}
      placeholder="搜索单据..."
      startContent={<Icon icon="mdi:magnify" className="w-5 h-5 text-default-400" />}
      className="max-w-md"
    />
  )
}

export default SearchInput