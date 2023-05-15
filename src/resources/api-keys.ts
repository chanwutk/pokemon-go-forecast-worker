import { maskKey } from "../mask-key";

const keys: string[] = [];

function getKey(i: number) {
  const key = `PGF_KEY_${i}`;
  return process.env[key];
}

let key: string | undefined;
for (let i = 0; (key = getKey(i)) !== undefined; i++) {
  console.log(`Key[${i}]: ${maskKey(key)}`);
  keys.push(key);
}
console.log(`${keys.length} keys loaded`);

export default keys;
