import { NordnetDepthObject, NordnetPriceObject } from './types';

export function updateDepthObject(
  newDepth: NordnetDepthObject,
  prevDepth: NordnetDepthObject
): NordnetDepthObject {
  return {
    i: newDepth.i,
    m: newDepth.m,
    id: newDepth.id,
    tick_timestamp: newDepth.tick_timestamp,

    bid1: newDepth.bid1 ?? prevDepth?.bid1,
    bid_volume1: newDepth.bid_volume1 ?? prevDepth?.bid_volume1,
    bid_orders1: newDepth.bid_orders1 ?? prevDepth?.bid_orders1,
    ask1: newDepth.ask1 ?? prevDepth?.ask1,
    ask_volume1: newDepth.ask_volume1 ?? prevDepth?.ask_volume1,
    ask_orders1: newDepth.ask_orders1 ?? prevDepth?.ask_orders1,

    bid2: newDepth.bid2 ?? prevDepth?.bid2,
    bid_volume2: newDepth.bid_volume2 ?? prevDepth?.bid_volume2,
    bid_orders2: newDepth.bid_orders2 ?? prevDepth?.bid_orders2,
    ask2: newDepth.ask2 ?? prevDepth?.ask2,
    ask_volume2: newDepth.ask_volume2 ?? prevDepth?.ask_volume2,
    ask_orders2: newDepth.ask_orders2 ?? prevDepth?.ask_orders2,

    bid3: newDepth.bid3 ?? prevDepth?.bid3,
    bid_volume3: newDepth.bid_volume3 ?? prevDepth?.bid_volume3,
    bid_orders3: newDepth.bid_orders3 ?? prevDepth?.bid_orders3,
    ask3: newDepth.ask3 ?? prevDepth?.ask3,
    ask_volume3: newDepth.ask_volume3 ?? prevDepth?.ask_volume3,
    ask_orders3: newDepth.ask_orders3 ?? prevDepth?.ask_orders3,

    bid4: newDepth.bid4 ?? prevDepth?.bid4,
    bid_volume4: newDepth.bid_volume4 ?? prevDepth?.bid_volume4,
    bid_orders4: newDepth.bid_orders4 ?? prevDepth?.bid_orders4,
    ask4: newDepth.ask4 ?? prevDepth?.ask4,
    ask_volume4: newDepth.ask_volume4 ?? prevDepth?.ask_volume4,
    ask_orders4: newDepth.ask_orders4 ?? prevDepth?.ask_orders4,

    bid5: newDepth.bid5 ?? prevDepth?.bid5,
    bid_volume5: newDepth.bid_volume5 ?? prevDepth?.bid_volume5,
    bid_orders5: newDepth.bid_orders5 ?? prevDepth?.bid_orders5,
    ask5: newDepth.ask5 ?? prevDepth?.ask5,
    ask_volume5: newDepth.ask_volume5 ?? prevDepth?.ask_volume5,
    ask_orders5: newDepth.ask_orders5 ?? prevDepth?.ask_orders5,
  };
}

export function updatePriceObject(
  newPrice: NordnetPriceObject,
  lastPrice: NordnetPriceObject
): NordnetPriceObject {
  return {
    i: newPrice.i,
    m: newPrice.m,
    id: newPrice.id,
    tick_timestamp: newPrice.tick_timestamp,

    trade_timestamp: newPrice.trade_timestamp,
    bid: newPrice.bid ?? lastPrice.bid,
    bid_volume: newPrice.bid_volume ?? lastPrice.bid_volume,
    ask: newPrice.ask ?? lastPrice.ask,
    ask_volume: newPrice.ask_volume ?? lastPrice.ask_volume,
    close: newPrice.close ?? lastPrice.close,
    high: newPrice.high ?? lastPrice.high,
    last: newPrice.last ?? lastPrice.last,
    last_volume: newPrice.last_volume ?? lastPrice.last_volume,
    low: newPrice.low ?? lastPrice.low,
    open: newPrice.open ?? lastPrice.open,
    turnover: newPrice.turnover ?? lastPrice.turnover,
    turnover_volume: newPrice.turnover_volume ?? lastPrice.turnover_volume,
  };
}
