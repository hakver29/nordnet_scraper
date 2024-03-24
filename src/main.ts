import { config } from 'dotenv';
import {NordnetScraper} from "./integrations/nordnet/nordnetScraper";

config();

const express = require('express');
const app = express();
const port = 3002;

// Middleware to parse JSON
app.use(express.json());
let client = new NordnetScraper();

// Endpoint to get all users
app.get('/authenticate', (req: any, res: any) => {
    client = new NordnetScraper();
    res.header("Access-Control-Allow-Origin", "*");
    client.newSession()
    return res.status(200).json({ message: 'Authenticated' });
});

app.get('/stocks', async (req: any, res: any) => {
    res.header("Access-Control-Allow-Origin", "*");
    const tickerInfo = await client.getStockData()
    return res.status(200).json(tickerInfo);
});

app.get('/subscribe/:ticker', async (req: any, res: any) => {
    const tickerInfo = await client.subscribeTicker(req.params.ticker)
    return res.status(200).json({message: `Subscribed to ${req.params.ticker}`});
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});