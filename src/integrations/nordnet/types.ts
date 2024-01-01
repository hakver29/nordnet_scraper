export interface NordnetDailyStockData {
  instrument_info: {
    instrument_id: string;
    name: string;
    long_name: string;
    symbol: string;
    instrument_group_type: string;
    instrument_type_hierarchy: string;
    instrument_type: string;
    isin: string;
    currency: string;
    price_unit: string;
    clearing_place: string;
    is_tradable: boolean;
    instrument_pawn_percentage: number;
    is_shortable: boolean;
    issuer_id: number;
    issuer_name: string;
    is_monthly_saveable: boolean;
  };
  status_info: {
    trading_status: string;
    translated_trading_status: string;
    tick_timestamp: number;
  };
  market_info: {
    market_id: number;
    market_sub_id: number;
    identifier: string;
    tick_size_id: number;
  };
  price_info: {
    last: { price: number; decimals: number };
    open: { price: number; decimals: number };
    close: { price: number; decimals: number };
    turnover: number;
    turnover_normalized: number;
    turnover_volume: number;
    bid: { price: number; decimals: number };
    ask: { price: number; decimals: number };
    bid_volume: number;
    ask_volume: number;
    high: { price: number; decimals: number };
    low: { price: number; decimals: number };
    diff?: { diff: number; decimals: number };
    diff_pct: number;
    spread: { price: number; decimals: number };
    spread_pct: number;
    tick_timestamp: number;
    realtime: boolean;
  };
  exchange_info: { exchange_country: string };
  key_ratios_info: {
    pe: number;
    ps: number;
    eps: number;
    pb: number;
    dividend_per_share: number;
    dividend_yield: number;
  };
  historical_returns_info: {
    yield_1d: number;
    yield_1w: number;
    yield_1m: number;
    yield_3m: number;
    yield_ytd: number;
    yield_1y: number;
    yield_3y: number;
    yield_5y: number;
    yield_10y: number;
    yield_max: number;
    realtime: boolean;
  };
  company_info: {
    dividend_date: number;
    dividend_amount: number;
    dividend_currency: string;
    excluding_date: number;
  };
  statistical_info: {
    statistics_timestamp: number;
    number_of_owners: number;
  };
}

export type JWT = {
  sub: string;
  aud: string;
  amr: string;
  auz: string;
  iss: string;
  refresh: string;
  csrf: string;
  exp: number;
  lang: string;
  corg: string;
};

export interface AccountInfoData {
  accid: number;
  accno: number;
  account_code: number;
  account_currency: string;
  account_credit: PriceValue;
  account_sum: PriceValue;
  buy_orders_value: PriceValue;
  equity: PriceValue;
  forward_sum: PriceValue;
  full_marketvalue: PriceValue;
  future_sum: PriceValue;
  interest: PriceValue;
  collateral: PriceValue;
  loan_limit: PriceValue;
  own_capital: PriceValue;
  own_capital_morning: PriceValue;
  pawn_value: PriceValue;
  short_positions_margin: PriceValue;
  trading_power: PriceValue;
  unrealized_future_profit_loss: PriceValue;
}

export interface AdditionalStockData {
  company: StockCompanyData;
  equity: StockEquityData;
}

interface StockCompanyData {
  ceo?: string;
  url?: string;
  email?: string;
  description?: string;
  name?: string;
  headquarter?: string;
  industry?: string;
  industry_group?: string;
  sector?: string;
}

interface StockEquityData {
  number_of_shares?: number;
  introduction_date?: string;
  isin_code?: string;
  currency?: string;
  market_cap: StockMarketCapData;
}

interface StockMarketCapData {
  currency_prefix?: string;
  currency?: string;
  value?: number;
}

interface PriceValue {
  currency: string;
  value: number;
}

export interface AdditionalDailyStockData {
  number_of_shares?: number;
  tickerId?: string;
  industry?: string;
  industry_group?: string;
  sector?: string;
  currency?: string;
  currency_prefix?: string;
  value?: number;
  isin_code?: string;
  mic?: string;
}

export interface AdditionalShortData {
  isin: string;
  name: string;
  shortPercent: number;
  shortedSum: number;
}

export interface RelativeUrl {
  relative_url: string;
  method: string;
}

export enum SubscriptionType {
  PRICE = 'price',
  TRADE = 'trade',
  DEPTH = 'depth',
  TRADING_STATUS = 'trading_status',
  INDICATOR = 'indicator',
  NEWS = 'news',
  HEARTBEAT = 'heartbeat',
  ERROR = 'err',
}

export interface NordnetDepthObject {
  i: string;
  m: number;
  id: number;
  tick_timestamp: Date;

  bid1: number;
  bid_volume1: number;
  bid_orders1: number;
  ask1: number;
  ask_volume1: number;
  ask_orders1: number;

  bid2: number;
  bid_volume2: number;
  bid_orders2: number;
  ask2: number;
  ask_volume2: number;
  ask_orders2: number;

  bid3: number;
  bid_volume3: number;
  bid_orders3: number;
  ask3: number;
  ask_volume3: number;
  ask_orders3: number;

  bid4: number;
  bid_volume4: number;
  bid_orders4: number;
  ask4: number;
  ask_volume4: number;
  ask_orders4: number;

  bid5: number;
  bid_volume5: number;
  bid_orders5: number;
  ask5: number;
  ask_volume5: number;
  ask_orders5: number;
}

export interface NordnetPriceObject {
  i: string;
  m: number;
  id: number;
  trade_timestamp: Date;
  tick_timestamp: Date;
  bid: number;
  bid_volume: number;
  ask: number;
  ask_volume: number;
  close: number;
  high: number;
  last: number;
  last_volume: number;
  low: number;
  open: number;
  turnover: number;
  turnover_volume: number;
}

export interface NordnetTradeObject {
  i: string;
  m: number;
  id: number;
  trade_timestamp: Date;
  trade_type: string;
  trade_id: string;
  price: number;
  volume: number;
}

export interface NordnetTradingStatusObject {
  i: string;
  id: number;
  m: number;
  source_status: string;
  status: string;
  tick_timestamp: Date;
}

export interface NordnetNewsObject {
  news_id: number;
  source_id: number;
  headline: string;
  lang: string;
  type: string;
  instruments: string[];
}

export interface NordnetIndicatorObject {
  delayed: number;
  close: number;
  high: number;
  last: number;
  low: number;
  i: string;
  m: string;
  tick_timestamp: number;
}

export interface Message {
  type: SubscriptionType;
  data:
    | NordnetDepthObject
    | NordnetPriceObject
    | NordnetTradeObject
    | NordnetTradingStatusObject
    | NordnetIndicatorObject;
}
