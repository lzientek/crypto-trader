import Binance from 'node-binance-api';
import config from 'config';
import { sendMessage } from '../bot/bot';
import { getWalletBalance } from './binance';
import { writePartialDb, readDb } from '../utils/jsonDb';

interface StopLossElement {
    symbol: string;
    acceptance?: number | string;
    sell?: boolean;
    notify?: boolean;
}
const binance = new Binance().options({
    ...config.binance,
    log: console.log,
    test: true,
});

function calculateAcceptance(acceptance: number | string | null, actualAvgPrice: number): number {
    if (!acceptance) {
        return calculateAcceptance(config.defaultAcceptance, actualAvgPrice);
    } else if (typeof acceptance === 'string' && acceptance.endsWith('%')) {
        return (parseFloat(acceptance.replace('%', '')) / 100) * actualAvgPrice;
    } else if (typeof acceptance === 'string') {
        return parseFloat(acceptance);
    }

    return acceptance;
}

const checkPrice = async (
    actualAvgPrice: number,
    { symbol, acceptance, notify, sell }: StopLossElement,
    lastHigh: Record<string, number>,
): Promise<void> => {
    acceptance = calculateAcceptance(acceptance, actualAvgPrice);

    if (!lastHigh[symbol] || actualAvgPrice > lastHigh[symbol]) {
        lastHigh[symbol] = actualAvgPrice;

        return;
    }

    if (actualAvgPrice < lastHigh[symbol] - acceptance) {
        let txt = `${symbol} baisse de ${lastHigh[symbol] - actualAvgPrice} ${symbol.substring(
            3,
        )}\nNouveaux prix ${actualAvgPrice}${symbol.substring(3)}\n`;

        if (sell) {
            //binance sell
            const balance = await getWalletBalance(symbol.substring(0, 3));

            //not perfect works only with dollar convertion
            if (balance.free * actualAvgPrice > 2) {
                console.log('set sell order for', balance.free, symbol.substring(0, 3));
                try {
                    const result = await binance.order('SELL', symbol, balance.free, null, { type: 'MARKET' });

                    txt += `Vos ${result.executedQty || balance.free} ${symbol.substring(
                        0,
                        3,
                    )} on été vendu pour ${result.price || balance.free * actualAvgPrice} ${symbol.substring(3)}.`;
                    console.log('order result', result);
                    await writePartialDb('sellPrices', {
                        [symbol]: result.price ? result.price : balance.free * actualAvgPrice,
                    });
                } catch (error) {
                    console.error('Error selling', error.toJSON().body);
                    txt += `Echec de vente ${JSON.parse(error.toJSON().body)?.msg}.`;
                }
            } else {
                console.log('Nothing to sell; freebalance:', balance.free);
            }
        }

        if (notify) {
            await sendMessage(txt);
        }

        lastHigh[symbol] = actualAvgPrice;
    }
};

export default async (item: Array<StopLossElement>): Promise<void> => {
    const lastHigh: Record<string, number> = (await readDb('lasthigh')) || {};

    setInterval(async () => {
        await Promise.all(
            item.map(async el => {
                const { [el.symbol]: value } = await binance.avgPrice(el.symbol);

                checkPrice(parseFloat(value), el, lastHigh);
            }),
        );
        await writePartialDb('lasthigh', lastHigh);

        console.log('high', lastHigh);
    }, config.refresh * 1000);
};
