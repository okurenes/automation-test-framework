export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const LOG_COLORS = {
  [LogLevel.DEBUG]: '\x1b[36m',  // cyan
  [LogLevel.INFO]: '\x1b[32m',   // green
  [LogLevel.WARN]: '\x1b[33m',   // yellow
  [LogLevel.ERROR]: '\x1b[31m',  // red
};

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

export class Logger {
  private context: string;
  private static level: LogLevel = LogLevel.INFO;

  constructor(context: string) {
    this.context = context;
  }

  static setLevel(level: LogLevel): void {
    Logger.level = level;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level].padEnd(5);
    const color = LOG_COLORS[level];
    return `${color}${BOLD}[${timestamp}]${RESET} ${color}[${levelName}]${RESET} [${this.context}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (Logger.level <= LogLevel.DEBUG) {
      const formatted = this.formatMessage(LogLevel.DEBUG, message);
      // eslint-disable-next-line no-console
      console.log(formatted, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (Logger.level <= LogLevel.INFO) {
      const formatted = this.formatMessage(LogLevel.INFO, message);
      // eslint-disable-next-line no-console
      console.log(formatted, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (Logger.level <= LogLevel.WARN) {
      const formatted = this.formatMessage(LogLevel.WARN, message);
      console.warn(formatted, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (Logger.level <= LogLevel.ERROR) {
      const formatted = this.formatMessage(LogLevel.ERROR, message);
      console.error(formatted, ...args);
    }
  }

  step(stepNumber: number, description: string): void {
    this.info(`Step ${stepNumber}: ${description}`);
  }

  startTest(testName: string): void {
    this.info(`${'═'.repeat(60)}`);
    this.info(`▶ TEST START: ${testName}`);
    this.info(`${'═'.repeat(60)}`);
  }

  endTest(testName: string, passed: boolean): void {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    this.info(`${'═'.repeat(60)}`);
    this.info(`${status}: ${testName}`);
    this.info(`${'═'.repeat(60)}`);
  }
}
