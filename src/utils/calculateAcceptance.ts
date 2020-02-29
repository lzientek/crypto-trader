import config from 'config';

export default function calculateAcceptance(acceptance: number | string | null, actualAvgPrice: number): number {
    if (!acceptance) {
        return calculateAcceptance(config.defaultAcceptance, actualAvgPrice);
    } else if (typeof acceptance === 'string' && acceptance.endsWith('%')) {
        return (parseFloat(acceptance.replace('%', '')) / 100) * actualAvgPrice;
    } else if (typeof acceptance === 'string') {
        return parseFloat(acceptance);
    }

    return acceptance;
}
