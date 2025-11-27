/**
 * Converts a string representing milliseconds to seconds.
 *
 * @param {StringValue} msValue - The string value representing milliseconds.
 * @return {number} - The converted value in seconds.
 */ import type { StringValue } from 'ms';

import ms from 'ms';

export function seconds(msValue: string): number {
  return ms(msValue as StringValue) / 1000;
}
