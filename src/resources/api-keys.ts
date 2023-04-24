const keys: string[] = [];

function getKey(i: number) {
  const key = `PGF_KEY_${i}`;
  return process.env[key];
}

let key: string | undefined;
for (let i = 0; (key = getKey(i)) !== undefined; i++) {
  console.log(`Key[${i}]: ${key}`);
  keys.push(key);
}

export default keys;
