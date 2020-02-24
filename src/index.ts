import { start } from './bot/bot';
import binance from './binance/binance';

const main = async (): Promise<void> => {
    start();
    binance();
};

main().catch(e => console.error(e));
