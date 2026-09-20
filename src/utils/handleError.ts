import type { Platform } from 'homebridge-lib/Platform';

import figlet from 'figlet';
import { setTimeout } from 'node:timers/promises';

import getErrorMessage from './getErrorMessage.js';
import { syncWait, waitSeconds } from './timeUtils.js';

type HandleErrorParams = {
  waitMinutes?: number;
  header?: string;
  error?: unknown;
  reason?: string;
};

/**
 * Error handler for catch blocks.
 * Waits for a specified number of minutes before retrying an operation,
 * with optional logging of a header, error message, and reason for the retry.
 * If waitMinutes is set to 0, it will log the messages without waiting before retrying.
 *
 * @template P - The context type for the platform.
 * @param {HandleErrorParams} options - Options for the error handling.
 * @param {number} [options.waitMinutes=0] - The number of minutes to wait before retrying.
 * @param {string} [options.header] - The header message to display.
 * @param {unknown} [options.error] - The error to handle.
 * @param {string} [options.reason] - The reason for the retry.
 */
export async function handleError<P>(
  this: Platform<P>,
  { waitMinutes = 0, header, error, reason }: HandleErrorParams = {},
) {
  if (header) {
    this.error(`\n${figlet.textSync(header)}`);
  }
  if (error) {
    const errorMessage = getErrorMessage(error);
    this.log(errorMessage);
    await waitSeconds(0.01); // Small delay to ensure the error message is logged before the reason message is displayed
  }
  if (reason) {
    this.warn(reason);
  }
  if (waitMinutes > 0) {
    this.warn(`Will retry in ${waitMinutes} minute(s)...`);
    await setTimeout(waitMinutes * 60 * 1000);
  }
}

/**
 * Synchronous error handler for catch blocks.
 * Displays a header message, logs an error message, and waits a specified number of milliseconds before retrying.
 * If waitMilliseconds is set to 0, it logs the messages without waiting before retrying.
 *
 * @template P - The context type for the platform.
 * @param {HandleErrorParams} options - Options for the error handling.
 * @param {number} [options.waitMilliseconds=0] - The number of milliseconds to wait before retrying.
 * @param {string} [options.header] - The header message to display.
 * @param {unknown} [options.error] - The error to handle.
 * @param {string} [options.reason] - The reason for the retry.
 */
export function handleErrorSync<P>(this: Platform<P>, { header, error, reason }: HandleErrorParams = {}) {
  if (header) {
    this.error(`\n${figlet.textSync(header)}`);
  }
  if (error) {
    const errorMessage = getErrorMessage(error);
    this.log(errorMessage);
    syncWait(10);
  }
  if (reason) {
    this.warn(reason);
  }
}
