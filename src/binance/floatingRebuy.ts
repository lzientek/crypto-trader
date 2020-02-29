import Binance from 'node-binance-api';
import config from 'config';
import { sendMessage } from '../bot/bot';
import { writePartialDb, readDb } from '../utils/jsonDb';
import calculateAcceptance from '../utils/calculateAcceptance';

interface GetProfitElement {
    symbol: string;
    acceptance?: number | string;
    buy?: boolean;
    notify?: boolean;
}
const binance = new Binance().options({
    ...config.binance,
    log: console.log,
    test: true,
});

const checkPrice = async (
    actualAvgPrice: number,
    { symbol, acceptance, notify, buy }: GetProfitElement,
    lastLow: Record<string, number>,
): Promise<void> => {
    acceptance = calculateAcceptance(acceptance, actualAvgPrice);

    if (!lastLow[symbol] || actualAvgPrice < lastLow[symbol]) {
        lastLow[symbol] = actualAvgPrice;

        return;
    }

    if (actualAvgPrice > lastLow[symbol] + acceptance) {
        let txt = `${symbol} hausse de ${actualAvgPrice - lastLow[symbol]} ${symbol.substring(
            3,
        )}\nNouveaux prix ${actualAvgPrice}${symbol.substring(3)}\n`;

        if (buy) {
            //binance buy
            const sellBalance = await readDb('sellPrices')[symbol];

            //not perfect works only with dollar convertion
            if (sellBalance && sellBalance > 2) {
                console.log('set buy order for', sellBalance, symbol.substring(0, 3));
                try {
                    const result = await binance.order('BUY', symbol, sellBalance, null, { type: 'MARKET' });

                    txt += `Vos ${result.executedQty} ${symbol.substring(0, 3)} on été acheté pour ${
                        result.price
                    } ${symbol.substring(3)}.`;

                    console.log('order result', result);
                    await writePartialDb('sellPrices', {
                        [symbol]: sellBalance - result.price ? result.price : actualAvgPrice / sellBalance,
                    });
                } catch (error) {
                    console.error('Error buying', error.toJSON().body);
                    txt += `Echec de vente ${JSON.parse(error.toJSON().body)?.msg}.`;
                }
            } else {
                console.log('Nothing to buy; freebalance:', symbol, sellBalance);
            }
        }

        if (notify) {
            await sendMessage(txt);
        }
        console.log(txt);

        lastLow[symbol] = actualAvgPrice;
    }
};

export default async (item: Array<GetProfitElement>): Promise<void> => {
    const lastLow: Record<string, number> = (await readDb('lastlow')) || {};

    setInterval(async () => {
        await Promise.all(
            item.map(async el => {
                const { [el.symbol]: value } = await binance.avgPrice(el.symbol);

                checkPrice(parseFloat(value), el, lastLow);
            }),
        );
        await writePartialDb('lastlow', lastLow);
        console.log('low', lastLow);
    }, config.refresh * 1000);
};
