import * as winston from 'winston';
require('winston-daily-rotate-file');
import localStorage from './local-storage';

class Logger {
  logger: winston.LoggerInstance;

  constructor(serviceName: string | undefined) {
    const rotateTransport = new winston.transports.DailyRotateFile({
      filename: 'log/log',
      datePattern: 'yyyy-MM-dd.',
      prepend: true,
      level: process.env.LOGLEVEL || 'info',
      silent: process.env.NODE_ENV === 'test',
    });

    this.logger = new winston.Logger({
      /* istanbul ignore next */
      level: process.env.LOGLEVEL || 'info',
      transports: [rotateTransport],
      defaultMeta: {
        service: serviceName,
      },
    });

    this.logger.add(winston.transports.Console, {
      name: 'console.info',
      colorize: true,
      showLevel: true,
      level: process.env.LOGLEVEL || 'info',
      silent: process.env.NODE_ENV === 'test',
    });

    this.logger.setLevels(winston.config.syslog.levels);
  }

  debug(log: string, metadata: unknown = {}) {
    const meta = Object.assign(metadata, this.getLocalMetadata());
    this.logger.debug(log, meta);
  }

  info(log: string, metadata: unknown = {}) {
    const meta = Object.assign(metadata, this.getLocalMetadata());
    this.logger.info(log, meta);
  }

  warning(log: string, metadata: unknown = {}) {
    const meta = Object.assign(metadata, this.getLocalMetadata());
    this.logger.warning(log, meta);
  }

  error(log: string, metadata: unknown = {}) {
    const meta = Object.assign(metadata, this.getLocalMetadata());
    this.logger.error(log, meta);
  }

  /**
   * NB! This log level triggers an email warning. Consider if an error is more appropriate.
   *
   * @param log
   * @param metadata
   */
  crit(log: string, metadata: unknown = {}) {
    const meta = Object.assign(metadata, this.getLocalMetadata());
    this.logger.crit(log, meta);
  }

  private getLocalMetadata() {
    const { requestId } = localStorage.getStore();
    if (!requestId) {
      // Return an empty object to avoid logging metadata requestId=undefined
      return {};
    }
    return {
      requestId,
    };
  }
}

export default new Logger(process.env.APP_NAME);
