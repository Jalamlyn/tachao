import { logger } from "./logger"

interface LogEntry {
  time: number
  message: string
  data?: any
  stack?: string
}

class AITraceLogger {
  private static instance: AITraceLogger
  private logs: Map<string, LogEntry[]> = new Map()
  private currentTraceId: string = ""

  private constructor() {}

  static getInstance() {
    if (!this.instance) {
      this.instance = new AITraceLogger()
    }
    return this.instance
  }

  startTrace() {
    this.currentTraceId = Math.random().toString(36).substring(2, 15)
    logger.debug("Started new trace", { traceId: this.currentTraceId })
    return this.currentTraceId
  }

  log(message: string, data?: any) {
    if (!this.currentTraceId) {
      this.startTrace()
    }

    const logEntry: LogEntry = {
      time: Date.now(),
      message,
      data,
      stack: new Error().stack?.split("\n")[2], // 只保留调用位置
    }

    // 同时输出到控制台和存储
    console.log(`[${this.currentTraceId}] ${message}`, data || "")

    if (!this.logs.has(this.currentTraceId)) {
      this.logs.set(this.currentTraceId, [])
    }
    this.logs.get(this.currentTraceId)?.push(logEntry)

    return this.currentTraceId
  }

  error(error: Error) {
    const traceId = this.currentTraceId
    this.log("ERROR", {
      message: error.message,
      stack: error.stack,
    })

    // 输出完整日志
    this.printTrace(traceId)

    // 清理旧的日志
    this.cleanOldLogs()
  }

  printTrace(traceId: string) {
    const logs = this.logs.get(traceId)
    if (!logs) {
      console.log("No logs found for traceId:", traceId)
      return
    }

    const output = [`=== Trace Log (${traceId}) ===\n`]

    logs.forEach((log, index) => {
      output.push(`[${index + 1}] ${new Date(log.time).toISOString()}`)
      output.push(`Message: ${log.message}`)
      if (log.data) output.push(`Data: ${JSON.stringify(log.data, null, 2)}`)
      if (log.stack) output.push(`Location: ${log.stack}`)
      output.push("") // 空行分隔
    })

    // 将所有日志作为一个字符串输出，方便复制
    const fullLog = output.join("\n")
    console.log(fullLog)
  }

  private cleanOldLogs(maxAgeMs: number = 30 * 60 * 1000) {
    // 默认保留30分钟
    const now = Date.now()
    for (const [traceId, logs] of this.logs.entries()) {
      if (logs[logs.length - 1].time < now - maxAgeMs) {
        this.logs.delete(traceId)
      }
    }
  }

  getCurrentTraceId() {
    return this.currentTraceId
  }
}

// 创建一个更简单的全局接口
export const aiLog = {
  start: () => AITraceLogger.getInstance().startTrace(),
  log: (message: string, data?: any) => AITraceLogger.getInstance().log(message, data),
  error: (error: Error) => AITraceLogger.getInstance().error(error),
  print: (traceId: string) => AITraceLogger.getInstance().printTrace(traceId),
  currentTrace: () => AITraceLogger.getInstance().getCurrentTraceId(),
}
