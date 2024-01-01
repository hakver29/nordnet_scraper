import axios from 'axios';
import jwt_decode from 'jwt-decode';
import WebSocket from 'ws';
import {startScraper} from '../../scripts/websocket_scraper/helpers';
import logger from '../../utils/logger';
import {
    FILTER_MAX_VOLUME,
    FILTER_MIN_VOLUME,
    SUBSCRIPTION_DELAY_MILLISECONDS,
    TICKERLIST_SUBSCRIBE_DEPTH,
    TICKERLIST_SUBSCRIBE_PRICE,
    TICKERLIST_SUBSCRIBE_TRADE,
    TICKERLIST_SUBSCRIBE_TRADING_STATUS,
} from './constants';
import {updateDepthObject, updatePriceObject} from './helpers';
import {
    JWT,
    Message,
    NordnetDepthObject,
    NordnetIndicatorObject,
    NordnetNewsObject,
    NordnetPriceObject,
    NordnetTradeObject,
    NordnetTradingStatusObject,
    SubscriptionType,
} from './types';
import {IndicatorInfo, TickerInfo} from "../../utils/types";
import {getFilteredTickerList, getIndicatorList, isOutsideTradingHours} from "../../utils/helpers";

export class NordnetScraper {
    private DEPTHS_CACHE_TICKERLIST: NordnetDepthObject[];
    private INDICATOR_CACHE_LIST: NordnetIndicatorObject[];
    private TRADE_CACHE_TICKERLIST: NordnetTradeObject[];
    private TICKER_INFO_LIST_CACHE: TickerInfo[];
    private TRADING_STATUS_CACHE_TICKERLIST: NordnetTradingStatusObject[];

    private DEPTH_CACHE: NordnetDepthObject[]; // Last depth per ticker
    private PRICE_CACHE: NordnetPriceObject[]; // Last price per ticker
    private scraperRetrys: number;
    private USER_AGENT: string;
    private sock: any;
    private nextCookie: any;
    private csrf: any;
    private TICK_LIST: any;

    private HEADERS_BASE: any;
    private client: any;
    private ACCOUNTS: any;
    private username;
    private password;

    constructor() {
        this.USER_AGENT =
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36';
        this.nextCookie = '';
        this.HEADERS_BASE = {
            'User-Agent':
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36',
            Accept: 'application/json',
            'Connection': 'keep-alive',
            'content-type': 'application/json',
            'Client-Id': 'NEXT',
            Referer: process.env.ORIGIN_URL ?? '',
        };
        this.ACCOUNTS = [];
        this.DEPTH_CACHE = [];
        this.PRICE_CACHE = [];

        this.DEPTHS_CACHE_TICKERLIST = [];
        this.INDICATOR_CACHE_LIST = [];
        this.TRADING_STATUS_CACHE_TICKERLIST = [];
        this.TRADE_CACHE_TICKERLIST = [];
        this.TICKER_INFO_LIST_CACHE = [];
        this.TICK_LIST = [];

        this.username = process.env.username;
        this.password = process.env.password;
        this.scraperRetrys = 0;
        this.client = axios.create({
            headers: this.HEADERS_BASE,
            withCredentials: true,
        });
    }

