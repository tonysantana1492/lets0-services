export enum ENUM_BODY_TYPE {
  JSON = 'json',
  RAW = 'raw',
  TEXT = 'text',
  URLENCODED = 'urlencoded',
}

export enum ENUM_REQUEST_METHOD {
  GET = 'GET',
  DELETE = 'DELETE',
  PUT = 'PUT',
  PATCH = 'PATCH',
  POST = 'POST',
}

export enum ENUM_OPERATING_SYSTEM {
  MOBILE = 'Mobile',
  MAC_OS = 'Mac OS',
  WINDOWS = 'Windows',
  UNIX = 'UNIX',
  LINUX = 'Linux',
  IOS = 'iOS',
  ANDROID = 'Android',
}

export enum ENUM_BROWSER {
  IE = 'IE',
  SAFARI = 'Safari',
  EDGE = 'Edge',
  OPERA = 'Opera',
  CHROME = 'Chrome',
  FIREFOX = 'Firefox',
  SAMSUNG_BROWSER = 'Samsung Browser',
  UCBROWSER = 'UCBrowser',
}

export enum ENUM_REQUEST_HEADER {
  ACCEPT = 'Accept',
  ACCEPT_LANGUAGE = 'Accept-Language',
  CONTENT_LANGUAGE = 'Content-Language',
  CONTENT_TYPE = 'Content-Type',
  ORIGIN = 'Origin',
  AUTHORIZATION = 'Authorization',
  ACCESS_CONTROL_REQUEST_METHOD = 'Access-Control-Request-Method',
  ACCESS_CONTROL_REQUEST_HEADERS = 'Access-Control-Request-Headers',
  ACCESS_CONTROL_ALLOW_HEADERS = 'Access-Control-Allow-Headers',
  ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin',
  ACCESS_CONTROL_ALLOW_METHODS = 'Access-Control-Allow-Methods',
  ACCESS_CONTROL_ALLOW_CREDENTIALS = 'Access-Control-Allow-Credentials',
  ACCESS_CONTROL_EXPOSE_HEADERS = 'Access-Control-Expose-Headers',
  ACCESS_CONTROL_MAX_AGE = 'Access-Control-Max-Age',
  REFERER = 'Referer',
  HOST = 'Host',
  X_REQUESTED_WITH = 'X-Requested-With',
  X_TIMESTAMP = 'x-timestamp',
  X_API_KEY = 'x-api-key',
  X_TIMEZONE = 'x-timezone',
  X_REQUEST_ID = 'x-request-id',
  X_VERSION = 'x-version',
  X_REPO_VERSION = 'x-repo-version',
  X_RESPONSE_TIME = 'X-Response-Time',
  X_CUSTOM_LANG = 'X-Custom-Lang', // this is use to stablish the lenguage
  X_TURNSTILE_TOKEN = 'X-Turnstile-Token',
  USER_AGENT = 'user-agent',
}
