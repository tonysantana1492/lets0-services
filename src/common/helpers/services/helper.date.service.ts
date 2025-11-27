import type {
  IHelperDateExtractDate,
  IHelperDateOptionsBackward,
  IHelperDateOptionsCreate,
  IHelperDateOptionsDiff,
  IHelperDateOptionsFormat,
  IHelperDateOptionsForward,
  IHelperDateOptionsRoundDown,
  IHelperDateService,
  IHelperDateStartAndEnd,
  IHelperDateStartAndEndDate,
} from '@/common/helpers/interfaces/helper.date-service.interface';
import { Injectable } from '@nestjs/common';

import { parse } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import moment from 'moment';

import {
  ENUM_HELPER_DATE_DIFF,
  ENUM_HELPER_DATE_FORMAT,
} from '@/common/helpers/constants/helper.enum.constant';

@Injectable()
export class HelperDateService implements IHelperDateService {
  /**
   * Calculates the age in years based on the given date of birth and an optional year to calculate age in.
   *
   * @param {Date} dateOfBirth - The date of birth to calculate the age from.
   * @param {number} [year] - The optional year to calculate the age in. If not provided, the current year is used.
   * @return {number} The calculated age in years.
   */
  calculateAge(dateOfBirth: Date, year?: number): number {
    const m = moment();

    if (year) {
      m.set('year', year);
    }

    return m.diff(dateOfBirth, 'years');
  }

  /**
   * Calculates the difference between two dates in the specified format.
   *
   * @param {Date} dateOne - The first date.
   * @param {Date} dateTwoMoreThanDateOne - The second date, which must be greater or equal to dateOne.
   * @param {IHelperDateOptionsDiff} [options] - The optional options to specify the format.
   * @returns {number} - The difference between the two dates in the specified format.
   */
  diff(dateOne: Date, dateTwoMoreThanDateOne: Date, options?: IHelperDateOptionsDiff): number {
    const mDateOne = moment(dateOne);
    const mDateTwo = moment(dateTwoMoreThanDateOne);
    const diff = moment.duration(mDateTwo.diff(mDateOne));

    switch (options?.format) {
      case ENUM_HELPER_DATE_DIFF.MILIS: {
        return diff.asMilliseconds();
      }

      case ENUM_HELPER_DATE_DIFF.SECONDS: {
        return diff.asSeconds();
      }

      case ENUM_HELPER_DATE_DIFF.HOURS: {
        return diff.asHours();
      }

      case ENUM_HELPER_DATE_DIFF.MINUTES: {
        return diff.asMinutes();
      }

      default: {
        return diff.asDays();
      }
    }
  }

  /**
   * Checks if the given date is in the format 'YYYY-MM-DD' and returns true if it is a valid date, otherwise returns false.
   *
   * @param {string | Date | number} date - The date to be checked.
   * @return {boolean} - True if the date is valid, false otherwise.
   */

  check(date: string | Date | number): boolean {
    return moment(date, 'YYYY-MM-DD', true).isValid();
  }

  /**
   * Check if the given date, expressed as a string, Date object, or number, is a valid date.
   * Uses the moment.js library to parse and validate the date.
   *
   * @param {string | Date | number} date - The date to check.
   * @return {boolean} - True if the date is valid, false otherwise.
   */
  checkDateTime(date: string | Date | number): boolean {
    return moment(date, moment.ISO_8601, true).isValid();
  }

  /**
   * Checks if a given timestamp is valid.
   *
   * @param {number} timestamp - The timestamp to be checked.
   * @return {boolean} - Returns true if the timestamp is valid, otherwise false.
   */
  checkTimestamp(timestamp: number): boolean {
    return moment(timestamp, true).isValid();
  }

  /**
   * Creates a new Date object based on the given date and options.
   *
   * @param {string | number | Date} [date] - The date value. If not provided, the current date and time will be used.
   * @param {IHelperDateOptionsCreate} [options] - The options for creating the date object.
   * @param {boolean} [options.startOfDay] - If true, the time portion of the date will be set to 00:00:00.
   *
   * @return {Date} - The created Date object.
   */
  create(date?: string | number | Date, options?: IHelperDateOptionsCreate): Date {
    const mDate = moment(date ?? undefined);

    if (options?.startOfDay) {
      mDate.startOf('day');
    }

    return mDate.toDate();
  }

