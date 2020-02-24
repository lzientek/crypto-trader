import Binance from 'node-binance-api';
import config from 'config';
import { displayChart } from './displayChart';
import stoploss from './floatingStoploss';

export default async (): Promise<void> => {
    const binance = new Binance().options({
        ...config.binance,
    });

    const balance = await binance.candlesticks('BTCUSDT', '1m', false, {
        limit: 500,
        startTime: +new Date() - 1 * 24 * 60 * 60 * 1000,
    });

    displayChart(balance);

    return new Promise(() => {
        stoploss([{ symbol: 'BTCUSDT' }, { symbol: 'ETHUSDT', notify: true }]);
    });
};