    public async onMessage(msg: any) {
        const message = JSON.parse(msg.data) as Message;
        if (message.type == SubscriptionType.DEPTH) {
            const latestDepth = this.retrieveDepthFromCache(
                message.data as NordnetDepthObject
            );
            this.DEPTHS_CACHE_TICKERLIST.push(latestDepth);
            this.DEPTHS_CACHE_TICKERLIST = this.DEPTHS_CACHE_TICKERLIST.filter(
                (depth) => depth.tick_timestamp > new Date(new Date().getMinutes() - 30)
            );

            const tickerInfo = this.TICKER_INFO_LIST_CACHE.find(
                (tickerInfo) =>
                    tickerInfo.instrument_id.toString() === latestDepth.id.toString()
            );
            const lastTradingStatus = this.TRADING_STATUS_CACHE_TICKERLIST.find(
                (tradingStatus) =>
                    tradingStatus.id.toString() === latestDepth.id.toString()
            );

            const lastTrade = this.TRADE_CACHE_TICKERLIST.find(
                (trade) => trade.id.toString() === latestDepth.id.toString()
            );

            const tickRow =
                lastTrade &&
                this.TICK_LIST.find(
                    (tick: any) =>
                        Number(tick.tick_size_id) === Number(tickerInfo?.tick_size_id) &&
                        Number(lastTrade.price) <= Number(tick.to_price) &&
                        Number(lastTrade.price) >= Number(tick.from_price)
                );
            // Add Trade-spotter here: spotTradeForTicker
            // TODO: Fix issues:
            //  - buyRatioAddOnOSEBX (Cache?)
            //  - Depth(?) (Cache?)
            //  - Trade(?) (Cache?)
            //  - Price(?) (Cache?)
            //  - Fetch PotentialOrders (Cache?) + returverdi fra AppendOrder
            //  - UnsoldTickerList (Cache?) + returverdi fra AppendOrder
        }

        if (message.type == SubscriptionType.TRADE) {
            this.retrieveTradeFromCache(message.data as NordnetTradeObject);
        }

        if (message.type == SubscriptionType.NEWS) {
            if (process.env.TREAD === '1') {
                const newsObject = message.data as unknown as NordnetNewsObject;
                if (!newsObject.instruments) {
                    // eslint-disable-next-line
                    logger.info(`${newsObject.instruments}, ${newsObject.type}, ${newsObject.headline}`);
                }
            }
        }

        if (message.type == SubscriptionType.INDICATOR) {
            this.INDICATOR_CACHE_LIST.push(message.data as NordnetIndicatorObject);
            this.INDICATOR_CACHE_LIST = this.INDICATOR_CACHE_LIST.filter(
                (indicator) =>
                    indicator.tick_timestamp >
                    new Date(new Date().getMinutes() - 60).getTime()
            );
        }

        if (message.type == SubscriptionType.PRICE) {
            const latestPrice = this.retrievePriceFromCache(
                message.data as NordnetPriceObject
            );
        }

        if (message.type == SubscriptionType.TRADING_STATUS) {
            this.retrieveTradingStatusFromCache(
                message.data as NordnetTradingStatusObject
            );
        }

        if (message.type == SubscriptionType.ERROR) {
            logger.error(`Error subscribing: ${JSON.stringify(message.data)}`);
        }
    }

    public async getCSRFToken() {
        try {
            const response = await this.client.get(process.env.CSRF_TOKEN_URL ?? '');
            // logger.info(
            //   `Sucessfully got CSRF-token ${JSON.stringify(response.data.csrf)}`
            // );
            this.client.defaults.headers.cookie = response.headers['set-cookie'];
        } catch (error) {
            logger.error(`Failed to get CSRF-token ${error}`);
        }
    }

    public retrieveDepthFromCache(depth: NordnetDepthObject) {
        const index = this.DEPTH_CACHE.findIndex(
            (cacheDepth) => cacheDepth.id === depth.id
        );
        if (index === -1) {
            this.DEPTH_CACHE = [...this.DEPTH_CACHE, depth];
            return depth;
        } else {
            const updatedDepthObject = updateDepthObject(
                depth,
                this.DEPTH_CACHE[index]
            );
            this.DEPTH_CACHE[index] = updatedDepthObject;
            return updatedDepthObject;
        }
    }

    public retrieveTradingStatusFromCache(
        tradingStatus: NordnetTradingStatusObject
    ) {
        const index = this.TRADING_STATUS_CACHE_TICKERLIST.findIndex(
            (cacheTradingStatus) => cacheTradingStatus.id === tradingStatus.id
        );
        if (index === -1) {
            this.TRADING_STATUS_CACHE_TICKERLIST = [
                ...this.TRADING_STATUS_CACHE_TICKERLIST,
                tradingStatus,
            ];
            return tradingStatus;
        } else {
            this.TRADING_STATUS_CACHE_TICKERLIST[index] = tradingStatus;
            return tradingStatus;
        }
    }

    public retrieveTradeFromCache(trade: NordnetTradeObject) {
        const index = this.TRADE_CACHE_TICKERLIST.findIndex(
            (cacheTrade) => cacheTrade.id === trade.id
        );
        if (index === -1) {
            this.TRADE_CACHE_TICKERLIST = [...this.TRADE_CACHE_TICKERLIST, trade];
            return trade;
        } else {
            this.TRADE_CACHE_TICKERLIST[index] = trade;
            return trade;
        }
    }

