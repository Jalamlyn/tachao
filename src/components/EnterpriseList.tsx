import React, { useState, useEffect, useRef, useCallback } from "react"
import { Autocomplete, AutocompleteItem, Spinner } from "@nextui-org/react"
import { queryEnterPriseList } from "@/service/apis/api"
import { debounce } from "lodash"
import { motion, AnimatePresence } from "framer-motion"
import { message } from "./Message"

interface EnterpriseOption {
  label: string
  value: string
}

interface EnterpriseListProps {
  loginData: {
    current: {
      organizationId: string
      enterpriseName: string
    }
  }
}

const getCache = (): EnterpriseOption[] => {
  const cachedValue = localStorage.getItem("cachedValue")
  const cachedLabel = localStorage.getItem("cachedLabel")
  return cachedValue && cachedLabel
    ? [
        {
          label: cachedLabel,
          value: cachedValue,
        },
      ]
    : []
}

const EnterpriseList: React.FC<EnterpriseListProps> = ({ loginData }) => {
  const [value, setValue] = useState(() => {
    const cachedLabel = localStorage.getItem("cachedLabel")
    return cachedLabel || ""
  })
  const [options, setOptions] = useState<EnterpriseOption[]>(getCache)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const optionsRef = useRef<EnterpriseOption[]>([])

  const onSearch = useCallback(
    debounce(async (text: string) => {
      try {
        setIsLoading(true)
        setError(null)
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
      } catch (err) {
        setError("获取企业列表失败，请重试")
        message.error("获取企业列表失败，请重试")
      } finally {
        setIsLoading(false)
      }
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Autocomplete
        variant="bordered"
        size="lg"
        value={value}
        onSelectionChange={onSelectionChange}
        onInputChange={onInputChange}
        placeholder="输入您所在的企业名称"
        isLoading={isLoading}
        errorMessage={error}
        classNames={{
          base: "max-w-full",
          listbox: "max-h-[320px]",
          selectorButton: "text-white",
          value: "text-white",
          input: "text-white",
          label: "text-white",
        }}
        listboxProps={{
          itemClasses: {
            base: [
              "rounded-md",
              "text-default-500",
              "transition-opacity",
              "data-[hover=true]:text-foreground",
              "dark:data-[hover=true]:bg-default-50",
              "data-[pressed=true]:opacity-70",
              "data-[hover=true]:bg-default-100",
              "data-[selectable=true]:focus:bg-default-100",
              "data-[selected=true]:bg-default-100",
              "data-[selected=true]:text-primary",
            ],
          },
        }}
        endContent={
          isLoading && (
            <Spinner size="sm" color="current" className="text-white/50" />
          )
        }
      >
        {options.map((option) => (
          <AutocompleteItem key={option.value} value={option.value}>
            {option.label}
          </AutocompleteItem>
        ))}
      </Autocomplete>
    </motion.div>
  )
}

export default EnterpriseList