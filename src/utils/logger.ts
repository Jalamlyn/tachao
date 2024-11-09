type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private static instance: Logger;
  private debugMode: boolean = process.env.NODE_ENV === 'development';

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    if (context) {
      try {
        const contextStr = JSON.stringify(context, null, 2);
        formattedMessage += `\nContext: ${contextStr}`;
      } catch (error) {
        formattedMessage += '\nContext: [Unable to stringify context]';
      }
    }
    
    return formattedMessage;
  }

  private log(level: LogLevel, message: string, error?: Error, context?: LogContext) {
    const formattedMessage = this.formatMessage(level, message, context);
    
    switch (level) {
      case 'debug':
        if (this.debugMode) {
          console.debug(formattedMessage);
          if (error) console.debug(error);
        }
        break;
      case 'info':
        console.info(formattedMessage);
        if (error) console.info(error);
        break;
      case 'warn':
        console.warn(formattedMessage);
        if (error) console.warn(error);
        break;
      case 'error':
        console.error(formattedMessage);
        if (error) console.error(error);
        break;
    }
  }

  public debug(message: string, context?: LogContext) {
    this.log('debug', message, undefined, context);
  }

  public info(message: string, context?: LogContext) {
    this.log('info', message, undefined, context);
  }

  public warn(message: string, context?: LogContext) {
    this.log('warn', message, undefined, context);
  }

  public error(message: string, error: Error, context?: LogContext) {
    this.log('error', message, error, context);
  }

  public setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
  }
}

export const logger = Logger.getInstance();