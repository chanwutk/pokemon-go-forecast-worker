const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;

export default (callback: () => any) => {
  return async function repeat() {
    await callback();

    const date = new Date();
    const minute = date.getMinutes();
    const timeout =
      (59 <= minute || minute === 0)
        ? 30 * SECOND
        : HOUR - secondsPassHour(date) - 27 * SECOND;

    setTimeout(repeat, timeout);
  };
};

function secondsPassHour(date: Date) {
  return date.getMinutes() * MINUTE + date.getSeconds() * SECOND;
}
