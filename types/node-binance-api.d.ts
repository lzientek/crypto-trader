declare module 'node-binance-api' {
    interface Api {
        balance: () => Promise<Record<string, { available: string; onOrder: string }>>;
        [key: string]: (...args: any[]) => Promise<any>;
    }

    class Binance {
        constructor();
        options(api: { APIKEY: string; APISECRET: string }): Api;
    }

    export = Binance;
}
