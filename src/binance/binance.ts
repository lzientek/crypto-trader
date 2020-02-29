import Binance from 'node-binance-api';
import config from 'config';
import { displayChart } from './displayChart';
import stoploss from './floatingStoploss';
import takeprofit from './floatingRebuy';

const binance = new Binance().options({
    ...config.binance,
});

export default async (): Promise<void> => {
    return new Promise(() => {
        stoploss([
            { symbol: 'BTCUSDT', notify: true },
            { symbol: 'BATUSDT', notify: true, sell: true },
            { symbol: 'ETHUSDT', notify: true },
        ]);
        takeprofit([
            { symbol: 'BTCUSDT', notify: true },
            { symbol: 'BATUSDT', notify: true, buy: true },
            { symbol: 'ETHUSDT', notify: true },
        ]);
    });
};

export const getWalletBalance = async (coin: string): Promise<{ free: number; coin: string } | null> => {
    const all = await binance.signedRequest('https://api.binance.com/sapi/v1/capital/config/getall');

    return all.find((balance: { coin: string }) => balance.coin === coin);
};

export const displayChartAndTrend = async (symbol: string, period = '1m'): Promise<void> => {
    const balance = await binance.candlesticks(symbol, period, false, {
        limit: 500,
        startTime: +new Date() - 1 * 24 * 60 * 60 * 1000,
    });

    displayChart(balance);
};
