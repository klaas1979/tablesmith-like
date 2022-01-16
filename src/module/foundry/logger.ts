import { getGame, TABLESMITH_ID } from './helper';

/**
 * Log levels for this logger.
 */
export const enum LOG_LEVEL {
  NONE = 0,
  INFO = 1,
  ERROR = 2,
  DEBUG = 3,
  WARN = 4,
  ALL = 5,
}

/**
 * Module data for Module dev-mode:
 * https://github.com/League-of-Foundry-Developers/foundryvtt-devMode
 */
export interface DevModeModuleData {
  api: DevModeApi;
}

/**
 * API of DevMode Plugin regarding logging. Used in registering with module.
 */
export interface DevModeApi {
  registerPackageDebugFlag(
    packageName: string,
    kind?: 'boolean' | 'level',
    options?: {
      default?: boolean | LOG_LEVEL;
      choiceLabelOverrides?: Record<string, string>; // actually keyed by LogLevel number
    },
  ): Promise<boolean>;

  getPackageDebugValue(packageName: string, kind?: 'boolean' | 'level'): boolean | LOG_LEVEL;
}

export class Logger {
  /**
   * Logging helper to log with dev-mode setting to console.
   * @param level the log level to log under.
   * @param force Force logging regardless of log settings.
   * @param args array of objects to log.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static log(level: number, force: boolean, ...args: any[]) {
    const devModeApiModuleData = getGame().modules.get('_dev-mode') as unknown as DevModeModuleData;
    let shouldLog = force;
    if (!shouldLog) {
      const logLevel = devModeApiModuleData?.api?.getPackageDebugValue(TABLESMITH_ID, 'level');
      shouldLog = logLevel >= level;
    }
    if (shouldLog) {
      const allArgs = [TABLESMITH_ID, '|', ...args];
      switch (level) {
        case LOG_LEVEL.DEBUG:
          console.debug(...allArgs);
          break;
        case LOG_LEVEL.INFO:
          console.info(...allArgs);
          break;
        case LOG_LEVEL.WARN:
          console.warn(...allArgs);
          break;
        case LOG_LEVEL.ERROR:
          console.error(...allArgs);
          break;
        default:
          console.log(...allArgs);
          break;
      }
    }
  }

  /**
   * Logging helper to log with dev-mode setting to console.
   * @param force Force logging regardless of log settings.
   * @param args array of objects to log.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static info(force: boolean, ...args: any[]) {
    this.log(LOG_LEVEL.INFO, force, args);
  }

  /**
   * Logging helper to log with dev-mode setting to console.
   * @param force Force logging regardless of log settings.
   * @param args array of objects to log.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static error(force: boolean, ...args: any[]) {
    this.log(LOG_LEVEL.ERROR, force, args);
  }

  /**
   * Logging helper to log with dev-mode setting to console.
   * @param force Force logging regardless of log settings.
   * @param args array of objects to log.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static debug(force: boolean, ...args: any[]) {
    this.log(LOG_LEVEL.DEBUG, force, args);
  }

  /**
   * Logging helper to log with dev-mode setting to console.
   * @param force Force logging regardless of log settings.
   * @param args array of objects to log.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static warn(force: boolean, ...args: any[]) {
    this.log(LOG_LEVEL.WARN, force, args);
  }
}
