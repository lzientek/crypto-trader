import { promises as fs } from 'fs';

export const readDb = async (file: string): Promise<any> => {
    try {
        return JSON.parse((await fs.readFile(file + '.json')).toString());
    } catch (err) {
        console.log('err', err);

        return {};
    }
};

export const writePartialDb = async (file: string, partialValue: object): Promise<any> => {
    const newObj = { ...(await readDb(file)), ...partialValue };

    await fs.writeFile(file + '.json', JSON.stringify(newObj), { flag: 'w' });
};
