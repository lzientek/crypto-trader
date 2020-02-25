import Binance from 'node-binance-api';
import config from 'config';
import { displayChart } from './displayChart';
import stoploss from './floatingStoploss';

const binance = new Binance().options({
    ...config.binance,
});

export default async (): Promise<void> => {
    const balance = await binance.candlesticks('BATUSDT', '1m', false, {
        limit: 500,
        startTime: +new Date() - 1 * 24 * 60 * 60 * 1000,
    });

    displayChart(balance);

    return new Promise(() => {
        stoploss([
            { symbol: 'BTCUSDT', sell: true },
            { symbol: 'BATUSDT', sell: true, notify: true },
            { symbol: 'ETHUSDT', notify: true, sell: true },
        ]);
    });
};

export const getWalletBalance = async (coin: string): Promise<{ free: number } | null> => {
    const all = await binance.signedRequest('https://api.binance.com/sapi/v1/capital/config/getall');

    return all.find(balance => balance.coin === coin);
};