  /**
   * Convert a date to a timestamp.
   *
   * @param {string | number | Date} date - The date to convert. If not provided, the current date will be used.
   * @param {IHelperDateOptionsCreate} [options] - Optional configuration for the conversion process.
   * @param {boolean} [options.startOfDay=false] - Set to true to start the date at the beginning of the day.
   *
   * @return {number} - The timestamp value of the date.
   */
  timestamp(date?: string | number | Date, options?: IHelperDateOptionsCreate): number {
    const mDate = moment(date);

    if (options?.startOfDay) {
      mDate.startOf('day');
    }

    return mDate.valueOf();
  }

  /**
   * Formats a given date using Moment.js library.
   *
   * @param {Date} date - The date to be formatted.
   * @param {IHelperDateOptionsFormat} [options] - The formatting options (optional).
   * @returns {string} The formatted date string.
   */
  format(date: Date, options?: IHelperDateOptionsFormat): string {
    return moment(date).format(options?.format ?? ENUM_HELPER_DATE_FORMAT.DATE);
  }

  /**
   * Adds the specified number of milliseconds to the given date and returns the result.
   *
   * @param milliseconds - The number of milliseconds to add.
   * @param options - Optional configuration options.
   * @param options.fromDate - The date from which to start adding the milliseconds. If not provided, the current date is used.
   * @returns The resulting date after adding the specified milliseconds.
   */
  forwardInMilliseconds(milliseconds: number, options?: IHelperDateOptionsForward): Date {
    return moment(options?.fromDate).add(milliseconds, 'ms').toDate();
  }

  /**
   * Subtracts given number of milliseconds from a given date.
   *
   * @param {number} milliseconds - The number of milliseconds to subtract.
   * @param {IHelperDateOptionsBackward} [options] - Optional configuration for the subtraction.
   * @returns {Date} - The resulting date after subtracting the milliseconds.
   */
  backwardInMilliseconds(milliseconds: number, options?: IHelperDateOptionsBackward): Date {
    return moment(options?.fromDate).subtract(milliseconds, 'ms').toDate();
  }

  /**
   * Moves the given number of seconds forward from the specified date.
   *
   * @param {number} seconds - The number of seconds to move forward.
   * @param {IHelperDateOptionsForward} [options] - Optional parameters for the forward operation.
   * @returns {Date} - The resulting date after moving forward.
   */
  forwardInSeconds(seconds: number, options?: IHelperDateOptionsForward): Date {
    return moment(options?.fromDate).add(seconds, 's').toDate();
  }

  /**
   * Subtracts the specified number of seconds from a given date and returns the resultant date.
   *
   * @param {number} seconds - The number of seconds to subtract.
   * @param {IHelperDateOptionsBackward} [options] - The optional options for the backward calculation.
   * @returns {Date} - The resultant date after subtracting the specified number of seconds.
   */
  backwardInSeconds(seconds: number, options?: IHelperDateOptionsBackward): Date {
    return moment(options?.fromDate).subtract(seconds, 's').toDate();
  }

  /**
   * Forward the given number of minutes from the specified date.
   *
   * @param {number} minutes - The number of minutes to forward.
   * @param {IHelperDateOptionsForward} [options] - The optional options for the forward calculation.
   * @return {Date} - The resulting date after forwarding the specified number of minutes.
   */
  forwardInMinutes(minutes: number, options?: IHelperDateOptionsForward): Date {
    return moment(options?.fromDate).add(minutes, 'm').toDate();
  }

  /**
   * Subtracts the given number of minutes from the provided date/time, and returns the resulting date.
   *
   * @param {number} minutes - The number of minutes to subtract.
   * @param {IHelperDateOptionsBackward} [options] - Optional configuration options.
   * @returns {Date} - The resulting date after subtracting the specified number of minutes.
   */
  backwardInMinutes(minutes: number, options?: IHelperDateOptionsBackward): Date {
    return moment(options?.fromDate).subtract(minutes, 'm').toDate();
  }

  /**
   * Moves a given date forward by the specified number of hours.
   *
   * @param {number} hours - The number of hours to move forward.
   * @param {IHelperDateOptionsForward} [options] - The options for moving the date forward.
   * @return {Date} - The resulting date after moving it forward by the specified number of hours.
   */
  forwardInHours(hours: number, options?: IHelperDateOptionsForward): Date {
    return moment(options?.fromDate).add(hours, 'h').toDate();
  }

  /**
   * Calculates the date and time that is a specified number of hours in the past.
   *
   * @param {number} hours - The number of hours to subtract.
   * @param {IHelperDateOptionsBackward} [options] - Additional options for calculating the date and time.
   * @returns {Date} - The calculated date and time.
   */
  backwardInHours(hours: number, options?: IHelperDateOptionsBackward): Date {
    return moment(options?.fromDate).subtract(hours, 'h').toDate();
  }

