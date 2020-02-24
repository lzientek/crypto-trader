import dotenv from 'dotenv';
dotenv.config();

export default {
    binance: {
        APIKEY: process.env.APIKEY,
        APISECRET: process.env.APISECRET,
    },
    telegram: {
        APIKEY: process.env.TELEGRAM_APIKEY,
        USER_ID: parseInt(process.env.TELEGRAM_USER_ID),
    },
};
