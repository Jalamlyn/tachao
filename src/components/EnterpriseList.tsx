import React, { useState, useEffect, useRef, useCallback } from "react"
import { Autocomplete, AutocompleteItem, AutocompleteItemProps } from "@nextui-org/react"
import { queryEnterPriseList } from "@/service/apis/api"
import { debounce } from "lodash"

const getCache = () => {
  const cachedValue = localStorage.getItem("cachedValue")
  const cachedLabel = localStorage.getItem("cachedLabel")
  return [
    {
      label: cachedLabel,
      value: cachedValue,
    },
  ]
}

export default ({ loginData }) => {
  const [value, setValue] = useState(() => {
    const cachedLabel = localStorage.getItem("cachedLabel")
    return cachedLabel || ""
  })
  const [options, setOptions] = useState<{ label: string; value: string }[]>(getCache)
  const optionsRef = useRef<{ label: string; value: string }[]>([])

  const onSearch = useCallback(
    debounce(async (text: string) => {
      const res = await queryEnterPriseList(text)
      let newOptions = res.data.map((d) => ({
        label: d.name,
        value: d.id,
      }))
      optionsRef.current = newOptions
      if (text === "") {
        newOptions = getCache()
      }
      setOptions(newOptions)
    }, 300),
    []
  )

  const onSelectionChange = (key: React.Key) => {
    const selectedOption = options.find((option) => option.value === key)
    if (selectedOption) {
      loginData.current.organizationId = selectedOption.value
      setValue(selectedOption.label)
      localStorage.setItem("cachedValue", selectedOption.value)
      localStorage.setItem("cachedLabel", selectedOption.label)
    }
  }

  const onInputChange = (value: string) => {
    setValue(value)
    onSearch(value)
  }

  useEffect(() => {
    onSearch("")
  }, [])

  return (
    <div>
      <Autocomplete
        variant='bordered'
        className='w-full text-white'
        value={value}
        onSelectionChange={onSelectionChange}
        onInputChange={onInputChange}
        placeholder='输入您所在的企业名称'
      >
        {options.map((option) => (
          <AutocompleteItem key={option.value} value={option.value}>
            {option.label}
          </AutocompleteItem>
        ))}
      </Autocomplete>
    </div>
  )
}
