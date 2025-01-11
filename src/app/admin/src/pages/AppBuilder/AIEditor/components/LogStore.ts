interface LogEntry {
  id: string
  timestamp: number
  level: "info" | "warn" | "error" | "debug"
  message: string
  details?: any
}

interface LogCompleteness {
  isComplete: boolean
  missingAspects: {
    timeGaps: boolean
    missingLevels: boolean
    tooOld: boolean
    limitedRange: boolean
  }
  summary: string
}

class LogStore {
  private static instance: LogStore
  private _logs: LogEntry[] = []
  private _listeners: Set<() => void> = new Set()
  private readonly MAX_TIME_GAP = 5 * 60 * 1000 // 5分钟
  private readonly MAX_TIME_SPAN = 60 * 60 * 1000 // 1小时
  private readonly MAX_LOGS = 100 // 最大日志数量

  private constructor() {}

  public static getInstance(): LogStore {
    if (!LogStore.instance) {
      LogStore.instance = new LogStore()
    }
    return LogStore.instance
  }

  get logs(): LogEntry[] {
    return this._logs
  }

  // 获取最新的日志，支持反向排序
  getLatestLogs(count: number = this.MAX_LOGS, reverse: boolean = true): LogEntry[] {
    const sortedLogs = [...this._logs].sort((a, b) => 
      reverse ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    );
    return sortedLogs.slice(0, count);
  }

  // 获取特定级别的最新日志
  getLatestLogsByLevel(level: LogEntry["level"], count: number = this.MAX_LOGS): LogEntry[] {
    return this.getLatestLogs()
      .filter(log => log.level === level)
      .slice(0, count);
  }

  private notify() {
    this._listeners.forEach((listener) => listener())
  }

  subscribe(listener: () => void) {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  }

  addLog(level: LogEntry["level"], message: string, details?: any) {
    const log: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      message,
      details,
    }
    this._logs.push(log)

    // 如果日志超过最大数量限制，只保留最新的日志
    if (this._logs.length > this.MAX_LOGS) {
      this._logs = this._logs.slice(-this.MAX_LOGS)
    }

    this.notify()
  }

  info(message: string, details?: any) {
    this.addLog("info", message, details)
  }

  warn(message: string, details?: any) {
    this.addLog("warn", message, details)
  }

  error(message: string, details?: any) {
    this.addLog("error", message, details)
  }

  debug(message: string, details?: any) {
    this.addLog("debug", message, details)
  }

  clear() {
    this._logs = []
    this.notify()
  }

  filter(options: { level?: LogEntry["level"]; search?: string; startTime?: number; endTime?: number }) {
    return this._logs.filter((log) => {
      if (options.level && log.level !== options.level) return false
      if (options.search && !log.message.toLowerCase().includes(options.search.toLowerCase())) return false
      if (options.startTime && log.timestamp < options.startTime) return false
      if (options.endTime && log.timestamp > options.endTime) return false
      return true
    })
  }

  export() {
    return JSON.stringify(this._logs, null, 2)
  }

  checkLogsCompleteness(logs: LogEntry[] = this._logs): LogCompleteness {
    if (logs.length === 0) {
      return {
        isComplete: false,
        missingAspects: {
          timeGaps: false,
          missingLevels: true,
          tooOld: false,
          limitedRange: true,
        },
        summary: "没有可用的日志",
      }
    }

    const sortedLogs = [...logs].sort((a, b) => a.timestamp - b.timestamp)
    const timeSpan = sortedLogs[sortedLogs.length - 1].timestamp - sortedLogs[0].timestamp
    const hasGaps = this.detectTimeGaps(sortedLogs)
    const { hasMissingLevels, missingLevels } = this.checkLogLevelsPresence(sortedLogs)
    const isLimitedRange = logs.length >= this.MAX_LOGS

    const missingAspects = {
      timeGaps: hasGaps,
      missingLevels: hasMissingLevels,
      tooOld: timeSpan >= this.MAX_TIME_SPAN,
      limitedRange: isLimitedRange,
    }

    let summaryParts = []
    if (missingAspects.timeGaps) {
      summaryParts.push("日志存在时间间隔")
    }
    if (missingAspects.missingLevels) {
      summaryParts.push(`缺少以下级别的日志：${missingLevels.join(", ")}`)
    }
    if (missingAspects.tooOld) {
      summaryParts.push("日志时间跨度超过1小时")
    }
    if (missingAspects.limitedRange) {
      summaryParts.push("仅显示最新的部分日志")
    }

    return {
      isComplete: !hasGaps && !hasMissingLevels && !missingAspects.tooOld && !isLimitedRange,
      missingAspects,
      summary: summaryParts.length > 0 ? summaryParts.join("；") : "日志完整",
    }
  }

  private detectTimeGaps(logs: LogEntry[]): boolean {
    for (let i = 1; i < logs.length; i++) {
      if (logs[i].timestamp - logs[i - 1].timestamp > this.MAX_TIME_GAP) {
        return true
      }
    }
    return false
  }

  private checkLogLevelsPresence(logs: LogEntry[]): { hasMissingLevels: boolean; missingLevels: string[] } {
    const expectedLevels = new Set(["info", "warn", "error", "debug"])
    const presentLevels = new Set(logs.map((log) => log.level))
    const missingLevels = Array.from(expectedLevels).filter((level) => !presentLevels.has(level as LogEntry["level"]))

    return {
      hasMissingLevels: missingLevels.length > 0,
      missingLevels,
    }
  }

  getLogsInTimeRange(startTime: number, endTime: number): LogEntry[] {
    return this._logs.filter((log) => log.timestamp >= startTime && log.timestamp <= endTime)
  }

  getRecentLogs(duration: number = 3600000): LogEntry[] {
    const now = Date.now()
    return this.getLogsInTimeRange(now - duration, now)
  }
}

export const logStore = LogStore.getInstance()