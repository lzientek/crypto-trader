import dotenv from 'dotenv';
dotenv.config();

export default {
    binance: {
        APIKEY: process.env.APIKEY,
        APISECRET: process.env.APISECRET,
    },
};
