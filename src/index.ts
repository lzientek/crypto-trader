import Binance from 'node-binance-api';
import config from 'config';
import { displayChart } from './displayChart';

export const nbVert = 50,
    incrHor = 3;

const main = async (): Promise<void> => {
    const binance = new Binance().options({
        ...config.binance,
    });

    const balance = await binance.futuresCandles('BTCUSDT', '1h');

    displayChart(balance);
};

main()
    .then(() => console.log('finish!'))
    .catch(e => console.error(e));
