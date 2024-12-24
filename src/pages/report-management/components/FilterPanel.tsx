import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@nextui-org/react"

// 筛选器面板组件
interface FilterOption {
  type: "text" | "number" | "date"
  label: string
}

interface FilterOptions {
  [key: string]: FilterOption
}

interface FilterPanelProps {
  options: FilterOptions
  current: any
  onFilterChange: (filters: any) => void
}

const FilterPanel: React.FC<FilterPanelProps> = ({ options, current, onFilterChange }) => {
  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({
      ...current,
      [key]: value,
    })
  }
  // debugger
  return (
    <Card className='mb-4'>
      <CardHeader>
        <CardTitle className='text-lg'>数据筛选</CardTitle>
        <CardDescription>设置筛选条件以查看特定数据</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Object.entries(options).map(([key, option]) => (
            <div key={key} className='space-y-2'>
              <label className='text-sm font-medium text-gray-700'>{option.label}</label>
              {option.type === "date" ? (
                <Input
                  type='date'
                  value={current[key] || ""}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className='w-full'
                />
              ) : option.type === "number" ? (
                <Input
                  type='number'
                  value={current[key] || ""}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className='w-full'
                />
              ) : (
                <Input
                  value={current[key] || ""}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className='w-full'
                />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default FilterPanel