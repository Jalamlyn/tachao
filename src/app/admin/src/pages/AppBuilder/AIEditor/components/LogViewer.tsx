import React, { useEffect, useState, useRef } from "react"
import { ScrollShadow, Chip, Input, Button, Select, SelectItem } from "@nextui-org/react"
import { Icon } from "@iconify/react"
import { motion, AnimatePresence } from "framer-motion"
import { logStore } from "./LogStore"
import { cn } from "@/lib/utils"

const LOG_LEVELS = {
  info: {
    color: "primary",
    icon: "solar:info-circle-linear",
  },
  warn: {
    color: "warning",
    icon: "solar:danger-triangle-linear",
  },
  error: {
    color: "danger",
    icon: "solar:danger-circle-linear",
  },
  debug: {
    color: "secondary",
    icon: "solar:bug-minimalistic-linear",
  },
}

interface LogViewerProps {
  className?: string
  maxHeight?: string | number
}

const LogViewer: React.FC<LogViewerProps> = ({ className, maxHeight = "300px" }) => {
  const [logs, setLogs] = useState(logStore.logs)
  const [search, setSearch] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsubscribe = logStore.subscribe(() => {
      setLogs([...logStore.logs])
      // 自动滚动到底部
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 0)
    })
    return unsubscribe
  }, [])

  const filteredLogs = logs.filter(log => {
    if (selectedLevel !== "all" && log.level !== selectedLevel) return false
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

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

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <Input
          size="sm"
          placeholder="搜索日志..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          startContent={<Icon icon="solar:magnifer-linear" className="text-default-400" />}
          className="flex-1"
        />
        <Select
          size="sm"
          selectedKeys={[selectedLevel]}
          onChange={e => setSelectedLevel(e.target.value)}
          className="w-32"
        >
          <SelectItem key="all" value="all">
            全部级别
          </SelectItem>
          {Object.entries(LOG_LEVELS).map(([level, config]) => (
            <SelectItem key={level} value={level}>
              <div className="flex items-center gap-1">
                <Icon icon={config.icon} className={`text-${config.color}`} />
                {level.toUpperCase()}
              </div>
            </SelectItem>
          ))}
        </Select>
        <Button
          size="sm"
          color="primary"
          variant="flat"
          startContent={<Icon icon="solar:export-line-duotone" />}
          onPress={handleExport}
        >
          导出
        </Button>
        <Button
          size="sm"
          color="danger"
          variant="flat"
          startContent={<Icon icon="solar:trash-bin-minimalistic-linear" />}
          onPress={handleClear}
        >
          清除
        </Button>
      </div>

      <ScrollShadow
        ref={scrollRef}
        className={cn("w-full rounded-lg bg-default-50/50 p-4", className)}
        style={{ maxHeight }}
      >
        <AnimatePresence mode="popLayout">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-default-400">
              暂无日志
            </div>
          ) : (
            filteredLogs.map(log => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-start gap-2 mb-2 last:mb-0"
              >
                <Chip
                  size="sm"
                  variant="flat"
                  color={LOG_LEVELS[log.level].color as any}
                  startContent={<Icon icon={LOG_LEVELS[log.level].icon} className="w-3 h-3" />}
                >
                  {log.level.toUpperCase()}
                </Chip>
                <div className="flex-1 text-sm">
                  <div className="text-default-400 text-xs mb-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                  <div className="whitespace-pre-wrap">{log.message}</div>
                  {log.details && (
                    <pre className="mt-1 p-2 rounded bg-default-100 text-xs overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
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