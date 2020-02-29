import { promises as fs } from 'fs';

export const readDb = async (file: string): Promise<any> => {
    try {
        return JSON.parse((await fs.readFile(file)).toString());
    } catch (err) {
        return {};
    }
};

export const writePartialDb = async (file: string, partialValue: object): Promise<any> => {
    const newObj = { ...JSON.parse(((await fs.readFile(file)) || '{}').toString()), ...partialValue };

    await fs.writeFile(file, JSON.stringify(newObj), { flag: 'w+' });
};
