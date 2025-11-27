import type {
  ENUM_HELPER_DATE_DIFF,
  ENUM_HELPER_DATE_FORMAT,
} from '@/common/helpers/constants/helper.enum.constant';

export type DateInput = string | Date | number;

export interface IHelperDateService {
  calculateAge(dateOfBirth: Date, year?: number): number;
  diff(dateOne: Date, dateTwoMoreThanDateOne: Date, options?: IHelperDateOptionsDiff): number;
  check(date: DateInput): boolean;
  checkDateTime(date: DateInput): boolean;
  checkTimestamp(timestamp: number): boolean;
  create(date?: DateInput, options?: IHelperDateOptionsCreate): Date;
  timestamp(date?: DateInput, options?: IHelperDateOptionsCreate): number;
  format(date: Date, options?: IHelperDateOptionsFormat): string;
  forwardInMilliseconds(milliseconds: number, options?: IHelperDateOptionsForward): Date;
  backwardInMilliseconds(milliseconds: number, options?: IHelperDateOptionsBackward): Date;
  forwardInSeconds(seconds: number, options?: IHelperDateOptionsForward): Date;
  backwardInSeconds(seconds: number, options?: IHelperDateOptionsBackward): Date;
  forwardInMinutes(minutes: number, options?: IHelperDateOptionsForward): Date;
  backwardInMinutes(minutes: number, options?: IHelperDateOptionsBackward): Date;
  forwardInHours(hours: number, options?: IHelperDateOptionsForward): Date;
  backwardInHours(hours: number, options?: IHelperDateOptionsBackward): Date;
  forwardInDays(days: number, options?: IHelperDateOptionsForward): Date;
  backwardInDays(days: number, options?: IHelperDateOptionsBackward): Date;
  forwardInMonths(months: number, options?: IHelperDateOptionsForward): Date;
  backwardInMonths(months: number, options?: IHelperDateOptionsBackward): Date;
  endOfMonth(date?: Date): Date;
  startOfMonth(date?: Date): Date;
  endOfYear(date?: Date): Date;
  startOfYear(date?: Date): Date;
  endOfDay(date?: Date): Date;
  startOfDay(date?: Date): Date;
  extractDate(date: string | Date | number): IHelperDateExtractDate;
  getStartAndEndDate(options?: IHelperDateStartAndEnd): IHelperDateStartAndEndDate;
  // formatFromTimestampToUtc(timestamp: number): string;
}

// Helper Date
export interface IHelperDateStartAndEnd {
  month?: number;
  year?: number;
}

export interface IHelperDateStartAndEndDate {
  startDate: Date;
  endDate: Date;
}

export interface IHelperDateExtractDate {
  date: Date;
  day: string;
  month: string;
  year: string;
}

export interface IHelperDateOptionsDiff {
  format?: ENUM_HELPER_DATE_DIFF;
}

export interface IHelperDateOptionsCreate {
  startOfDay?: boolean;
}

export interface IHelperDateOptionsFormat {
  format?: ENUM_HELPER_DATE_FORMAT;
}

export interface IHelperDateOptionsForward {
  fromDate?: Date;
}

export type IHelperDateOptionsBackward = IHelperDateOptionsForward;

export interface IHelperDateOptionsRoundDown {
  hour: boolean;
  minute: boolean;
  second: boolean;
}
