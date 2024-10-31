import React, { useState, useMemo } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NestedTableProps {
  data: any
  level?: number
}

const ValueDisplay: React.FC<{ value: any }> = ({ value }) => {
  if (value === null || value === undefined) {
    return <span className='text-gray-400'>-</span>
  }
  if (typeof value === "boolean") {
    return <span className={`font-medium ${value ? "text-green-600" : "text-red-600"}`}>{value ? "是" : "否"}</span>
  }
  return <span className='text-gray-700'>{String(value)}</span>
}

const ObjectTable: React.FC<NestedTableProps> = ({ data, level = 0 }) => {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
      <div
        className='flex cursor-pointer items-center gap-2 bg-gray-50 px-4 py-2 hover:bg-gray-100'
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className='h-4 w-4 text-gray-500' />
        ) : (
          <ChevronRight className='h-4 w-4 text-gray-500' />
        )}
        <span className='font-medium text-gray-700'>对象详情</span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <ScrollArea className='h-full w-full'>
              <div className='divide-y divide-gray-200 px-4'>
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className='flex py-2'>
                    <div className='w-40 flex-shrink-0 text-sm font-medium text-gray-500'>{key}</div>
                    <div className='flex-1'>
                      <NestedTable data={value} level={level + 1} />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const ArrayTable: React.FC<NestedTableProps> = ({ data, level = 0 }) => {
  const [expanded, setExpanded] = useState(true)

  const columns = useMemo(() => {
    const keys = new Set<string>()
    data.forEach((item: any) => {
      if (typeof item === "object" && item !== null) {
        Object.keys(item).forEach((key) => keys.add(key))
      }
    })
    return Array.from(keys)
  }, [data])

  return (
    <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
      <div
        className='flex cursor-pointer items-center gap-2 bg-gray-50 px-4 py-2 hover:bg-gray-100'
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? (
          <ChevronDown className='h-4 w-4 text-gray-500' />
        ) : (
          <ChevronRight className='h-4 w-4 text-gray-500' />
        )}
        <span className='font-medium text-gray-700'>列表数据 ({data.length})</span>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <ScrollArea className='h-full w-full'>
              <div className='p-4'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col} className='whitespace-nowrap'>
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((item: any, index: number) => (
                      <TableRow key={index}>
                        {columns.map((col) => (
                          <TableCell key={col} className='min-w-[200px]'>
                            <NestedTable data={item[col]} level={level + 1} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const NestedTable: React.FC<NestedTableProps> = ({ data, level = 0 }) => {
  if (Array.isArray(data)) {
    return <ArrayTable data={data} level={level} />
  }

  if (typeof data === "object" && data !== null) {
    return <ObjectTable data={data} level={level} />
  }

  return <ValueDisplay value={data} />
}

interface FormDataTableProps {
  data: any[]
}

const FormDataTable: React.FC<FormDataTableProps> = ({ data }) => {
  console.log(data)
  if (!data || data.length === 0) {
    return <div className='rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-500'>暂无数据</div>
  }

  return (
    <div className='space-y-4'>
      {data.map((item, index) => (
        <NestedTable key={index} data={item} />
      ))}
    </div>
  )
}

export default FormDataTable
