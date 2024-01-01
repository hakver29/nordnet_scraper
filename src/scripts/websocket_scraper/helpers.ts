import * as cron from 'node-cron';
import { NordnetStream } from '../../integrations/nordnet/nordnetScraper';
import { isOutsideTradingHours, isWeekend } from '../../utils/helpers';
import logger from '../../utils/logger';
import { CronSchedules } from '../../utils/types';
export const startScraper = async () => {
  const scraper = new NordnetStream();
  await scraper.initiate();
};

export async function scrapeBetweenTradingHours() {
  cron.schedule(CronSchedules.EIGHT_THIRTY_AM, async () => {
    logger.info('Cronjob-process started');
    if (!isWeekend() && !isOutsideTradingHours(new Date())) {
      await startScraper();
    }
  });
}