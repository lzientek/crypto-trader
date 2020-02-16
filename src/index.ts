import  Binance from 'node-binance-api';
import config from 'config';

const binance = new Binance().options({
  ...config.binance
});