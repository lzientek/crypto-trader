import Binance from 'node-binance-api';
import config from 'config';
import { sendMessage } from '../bot/bot';
import { writePartialDb, readDb } from '../utils/jsonDb';
import calculateAcceptance from '../utils/calculateAcceptance';

interface ProfitBaseType {
    symbol: string;
    acceptance?: number | string;
    notify?: boolean;
    buy?: false | undefined;
    roundPrice?: undefined;
    roundQuantity?: undefined;
}
interface BuyProfitType {
    symbol: string;
    acceptance?: number | string;
    notify?: boolean;
    buy: true;
    roundPrice: 1 | 10 | 100 | 1000 | 10000 | 100000;
    roundQuantity: 1 | 10 | 100 | 1000 | 10000 | 100000;
}

type GetProfitElement = ProfitBaseType | BuyProfitType;

const binance = new Binance().options({
    ...config.binance,
    log: console.log,
});

const checkPrice = async (
    actualAvgPrice: number,
    { symbol, acceptance, notify, buy, roundPrice, roundQuantity }: GetProfitElement,
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
            const sellBalance = (await readDb('sellPrices'))[symbol];

            //not perfect works only with dollar convertion
            if (sellBalance && sellBalance > 2) {
                console.log('set buy order for', sellBalance, symbol.substring(0, 3));
                try {
                    console.log('jnoij', Math.round((sellBalance / actualAvgPrice) * roundQuantity) / roundQuantity);
                    const result = await binance.order(
                        'BUY',
                        symbol,
                        Math.round((sellBalance / actualAvgPrice) * roundQuantity) / roundQuantity,
                        Math.round(actualAvgPrice * roundPrice) / roundPrice,
                        {
                            type: 'LIMIT',
                            timeInForce: 'IOC',
                        },
                    );

                    txt += `Vos ${result.executedQty ||
                        Math.round((sellBalance / actualAvgPrice) * roundQuantity) / roundQuantity} ${symbol.substring(
                        0,
                        3,
                    )} on été acheté pour ${result.price ||
                        Math.round(actualAvgPrice * roundPrice) / roundPrice} ${symbol.substring(3)}.`;

                    console.log('order result', result);
                    await writePartialDb('sellPrices', {
                        [symbol]:
                            sellBalance -
                            (result.price ? result.price : Math.round(actualAvgPrice * roundPrice) / roundPrice),
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
