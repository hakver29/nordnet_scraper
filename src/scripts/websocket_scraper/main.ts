import { scrapeBetweenTradingHours, startScraper } from './helpers';
import {config} from "dotenv";
import { io } from 'socket.io-client';

config();
const socket = io('http://localhost:3000');

export async function startWebsocketScraper(instantly: boolean) {
  if (instantly) {
    // const socket = io('http://localhost:3001');
    // socket.emit('message', 'Hello, WebSocket!');
    await startScraper();
  } else {
    await scrapeBetweenTradingHours();
  }
}

startWebsocketScraper(true);
