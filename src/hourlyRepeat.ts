const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;

export default (callback: () => any) => {
  return function repeat() {
    callback();

    const date = new Date();
    const minute = date.getMinutes();
    setTimeout(
      repeat,
      59 <= minute || minute === 0
        ? 30 * SECOND
        : HOUR - secondsPassHour(date) - 27 * SECOND,
    );
  };
};

const secondsPassHour = (date: Date) =>
  date.getMinutes() * MINUTE + date.getSeconds() * SECOND;
