export enum OrderType {
  'LIMIT' = 'LIMIT',
  'FAK' = 'FAK', // Fill and Kill
  'FOK' = 'FOK', // Fill or kill
}

export enum Side {
  'SELL' = 'SELL',
  'BUY' = 'BUY',
}

export enum CronSchedules {
  NINE_AM = '0 9 * * *',
  NINE_FIFTEEN_AM = '15 9 * * *',
  EIGHT_THIRTY_AM = '30 8 * * *',
  EVERY_SECOND = '*/1 * * * * *',
  EVERY_OTHER_MINUTE = '*/2 * * * *',
  EVERY_MINUTE = '*/1 * * * *',
  EVERY_OTHER_SECOND = '*/2 * * * * *',
  EVERY_FIVE_SECOND = '*/5 * * * * *',
  EVERY_FOUR_SECOND = '*/5 * * * * *',
  EIGHT_PM = '0 20 * * *',
}

export interface TickerInfo {
  instrument_id: number;
  symbol: string;
  market_id: number;
  identifier: string;
  name: string;
  tick_size_id: number;
  tick_size: number;
}

export interface IndicatorInfo {
  i: string;
  m: string;
  t: string;
}

export enum SourceStatus {
  CALL = 'Call',
  RESERVED = 'Reserved',
  UNCROSSING = 'Uncrossing',
  CONTINUOUS = 'Continuous',
  CLOSED = 'Closed',
}

export enum Status {
  R = 'R',
  C = 'C',
  D = 'D',
}