  /**
   * Moves the provided date forward by the specified number of days.
   *
   * @param {number} days - The number of days to move forward.
   * @param {IHelperDateOptionsForward} [options] - Optional additional options.
   * @returns {Date} - The new date after moving forward.
   */
  forwardInDays(days: number, options?: IHelperDateOptionsForward): Date {
    return moment(options?.fromDate).add(days, 'd').toDate();
  }

  /**
   * Returns a new date that is a specified number of days before the given from date.
   * @param {number} days - The number of days to subtract from the given date.
   * @param {IHelperDateOptionsBackward} [options] - The optional options object.
   * @param {Date} [options.fromDate] - The date from which the days should be subtracted. If not provided, the current date will be used.
   * @return {Date} - A new date that is the specified number of days before the given from date.
   */
  backwardInDays(days: number, options?: IHelperDateOptionsBackward): Date {
    return moment(options?.fromDate).subtract(days, 'd').toDate();
  }

  /**
   * Move forward in the given number of months from the provided date.
   *
   * @param {number} months - The number of months to move forward.
   * @param {IHelperDateOptionsForward} [options] - Additional options (optional).
   * @returns {Date} - The resulting date after moving forward in months.
   */
  forwardInMonths(months: number, options?: IHelperDateOptionsForward): Date {
    return moment(options?.fromDate).add(months, 'M').toDate();
  }

  /**
   * Calculates the date that is `months` number of months before the given date.
   *
   * @param {number} months - The number of months to subtract.
   * @param {IHelperDateOptionsBackward} [options] - The options for backward calculation. Optional.
   * @returns {Date} - The calculated date.
   */
  backwardInMonths(months: number, options?: IHelperDateOptionsBackward): Date {
    return moment(options?.fromDate).subtract(months, 'M').toDate();
  }

  /**
   * Sets the date to the end of the month for the given input date.
   *
   * @param {Date} [date] - The input date. If not provided, the current date will be used.
   * @return {Date} - The date set to the end of the month.
   */
  endOfMonth(date?: Date): Date {
    return moment(date).endOf('month').toDate();
  }

  /**
   * Returns the start of the month for the given date.
   * If no date is provided, the current date is used.
   *
   * @param {Date} [date] - The date for which to find the start of the month. If not provided, the current date is used.
   * @return {Date} - The start of the month for the given date.
   */
  startOfMonth(date?: Date): Date {
    return moment(date).startOf('month').toDate();
  }

  /**
   * Returns the end of year for the given date.
   *
   * @param {Date} [date] - The date for which the end of year should be calculated.
   *                       If not provided, the current date is used.
   * @return {Date} - The end of year as a Date object.
   */
  endOfYear(date?: Date): Date {
    return moment(date).endOf('year').toDate();
  }

  /**
   * Returns the start of the year for a given date.
   *
   * @param {Date} [date] - The date for which to find the start of the year. If not provided, the current date is used.
   * @return {Date} The start of the year as a Date object.
   */
  startOfYear(date?: Date): Date {
    return moment(date).startOf('year').toDate();
  }

  /**
   * Calculates the end of the day for a given date.
   *
   * @param {Date} [date] - The date for which end of the day needs to be calculated. It is optional,
   * if not provided, the current date will be used.
   *
   * @return {Date} - The end of the day for the given date.
   */
  endOfDay(date?: Date): Date {
    return moment(date).endOf('day').toDate();
  }

  /**
   * Returns the start of the day for a given date.
   *
   * @param {Date=} date - The date for which to calculate the start of the day. If not provided, the current date is used.
   * @returns {Date} - The start of the day for the given date.
   */
  startOfDay(date?: Date): Date {
    return moment(date).startOf('day').toDate();
  }

  /**
   * Extracts the day, month, and year from a given date or timestamp.
   *
   * @param {string | Date | number} date - The date or timestamp to extract values from.
   * @returns {IHelperDateExtractDate} - An object containing the extracted day, month, and year values.
   */
  extractDate(date: string | Date | number): IHelperDateExtractDate {
    const newDate = this.create(date);
    const day: string = this.format(newDate, {
      format: ENUM_HELPER_DATE_FORMAT.ONLY_DATE,
    });
    const month: string = this.format(newDate, {
      format: ENUM_HELPER_DATE_FORMAT.ONLY_MONTH,
    });
    const year: string = this.format(newDate, {
      format: ENUM_HELPER_DATE_FORMAT.ONLY_YEAR,
    });

    return {
      date: newDate,
      day,
      month,
      year,
    };
  }