    public retrievePriceFromCache(depth: NordnetPriceObject) {
        const index = this.PRICE_CACHE.findIndex(
            (cacheDepth) => cacheDepth.id === depth.id
        );
        if (index === -1) {
            this.PRICE_CACHE = [...this.PRICE_CACHE, depth];
            return depth;
        } else {
            const updatedDepthObject = updatePriceObject(
                depth,
                this.PRICE_CACHE[index]
            );
            this.PRICE_CACHE[index] = updatedDepthObject;
            return updatedDepthObject;
        }
    }

    public async getNextToken() {
        try {
            const response = await this.client.get(process.env.NEXT_TOKEN_URL ?? '');
            // logger.info(
            //   `Sucessfully got NEXT-token: ${JSON.stringify(
            //     response.data
            //   )}`
            // );
            this.client.defaults.headers.cookie =
                this.client.defaults.headers.cookie +
                `; NEXT=${response.data.session_id}`;
        } catch (error) {
            logger.error(`Failed to get NEXT-token ${error}`);
        }
    }

    public async getAnonLoginCookies() {
        try {
            const response = await this.client.get('https://www.nordnet.no/no', {headers: this.HEADERS_BASE});
            this.client.defaults.headers.cookie = response.headers['set-cookie'];
            logger.info(
                `Sucessfully logged in anonymously with response ${JSON.stringify(
                    response.status
                )}`
            );
        } catch (error) {
            logger.error(`Failed to get anonymous login cookies ${error}`);
        }
    }

    public async getLoginCookies() {
        try {
            const response = await this.client.get('https://www.nordnet.no/api/2/login', {headers: this.HEADERS_BASE});
            this.client.defaults.headers.ntag = response.headers.ntag;
            logger.info(
                `Sucessfully got login cookies ${JSON.stringify(
                    response.status
                )}`
            );
        } catch (error) {
            logger.error(`Failed to get anonymous login cookies ${error}`);
        }
    }

    public async loginAsUser() {
        try {
            const response = await this.client.post(
                process.env.USER_LOGIN_URL ?? '',
                {
                    username: process.env.username,
                    password: process.env.password,
                },
                {
                    headers: this.HEADERS_BASE,
                    withCredentials: true,
                }
            );
            logger.info(`Sucessfully logged in as user with status ` + response.status.headers);
            this.client.defaults.headers.cookie = response.headers['set-cookie'];
            this.client.defaults.headers.ntag = response.headers.ntag;
            // logger.info(`Sucessfully logged in as user`);
        } catch (error) {
            logger.error(`Failed to login as user ${error}`);
        }
        // console.log(this.client.defaults.headers)
        const decodedValue: JWT = jwt_decode(
            this.client.defaults.headers.cookie[1].split(';')[0].split('=')[1]
        );
        this.ACCOUNTS = JSON.parse(decodedValue.auz).acc;
    }

    public async newSession(): Promise<void> {
        await this.getAnonLoginCookies();
        await this.getLoginCookies()
        await this.loginAsUser();
    }

