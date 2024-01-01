import {
  AFTER_TRADING_HOURS, FOUR_WEEK_HOURS, MAX_VOLUME, MIN_VOLUME, ONE_WEEK_HOURS,
} from './constants';
import { IndicatorInfo, TickerInfo } from './types';
import logger from "./logger";
import {createNordnetSession} from "./scripts";
import {NordnetDailyStockData} from "../integrations/nordnet/types";

export async function getFilteredTickerList(
    filterMinVolume: boolean,
    filterMaxVolume: boolean,
): Promise<TickerInfo[]> {
  try {
    const nordnet = await createNordnetSession();
    let dailyStockDataTickerList = await nordnet.getStockData();
    dailyStockDataTickerList = filterDate(dailyStockDataTickerList);
    dailyStockDataTickerList = filterVolume(
        dailyStockDataTickerList,
        filterMinVolume,
        filterMaxVolume
    );

    if (!dailyStockDataTickerList) {
      logger.error(`Did not find any stock ids in db`);
      return [];
    }

    let tickerList: TickerInfo[] = convertToTicker(dailyStockDataTickerList);

    tickerList = getTreadTickerList(tickerList);

    // logger.info(`Returning filtered tickerList of ${tickerList.length}`);
    return tickerList;
  } catch (error) {
    logger.error(`Failed to get stock-list: ${error}`);
    return [];
  }
}

function convertToTicker(dailyStockData: NordnetDailyStockData[]): TickerInfo[] {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const list: TickerInfo[] = dailyStockData.map((obj) => {
    return {
      instrument_id: obj.instrument_info.instrument_id,
      name: obj.instrument_info.name,
      identifier: obj.market_info.identifier,
      market_id: obj.market_info.market_id,
      symbol: obj.instrument_info.symbol,
      tick_size_id: obj.market_info.tick_size_id,
    };
  });

  return list;
}

// TODO: Should probably be independent of tread
export function getIndicatorList(): IndicatorInfo[] {
  return [
    getIndicator('178.10.OSEBX'),
    // getIndicator('213.10.DAX'),
    // getIndicator('240.20.USDNOKCOMP'),
  ];
}

export function getIndicator(i: string): IndicatorInfo {
  return { i, m: '201', t: 'indicator' } as IndicatorInfo;
}

export function isWeekend() {
  const day = new Date(Date.now()).getDay();
  return day === 6 || day === 0;
}

export function isOutsideTradingHours(date: Date): boolean {
  const afterHours = new Date();
  afterHours.setUTCHours(AFTER_TRADING_HOURS);
  afterHours.setMinutes(0);

  // const beforeHours = new Date();
  // beforeHours.setUTCHours(BEFORE_TRADING_HOURS);
  // beforeHours.setMinutes(0);

  return date.getTime() - afterHours.getTime() > 0;
  // return !(
  // date.getTime() - beforeHours.getTime() > 0 &&
  // (date.getTime() - afterHours.getTime() < 0)
  // );
}

const filterVolume = (
    dailyStockData: NordnetDailyStockData[],
    minVolume: boolean,
    maxVolume: boolean
): NordnetDailyStockData[] => {
  if (minVolume) {
    dailyStockData = dailyStockData.filter((stock) => {
      return stock.price_info.turnover > MIN_VOLUME;
    });
  }

  if (maxVolume) {
    dailyStockData = dailyStockData.filter((stock) => {
      return stock.price_info.turnover < MAX_VOLUME;
    });
  }

  return dailyStockData;
};

export function getTreadTickerList(tickerList: TickerInfo[]): TickerInfo[] {
  if (process.env.TREAD === '1') {
    return tickerList.splice(0, Math.ceil(tickerList.length / 6));
  }
  if (process.env.TREAD === '2') {
    return tickerList.slice(
      Math.ceil(tickerList.length / 6),
      2 * Math.ceil(tickerList.length / 6)
    );
  }
  if (process.env.TREAD === '3') {
    return tickerList.slice(
      2 * Math.ceil(tickerList.length / 6),
      3 * Math.ceil(tickerList.length / 6)
    );
  }
  if (process.env.TREAD === '4') {
    return tickerList.slice(
      3 * Math.ceil(tickerList.length / 6),
      4 * Math.ceil(tickerList.length / 6)
    );
  }
  if (process.env.TREAD === '5') {
    return tickerList.slice(
      4 * Math.ceil(tickerList.length / 6),
      5 * Math.ceil(tickerList.length / 6)
    );
  }
  if (process.env.TREAD === '6') {
    return tickerList.slice(
      5 * Math.ceil(tickerList.length / 6),
      6 * Math.ceil(tickerList.length / 6)
    );
  }

  return tickerList;
}

const filterDate = (dailyStockData: NordnetDailyStockData[]): NordnetDailyStockData[] => {
  const currentLength = dailyStockData.length;
  dailyStockData = dailyStockData.filter((dailyStockData) => {
    return (
        new Date(
            new Date().setUTCHours(new Date().getUTCHours() - FOUR_WEEK_HOURS)
        ) < new Date(dailyStockData.status_info.tick_timestamp)
    );
  });

  // logger.info(
  //   `Filtered away ${currentLength - dailyStockData.length} based on Date`
  // );

  return dailyStockData;
};
