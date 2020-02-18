import { cor } from './cor';
const nbVert = 30,
    nbHor = 150;

const displayCorelation = (
    corData: [number, number][],
    corDataMax: [number, number][],
    corDataMin: [number, number][],
    max: number,
    incr: number,
    size: number,
): void => {
    console.log(
        'linear corelation _____________________________________________________________________________________',
    );

    const f = cor(corData);
    const fmin = cor(corDataMin);
    const fmax = cor(corDataMax);

    for (let j = 0; j < nbVert; j++) {
        let e = `-  ${max - incr * j}            `;

        e = e.substr(0, 15) + ' - ';

        for (let k = 0; k < size; k++) {
            e += Math.round(f(k)) == j ? '.' : Math.round(fmin(k)) == j ? '-' : Math.round(fmax(k)) == j ? '+' : ' ';
        }
        console.log(e);
    }
};

//[time, low:string,maxHigh:string,maxMin:string,high:string]
export const displayChart = (balance: Array<[number, string, string, string, string]>): void => {
    const mediums = balance.map(c => (parseFloat(c[1]) + parseFloat(c[4])) / 2.0);
    const sort = [...mediums].sort((a, b) => a - b);
    const min = sort[0];
    const max = sort[sort.length - 1];
    const incr = (max - min) / nbVert;
    const incrHor = Math.max(Math.round(balance.length / nbHor), 1);
    const a = [];
    const corData: Array<[number, number]> = [];
    const corDataMax: Array<[number, number]> = [];
    const corDataMin: Array<[number, number]> = [];

    // candle chart
    for (let i = 0; i < mediums.length; i += incrHor) {
        a.push([...Array(nbVert)].map(() => ' '));
        const actualMin = parseFloat(balance[i][3]);
        const actualVal = mediums[i];
        const actualMax = parseFloat(balance[i][2]);

        a[i / incrHor][Math.round(nbVert - (actualMax - min) / incr)] = '^';
        a[i / incrHor][Math.round(nbVert - (actualMin - min) / incr)] = 'v';
        a[i / incrHor][Math.round(nbVert - (actualVal - min) / incr)] = '|';
        corData.push([i, Math.round(nbVert - (actualVal - min) / incr)]);
        corDataMax.push([i, Math.round(nbVert - (actualMax - min) / incr)]);
        corDataMin.push([i, Math.round(nbVert - (actualMin - min) / incr)]);
    }

    //display chart
    for (let j = 0; j < nbVert; j++) {
        let e = `-  ${max - incr * j}            `;

        e = e.substr(0, 15) + ' - ';

        for (let k = 0; k < a.length; k++) {
            e += a[k][j];
        }
        console.log(e);
    }

    displayCorelation(corData, corDataMax, corDataMin, max, incr, a.length);
};
