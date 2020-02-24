export const avg = (data: number[]): number => data.reduce((acc, c) => acc + c, 0) / data.length;

//calcul de droite de moindre carré data:[x, y][]
export const cor = (data: Array<[number, number]>): ((x: number) => number) => {
    const avgX = avg(data.map(d => d[0]));
    const avgXsquared = avg(data.map(d => d[0] * d[0]));
    const avgY = avg(data.map(d => d[1]));
    const avgXY = avg(data.map(d => d[0] * d[1]));

    const m = (avgXY - avgX * avgY) / (avgXsquared - avgX * avgX);
    const b = avgY - m * avgY;

    return (x: number): number => m * x + b;
};
