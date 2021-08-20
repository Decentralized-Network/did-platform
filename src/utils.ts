import Web3 from 'web3';

export function keccak256(s: string): string {
  return Web3.utils.keccak256(s);
}

export function toEtherTimestamp(d: Date | number) {
  return d instanceof Date ? Math.floor(d.getTime() / 1000) : d;
}
