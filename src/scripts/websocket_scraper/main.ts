import { scrapeBetweenTradingHours, startScraper } from './helpers';
import {config} from "dotenv";
config();
export async function startWebsocketScraper(instantly: boolean) {
  if (instantly) {
    await startScraper();
  } else {
    await scrapeBetweenTradingHours();
  }
}

startWebsocketScraper(true);
