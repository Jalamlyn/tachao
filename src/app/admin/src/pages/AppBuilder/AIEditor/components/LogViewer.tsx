import React, { useEffect, useState, useRef, useMemo } from "react"
import { ScrollShadow, Chip, Input, Button, Select, SelectItem, Tooltip, Card } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import { logStore } from "./LogStore"
import { cn } from "@/lib/utils"

const LOG_LEVELS = {
  info: {
    color: "primary",
    icon: "solar:info-circle-linear",
    label: "信息",
  },
  warn: {
    color: "warning",
    icon: "solar:danger-triangle-linear",
    label: "警告",
  },
  error: {
    color: "danger",
    icon: "solar:danger-circle-linear",
    label: "错误",
  },
  debug: {
    color: "secondary",
    icon: "solar:bug-minimalistic-linear",
    label: "调试",
  },
}

const LOG_LEVEL_ITEMS = [
  {
    id: "all",
    value: "all",
    label: "全部级别",
    icon: "solar:list-linear",
    color: "default",
  },
  ...Object.entries(LOG_LEVELS).map(([key, config]) => ({
    id: key,
    value: key,
    label: config.label,
    icon: config.icon,
    color: config.color,
  })),
]

interface LogViewerProps {
  className?: string
  maxHeight?: string | number
}

// 防抖 hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const LogHelpTip: React.FC<{ completeness: any }> = ({ completeness }) => {
  if (!completeness || completeness.isComplete) return null;

  return (
    <Card className="p-4 mb-4 bg-default-50">
      <div className="flex items-start gap-2">
        <Icon icon="solar:info-circle-linear" className="text-primary mt-1" />
        <div className="flex-1">
          <p className="text-sm font-medium m-2">日志可能不完整</p>
          <p className="text-sm text-default-600 mb-2">{completeness.summary}</p>
          <div className="text-sm text-default-500">
            <p>建议操作：</p>
            <ul className="list-disc pl-4 mt-1">
              {completeness.missingAspects.timeGaps && (
                <li>使用时间筛选查看特定时间段的日志</li>
              )}
              {completeness.missingAspects.missingLevels && (
                <li>调整日志级别筛选，确保包含所有必要的日志级别</li>
              )}
              {completeness.missingAspects.limitedRange && (
                <li>导出更多日志以获取完整上下文</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};

const LogViewer: React.FC<LogViewerProps> = ({ className, maxHeight = "calc(100vh-250px)" }) => {
  const [logs, setLogs] = useState(logStore.logs)
  const [search, setSearch] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [aiObserving, setAiObserving] = useState(true)
  const [completeness, setCompleteness] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // 使用防抖处理搜索
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const unsubscribe = logStore.subscribe(() => {
      const newLogs = [...logStore.logs]
      setLogs(newLogs)
      // 检查日志完整性
      setCompleteness(logStore.checkLogsCompleteness(newLogs))
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 0)
    })
    return unsubscribe
  }, [])

  // 使用 useMemo 优化过滤逻辑
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesLevel = selectedLevel === "all" || log.level === selectedLevel;
      const matchesSearch = !debouncedSearch || 
        log.message.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [logs, selectedLevel, debouncedSearch]);

  const handleClear = () => {
    logStore.clear()
  }

  const handleExport = () => {
    const blob = new Blob([logStore.export()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `logs-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const AIStatusIndicator = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='flex items-center gap-2 px-3 py-1.5 bg-primary-50/30 rounded-full'
    >
      <motion.div className='w-2 h-2 rounded-full bg-primary' />
      <span className='text-xs text-primary'>AI 正在实时分析日志</span>
    </motion.div>
  )

  return (
    <div className={cn("flex flex-col gap-2 h-[calc(100vh-300px)] overflow-hidden", className)}>
      <div className='flex items-center justify-between mb-2'>
        <div className='flex items-center gap-2'>
          <Input
            size='sm'
            placeholder='搜索日志...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startContent={<Icon icon='solar:magnifer-linear' className='text-default-400' />}
            className='w-64'
          />
          <Select
            size='sm'
            items={LOG_LEVEL_ITEMS}
            selectedKeys={[selectedLevel]}
            onSelectionChange={(keys) => setSelectedLevel(Array.from(keys)[0] as string)}
            className='w-32'
            labelPlacement='outside'
            renderValue={(items) => {
              const item = items[0]
              if (!item) return null

              return (
                <div className='flex items-center gap-2'>
                  <Icon
                    icon={item.data?.icon || "solar:list-linear"}
                    className={`text-${item.data?.color || "default"}`}
                  />
                  <span>{item.data?.label}</span>
                </div>
              )
            }}
          >
            {(item) => (
              <SelectItem key={item.value} textValue={item.label}>
                <div className='flex items-center gap-2'>
                  <Icon icon={item.icon} className={`text-${item.color}`} />
                  <span>{item.label}</span>
                </div>
              </SelectItem>
            )}
          </Select>
          <Chip variant="flat" size="sm" className="bg-default-100">
            共 {logs.length} 条日志
            {filteredLogs.length !== logs.length && ` (已筛选 ${filteredLogs.length} 条)`}
          </Chip>
        </div>
        <div className='flex items-center gap-2'>
          <AIStatusIndicator />
          <Button
            size='sm'
            color='primary'
            variant='flat'
            startContent={<Icon icon='solar:export-line-duotone' />}
            onPress={handleExport}
          >
            导出
          </Button>
          <Button
            size='sm'
            color='danger'
            variant='flat'
            startContent={<Icon icon='solar:trash-bin-minimalistic-linear' />}
            onPress={handleClear}
          >
            清除
          </Button>
        </div>
      </div>

      <LogHelpTip completeness={completeness} />

      <ScrollShadow
        ref={scrollRef}
        className={cn("w-full rounded-lg bg-default-50/50 p-4", className)}
        style={{ maxHeight }}
      >
        <AnimatePresence mode='popLayout'>
          {filteredLogs.length === 0 ? (
            <div className='flex items-center justify-center h-20 text-default-400'>暂无日志</div>
          ) : (
            filteredLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className='relative flex items-start gap-2 mb-2 last:mb-0 p-2 rounded-lg hover:bg-default-100 transition-colors group'
              >
                <Tooltip content={`AI 已分析此日志 ${log.id}`} placement='left'>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1] }}
                    transition={{ delay: 0.5 }}
                    className='absolute right-2 top-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity'
                  >
                    <Icon icon='solar:smart-home-angle-broken' className='w-4 h-4' />
                  </motion.div>
                </Tooltip>
                <Chip
                  size='sm'
                  variant='flat'
                  color={LOG_LEVELS[log.level].color as any}
                  startContent={<Icon icon={LOG_LEVELS[log.level].icon} className='w-3 h-3' />}
                >
                  {LOG_LEVELS[log.level].label}
                </Chip>
                <div className='flex-1 text-sm'>
                  <div className='text-default-400 text-xs mb-1'>{new Date(log.timestamp).toLocaleString()}</div>
                  <div className='whitespace-pre-wrap'>{log.message}</div>
                  {log.details && (
                    <motion.pre
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className='mt-1 p-2 rounded bg-default-100 text-xs overflow-x-auto'
                    >
                      {JSON.stringify(log.details, null, 2)}
                    </motion.pre>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </ScrollShadow>
    </div>
  )
}

export default LogViewer