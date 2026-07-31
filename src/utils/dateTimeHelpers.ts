// Functions for DateTime usage
// Copyright © 2022-2025 Kenneth Jagenheim. All rights reserved.
//

// Gets the current timestamp in seconds
export function getTimestamp() {
  return Date.now() / 1000;
}

// Convert Unix timestamp in seconds to Eve display format
export function toEveDate(timestamp: number) {
  return String(new Date(timestamp * 1000)).slice(0, 24);
}

// Convert ISO datetime to Eve display format
export function isoDateTimeToEveDate(isoDateTime?: string | Date) {
  if (!isoDateTime) {
    const date = new Date();
    isoDateTime = date.toISOString();
  }
  if (isoDateTime instanceof Date) {
    isoDateTime = isoDateTime.toISOString();
  }
  if (!isoDateTime.includes('Z')) {
    isoDateTime = `${isoDateTime}Z`;
  }
  return String(new Date(isoDateTime)).slice(0, 24);
}
