import { start as startBot } from './bot/bot';
import binance from './binance/binance';

const main = async (): Promise<void> => {
    startBot();
    binance();
};

main().catch(e => console.error(e));
