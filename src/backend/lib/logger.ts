import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR);
}

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

class Logger {
  private logFile: string;

  constructor() {
    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(LOG_DIR, `${date}.log`);
  }

  private write(level: LogLevel, message: string, context?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context: context || null
    };

    const logString = JSON.stringify(logEntry) + '\n';
    
    // Print to console for dev
    if (level === 'ERROR') {
      console.error(`[${level}] ${message}`, context || '');
    } else {
      console.log(`[${level}] ${message}`, context || '');
    }

    // Append to file
    fs.appendFileSync(this.logFile, logString);
  }

  info(message: string, context?: any) {
    this.write('INFO', message, context);
  }

  warn(message: string, context?: any) {
    this.write('WARN', message, context);
  }

  error(message: string, context?: any) {
    this.write('ERROR', message, context);
  }

  debug(message: string, context?: any) {
    this.write('DEBUG', message, context);
  }
}

export const logger = new Logger();