  /**
   * Rounds down the date to the given precision.
   *
   * @param {Date} date - The date to be rounded down.
   * @param {Object} [options] - The options for rounding down.
   * @param {boolean} [options.hour] - Whether to round down to the nearest hour.
   * @param {boolean} [options.minute] - Whether to round down to the nearest minute.
   * @param {boolean} [options.second] - Whether to round down to the nearest second.
   * @returns {Date} - The rounded down date.
   */
  roundDown(date: Date, options?: IHelperDateOptionsRoundDown): Date {
    const mDate = moment(date).set({ millisecond: 0 });

    if (options?.hour) {
      mDate.set({ hour: 0 });
    }

    if (options?.minute) {
      mDate.set({ minute: 0 });
    }

    if (options?.second) {
      mDate.set({ second: 0 });
    }

    return mDate.toDate();
  }

  /**
   * Returns the start and end dates for a given month and year.
   * If no options are provided, the method will return the start and end dates for the current month and year.
   *
   * @param options - An optional object containing the year and month to get the dates for.
   *                  If year is not provided, the current year will be used.
   *                  If month is not provided, the current month will be used.
   *
   * @returns An object containing the start and end dates for the specified month and year.
   */
  getStartAndEndDate(options?: IHelperDateStartAndEnd): IHelperDateStartAndEndDate {
    const today = moment();
    const todayMonth = today.format(ENUM_HELPER_DATE_FORMAT.ONLY_MONTH);
    const todayYear = today.format(ENUM_HELPER_DATE_FORMAT.ONLY_YEAR);
    // set month and year
    const year = options?.year ?? todayYear;
    const month = options?.month ?? todayMonth;

    const date = moment(`${year}-${month}-02`, 'YYYY-MM-DD');
    let startDate: Date = date.startOf('month').toDate();
    let endDate: Date = date.endOf('month').toDate();

    if (options?.month) {
      const monthDate = moment(`${year}-${month}-02`, 'YYYY-MM-DD');
      startDate = monthDate.startOf('month').toDate();
      endDate = monthDate.endOf('month').toDate();
    }

    return {
      startDate,
      endDate,
    };
  }

  /**
   * Normalizes a time string to military time format.
   * @param {string} time - The time string to be normalized.
   * @return {string} - The normalized time string in military time format.
   */
  normalizeToMilitaryTime(time: string): string {
    const timeParts = new RegExp(/(\d+):(\d+)(am|pm)?/i).exec(time);

    if (!timeParts) {
      return '00:00';
    }

    let hours = parseInt(timeParts[1], 10);
    const minutes = parseInt(timeParts[2], 10);
    const period = timeParts[3];

    if (period && period.toLowerCase() === 'pm' && hours < 12) {
      hours += 12;
    } else if (period && period.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  parseWithTimeZone(
    dateStr: string,
    formatStr: string,
    referenceDate: Date,
    timeZone: string,
  ): Date {
    const zonedDate = toZonedTime(referenceDate, timeZone);
    const parsedDate = parse(dateStr, formatStr, zonedDate);

    return fromZonedTime(parsedDate, timeZone);
  }

  // formatFromTimestampToUtc(timestamp: number) {
  //   const date = new Date(timestamp);
  //   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  //   const month = months[date.getUTCMonth()];
  //   const day = String(date.getUTCDate()).padStart(2, '0');

  //   let hours = date.getUTCHours();
  //   const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  //   const ampm = hours >= 12 ? 'PM' : 'AM';
  //   hours = hours % 12 || 12;

  //   return `${month} ${day}, ${String(hours).padStart(2, '0')}:${minutes}${ampm} +0000`;
  // }

  formatFromTimestamp(timestamp: number, options?: Partial<Intl.DateTimeFormatOptions>) {
    const date = new Date(timestamp);

    const defaultOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
      timeZoneName: 'shortOffset',
    };

    const resultOptions = { ...defaultOptions, ...options };

    const formatter = new Intl.DateTimeFormat('en-US', resultOptions);
    const formattedParts = formatter.formatToParts(date);

    let month, day, hour, minute, dayPeriod;
    for (const { type, value } of formattedParts) {
      if (type === 'month') month = value;
      if (type === 'day') day = value;
      if (type === 'hour') hour = value;
      if (type === 'minute') minute = value;
      if (type === 'dayPeriod') dayPeriod = value;
    }

    return `${month} ${day}, ${hour}:${minute}${dayPeriod} ${resultOptions.timeZone}`;
  }
}
