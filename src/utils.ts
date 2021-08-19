
import Web3 from 'web3';

export function keccak256(s: string): string {
    return Web3.utils.keccak256(s);
}