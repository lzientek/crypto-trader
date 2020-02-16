declare module 'node-binance-api' {
    interface Api {

    }

    class Binance {
        constructor()
        options(api : {APIKEY:string, APISECRET:string}): Api
    }

    export = Binance;
}