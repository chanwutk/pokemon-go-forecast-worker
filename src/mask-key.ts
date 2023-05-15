
export function maskKey(key: string) {
  if (key.length < 10) {
    return '**********';
  }

  return (
    [...new Array(key.length - 5)].map(_ => '*').join('') +
    key.slice(key.length - 5)
  );
}
