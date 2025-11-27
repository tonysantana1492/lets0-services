import type { UAParser } from 'ua-parser-js';

export interface IRequestUserAgent extends UAParser.IResult {
  deviceInfo: string;
}