    public async connect() {
        logger.info(`Connecting to websocket at timestamp ${new Date()}`);

        this.sock = new WebSocket(process.env.WEBSOCKET_URL ?? '', ['NEXT'], {
            origin: process.env.ORIGIN_URL,
            headers: {
                headers: this.HEADERS_BASE,
                Cookie: this.client.defaults.headers.cookie,
            },
        });

        this.sock.onopen = async () => {
            let timeCounterDepth = 1;
            let timeCounterTrade = 1;
            let timeCounterIndicator = 1;

            const tickerList: TickerInfo[] = await getFilteredTickerList(
                FILTER_MIN_VOLUME,
                FILTER_MAX_VOLUME,
            );

            // const tradeTickerList: TickerInfo[] = await getFilteredTickerList(
            //     TRADE_FILTER_MIN_VOLUME,
            //     TRADE_FILTER_MAX_VOLUME,
            // );

            const indicatorList: IndicatorInfo[] = getIndicatorList();

            this.TICKER_INFO_LIST_CACHE = tickerList;

            logger.info(
                `Websocket opened, subscribing to ${tickerList?.length} stocks`
            );
            // tradeTickerList?.map((tickerInfo: TickerInfo) => {
            //     setTimeout(async () => {
            //         await this.subscribe(
            //             tickerInfo,
            //             TRADE_TICKERLIST_SUBSCRIBE_DEPTH,
            //             TRADE_TICKERLIST_SUBSCRIBE_PRICE,
            //             TRADE_TICKERLIST_SUBSCRIBE_TRADE,
            //             TRADE_TICKERLIST_SUBSCRIBE_TRADING_STATUS
            //         );
            //     }, timeCounterTrade * SUBSCRIPTION_DELAY_MILLISECONDS);
            //     timeCounterTrade += 1;
            // });

            tickerList?.map((tickerInfo: TickerInfo) => {
                setTimeout(async () => {
                    await this.subscribe(
                        tickerInfo,
                        TICKERLIST_SUBSCRIBE_DEPTH,
                        TICKERLIST_SUBSCRIBE_PRICE,
                        TICKERLIST_SUBSCRIBE_TRADE,
                        TICKERLIST_SUBSCRIBE_TRADING_STATUS
                    );
                }, timeCounterDepth * SUBSCRIPTION_DELAY_MILLISECONDS);
                timeCounterDepth += 1;
            });

            indicatorList?.map((indicator: IndicatorInfo) => {
                setTimeout(async () => {
                    await this.subscribeIndicator(indicator);
                }, timeCounterIndicator * SUBSCRIPTION_DELAY_MILLISECONDS);
                timeCounterIndicator += 1;
            });
            await this.subscribeNews();
        };

        return await this.pump();
    }

    public async subscribe(
        tickerInfo: TickerInfo,
        subscribeToDepth: boolean,
        subscribeToPrice: boolean,
        subscribeToTrade: boolean,
        subscribeToTradingStatus: boolean
    ) {
        // logger.info(
        //   `Subscribed to ${tickerInfo.symbol} (${
        //     tickerInfo.instrument_id
        //   }) at ${new Date()}`
        // );
        if (subscribeToDepth) {
            await this.subscribeType(tickerInfo, SubscriptionType.DEPTH);
        }
        if (subscribeToPrice) {
            await this.subscribeType(tickerInfo, SubscriptionType.PRICE);
        }
        if (subscribeToTrade) {
            await this.subscribeType(tickerInfo, SubscriptionType.TRADE);
        }
        if (subscribeToTradingStatus) {
            await this.subscribeType(tickerInfo, SubscriptionType.TRADING_STATUS);
        }
        logger.info("Subscribed to " + tickerInfo.symbol)
    }

    public async subscribeIndicator(indicator: IndicatorInfo) {
        await this.sock.send(
            JSON.stringify({
                cmd: 'subscribe',
                args: {i: indicator.i, m: '201', t: 'indicator'},
            })
        );
        // logger.info(`Subscribed to ${indicator.i} at ${new Date()}`);
    }

    public async subscribeNews() {
        await this.sock.send(
            JSON.stringify({
                cmd: 'subscribe',
                args: {t: 'news', s: 8},
            })
        );
        // logger.info(`Subscribed to news at ${new Date()}`);
    }

    public async subscribeType(
        tickerInfo: TickerInfo,
        subscriptionType: SubscriptionType
    ) {
        this.sock.send(
            JSON.stringify({
                cmd: 'subscribe',
                args: {t: subscriptionType, id: tickerInfo.instrument_id},
            })
        );
        // logger.info(
        //   `Subscribed to ${subscriptionType} for ${tickerInfo.symbol} (${
        //     tickerInfo.instrument_id
        //   }) at ${new Date()}`
        // );
    }

    public async pump() {
        this.sock.onmessage = (msg: any) => {
            this.onMessage(msg);
        };
        this.sock.onerror = (msg: never) => {
            logger.error(
                `Error subscription at ${new Date()}: ${JSON.stringify(msg)}`
            );
        };

        this.sock.onclose = (msg: never) => {
            logger.error(
                `Closed subscription at ${new Date()}: ${JSON.stringify(msg)}`
            );
            // TODO: Fix bug here that websocket closes
            if (!isOutsideTradingHours(new Date())) {
                startScraper();
            }
        };

        this.sock.onabort = (msg: never) => {
            logger.error(
                `Aborted subscription at ${new Date()}: ${JSON.stringify(msg)}`
            );
        };
    }
}

export class NordnetStream {
    public async initiate() {
        const client = new NordnetScraper();
        await client.newSession();
        await client.connect();
    }
}
