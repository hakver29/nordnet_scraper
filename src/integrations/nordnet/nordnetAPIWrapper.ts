import axios from 'axios';
import jwt_decode from 'jwt-decode';
import logger from '../../utils/logger';
import {
  JWT,
  NordnetDailyStockData,
} from './types';

export class NordnetAPIWrapper {
  private HEADERS_BASE: any;
  private client: any;
  private ACCOUNTS: any;
  private username;
  private password;

  constructor() {
    this.HEADERS_BASE = {
      'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64; rv:68.0) Gecko/20100101 Firefox/68.0',
      Accept: 'application/json',
      Connection: 'keep-alive',
      'content-type': 'application/json',
      'client-id': 'NEXT',
    };
    this.ACCOUNTS = [];

    this.username = process.env.username;
    this.password = process.env.password;
    this.client = axios.create({
      headers: this.HEADERS_BASE,
      withCredentials: true,
    });
  }

  public async getAnonLoginCookies() {
    try {
      const response = await this.client.get('https://www.nordnet.no/no', {headers: this.HEADERS_BASE});
      // const response = await this.client.get(
      //     'https://nordnet.no/api/2/login/anonymous',
      //     {
      //         headers: this.HEADERS_BASE,
      //     }
      // );
      logger.info(
        `Sucessfully logged in anonymously with response status ${JSON.stringify(
          response.status
        )}`
      );
      this.client.defaults.headers.cookie = response.headers['set-cookie'];
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

  public async newSession(): Promise<any> {
    await this.getAnonLoginCookies();
    await this.getLoginCookies();

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
      this.client.defaults.headers.cookie = response.headers['set-cookie'];
      this.client.defaults.headers.ntag = response.headers.ntag;
    } catch (error) {
      logger.error(`Failed to login as user ${error}`);
    }
    const decodedValue: JWT = jwt_decode(
        this.client.defaults.headers.cookie[1].split(';')[0].split('=')[1]
    );
    this.ACCOUNTS = JSON.parse(decodedValue.auz).acc;
  }

  public async renewSession(): Promise<boolean> {
    try {
      const response = await this.client.get(
          'https://www.nordnet.no/api/2/login',
          {
            headers: this.HEADERS_BASE,
            withCredentials: true,
          }
      );
      // logger.info(
      //   `Sucessfully renewed session: ${JSON.stringify(response.data)}`
      // );
      return true;
    } catch (error) {
      logger.error(`Failed to renew session: ${error}`);
      return false;
    }
    // const decodedValue: JWT = jwt_decode(this.client.defaults.headers.cookie[1].split(';')[0].split('=')[1]);
    // this.ACCOUNTS = JSON.parse(decodedValue.auz).acc;
  }

  public async getStockData() {
    let stockData: NordnetDailyStockData[] = [];
    let offset = 0;
    let totalHits = -1;
    while (totalHits !== offset) {
      const response = await this.client.get(
          process.env.OSE_STOCKS_URL +
          `?apply_filters=exchange_country=NO&limit=100&offset=${offset}`,
          {},
          {
            headers: this.HEADERS_BASE,
            withCredentials: true,
          }
      );
      logger.info(
          `Received ${response.data.rows} number of stocks out of ${response.data.total_hits} with offset ${offset}`
      );
      totalHits = response.data.total_hits;
      stockData = [...stockData, ...response.data.results];
      offset = offset + response.data.rows;
    }
    return stockData;
  }
}

export default NordnetAPIWrapper;
