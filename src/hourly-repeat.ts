import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { maskKey } from './utils';

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;

const MAILGUN_API = process.env.MAILGUN_APIKEY ?? '';
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN ?? 'sandbox.mailgun.org';
const MAILGUN_TO = process.env.MAILGUN_TO ?? 'test@gmail.com';

console.log('Mailgun API:', maskKey(MAILGUN_API));
console.log('Mailgun Domain:', maskKey(MAILGUN_DOMAIN));
console.log('Mailgun to:', maskKey(MAILGUN_TO));

export default (callback: () => any) => {
  return async function repeat() {
    try {
      await callback();
    } catch (e) {
      const mg = new Mailgun(FormData).client({ username: 'api', key: MAILGUN_API });
      mg.messages
        .create(MAILGUN_DOMAIN, {
          from: 'Pokemon Go Forecast <notification@pokemon-go-forecast>',
          to: [MAILGUN_TO],
          subject: 'Pokemon Go Forecast Error Message',
          text: `${e}`,
        })
        .then(msg => console.log(msg))
        .catch(err => console.log(err));
    }

    const date = new Date();
    const minute = date.getMinutes();
    const timeout =
      59 <= minute || minute === 0
        ? 30 * SECOND
        : HOUR - secondsPassHour(date) - 27 * SECOND;

    setTimeout(repeat, timeout);
  };
};

function secondsPassHour(date: Date) {
  return date.getMinutes() * MINUTE + date.getSeconds() * SECOND;
}
