import { nbVert, incrHor } from './index';
//[time, low:string,maxHigh:string,maxMin:string,high:string]
export const displayChart = (balance: Array<[number, string, string, string, string]>): void => {
    const mediums = balance.map(c => (parseFloat(c[1]) + parseFloat(c[4])) / 2.0);
    const sort = [...mediums].sort((a, b) => a - b);
    const min = sort[0];
    const max = sort[sort.length - 1];
    const incr = (max - min) / nbVert;
    const a = [];

    for (let i = 0; i < mediums.length; i += incrHor) {
        a.push([...Array(nbVert)].map(() => ' '));
        const actualMin = parseFloat(balance[i][3]);
        const actualVal = mediums[i];
        const actualMax = parseFloat(balance[i][2]);

        a[i / incrHor][Math.round((actualMax - min) / incr)] = '^';
        a[i / incrHor][Math.round((actualMin - min) / incr)] = 'v';
        a[i / incrHor][Math.round((actualVal - min) / incr)] = '|';
    }

    for (let j = 0; j < nbVert; j++) {
        let e = `-  ${max - incr * j}            `;

        e = e.substr(0, 15) + ' - ';

        for (let k = 0; k < a.length; k++) {
            e += a[k][j];
        }
        console.log(e);
    }
};