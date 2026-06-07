#!/usr/bin/env node

/**
 * Logger utility - Centralized logging for all agents
 * Color-coded terminal output with timestamps
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function getTimestamp() {
  return new Date().toISOString();
}

function formatMessage(level, message) {
  return `[${getTimestamp()}] [${level}] ${message}`;
}

function writeToFile(message) {
  const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, message + '\n');
}

export const logger = {
  info: (message) => {
    const formatted = formatMessage('INFO', message);
    console.log(`${colors.blue}${formatted}${colors.reset}`);
    writeToFile(formatted);
  },

  success: (message) => {
    const formatted = formatMessage('SUCCESS', message);
    console.log(`${colors.green}${colors.bright}${formatted}${colors.reset}`);
    writeToFile(formatted);
  },

  warn: (message) => {
    const formatted = formatMessage('WARN', message);
    console.log(`${colors.yellow}${formatted}${colors.reset}`);
    writeToFile(formatted);
  },

  error: (message) => {
    const formatted = formatMessage('ERROR', message);
    console.error(`${colors.red}${colors.bright}${formatted}${colors.reset}`);
    writeToFile(formatted);
  },

  debug: (message) => {
    const formatted = formatMessage('DEBUG', message);
    console.log(`${colors.dim}${formatted}${colors.reset}`);
    writeToFile(formatted);
  },

  section: (title) => {
    const line = '═'.repeat(50);
    console.log(`\n${colors.cyan}${colors.bright}${line}\n${title}\n${line}${colors.reset}\n`);
  },
};
