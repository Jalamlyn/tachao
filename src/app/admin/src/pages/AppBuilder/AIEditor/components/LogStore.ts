interface LogEntry {
  id: string
  timestamp: number
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  details?: any
}

class LogStore {
  private static instance: LogStore
  private _logs: LogEntry[] = []
  private _listeners: Set<() => void> = new Set()

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

  private notify() {
    this._listeners.forEach(listener => listener())
  }

  subscribe(listener: () => void) {
    this._listeners.add(listener)
    return () => {
      this._listeners.delete(listener)
    }
  }

  addLog(level: LogEntry['level'], message: string, details?: any) {
    const log: LogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      level,
      message,
      details
    }
    this._logs.push(log)
    this.notify()
  }

  info(message: string, details?: any) {
    this.addLog('info', message, details)
  }

  warn(message: string, details?: any) {
    this.addLog('warn', message, details)
  }

  error(message: string, details?: any) {
    this.addLog('error', message, details)
  }

  debug(message: string, details?: any) {
    this.addLog('debug', message, details)
  }

  clear() {
    this._logs = []
    this.notify()
  }

  filter(options: {
    level?: LogEntry['level']
    search?: string
    startTime?: number
    endTime?: number
  }) {
    return this._logs.filter(log => {
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
}

export const logStore = LogStore.getInstance()