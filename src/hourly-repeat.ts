import FormData from 'form-data';
import Mailgun from 'mailgun.js';

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;

export default (callback: () => any) => {
  return async function repeat() {
    try {
      await callback();
    } catch (e) {
      const mg = new Mailgun(FormData).client({
        username: 'api',
        key: process.env.MAILGUN_APIKEY ?? '',
      });
      mg.messages
        .create(process.env.MAILGUN_DOMAIN ?? 'sandbox.mailgun.org', {
          from: 'Pokemon Go Forecast <notification@pokemon-go-forecast>',
          to: [process.env.MAILGUN_TO ?? 'test@gmail.com'],
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
