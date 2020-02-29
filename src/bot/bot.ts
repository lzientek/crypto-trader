import TelegramBot from 'node-telegram-bot-api';
import config from 'config';

const bot = new TelegramBot(config.telegram.APIKEY, { polling: true });

export const start = async (): Promise<void> => {
    //await bot.sendMessage(config.telegram.USER_ID, 'Bot online');
    bot.on('message', msg => {
        if (msg.chat.id !== config.telegram.USER_ID) {
            bot.sendMessage(msg.chat.id, "Vous n'avez rien a faire ici");

            return;
        }

        console.log(msg);
    });
};

export const sendMessage = async (text: string, ...params): Promise<void> => {
    console.log('send telegram: ', text, params);
    await bot.sendMessage(config.telegram.USER_ID, text, ...params);
};

export default bot;
