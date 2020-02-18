import Binance from 'node-binance-api';
import config from 'config';
import { displayChart } from './displayChart';

const main = async (): Promise<void> => {
    const binance = new Binance().options({
        ...config.binance,
    });

    const balance = await binance.candlesticks('BTCUSDT', '1d', false, {
        limit: 500,
        startTime: +new Date() - 60 * 24 * 60 * 60 * 1000,
    });

    displayChart(balance);
};

main()
    .then(() => console.log('finish!'))
    .catch(e => console.error(e));
