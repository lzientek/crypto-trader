import Binance from 'node-binance-api';
import config from 'config';
import { sendMessage } from '../bot/bot';

interface StopLossElement {
    symbol: string;
    acceptance?: number | string;
    sell?: boolean;
    notify?: boolean;
}

function calculateAcceptance(acceptance: number | string | null, actualAvgPrice: number): number {
    if (!acceptance) {
        return calculateAcceptance('0.1%', actualAvgPrice);
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
    if (!lastHigh[symbol] || actualAvgPrice > lastHigh[symbol]) {
        lastHigh[symbol] = actualAvgPrice;

        return;
    }

    acceptance = calculateAcceptance(acceptance, actualAvgPrice);

    if (actualAvgPrice < lastHigh[symbol] - acceptance) {
        lastHigh[symbol] = actualAvgPrice;
        let txt = `${symbol} baisse de ${lastHigh[symbol] - actualAvgPrice} ${symbol.substring(
            3,
        )}\nNouveaux prix ${actualAvgPrice}${symbol.substring(3)}\n`;

        console.log(txt);

        if (sell) {
            //binance sell
            txt += `Vos ${symbol.substring(0, 3)} on été vendu.`;
        }

        if (notify) {
            await sendMessage(txt);
        }
    }
};

export default (item: Array<StopLossElement>): void => {
    const binance = new Binance().options({
        ...config.binance,
    });

    const lastHigh: Record<string, number> = {};

    setInterval(async () => {
        await Promise.all(
            item.map(async el => {
                const { [el.symbol]: value } = await binance.avgPrice(el.symbol);

                checkPrice(parseFloat(value), el, lastHigh);
            }),
        );
        console.log(lastHigh);
    }, 1000);
};
