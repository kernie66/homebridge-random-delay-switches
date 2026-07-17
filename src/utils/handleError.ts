import type { Delegate } from 'homebridge-lib/Delegate';

import figlet from 'figlet';
import { setTimeout } from 'node:timers/promises';

import { getErrorMessage } from './getErrorMessage.js';

interface HandleErrorParams {
  waitMinutes?: number;
  header?: string;
  error?: unknown;
  reason?: string;
}

// Error handler for catch blocks.
// Waits for a specified number of minutes before retrying an operation,
// with optional logging of a header, error message, and reason for the retry.
// If waitMinutes is set to 0, it will log the messages without waiting before retrying.
export async function handleError(this: Delegate, { waitMinutes = 0, header, error, reason }: HandleErrorParams = {}) {
  if (header) {
    this.error(`\n${figlet.textSync(header)}`);
  }
  if (error) {
    const errorMessage = getErrorMessage(error);
    this.log(errorMessage);
    await setTimeout(100); // Small delay to ensure the error message is logged before the reason message is displayed
  }
  if (reason) {
    this.warn(reason);
  }
  if (waitMinutes > 0) {
    this.warn(`Will retry in ${waitMinutes} minute(s)...`);
    await setTimeout(waitMinutes * 60 * 1000);
  }
}

// Synchronous version with IIFE async wait function
export function handleErrorSync(this: Delegate, { waitMinutes = 0, header, error, reason }: HandleErrorParams = {}) {
  if (header) {
    this.error(`\n${figlet.textSync(header)}`);
  }
  if (error) {
    const errorMessage = getErrorMessage(error);
    this.log(errorMessage);
    void (async () => {
      await setTimeout(100); // Small delay to ensure the error message is logged before the reason message is displayed
    })();
  }
  if (reason) {
    this.warn(reason);
  }
  if (waitMinutes > 0) {
    this.warn(`Will retry in ${waitMinutes} minute(s)...`);
    void (async () => {
      await setTimeout(waitMinutes * 60 * 1000);
    })();
  }
}
