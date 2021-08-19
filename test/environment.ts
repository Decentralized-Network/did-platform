import Web3 from 'web3';
import { DID } from '../src/did';
import { IDIDManager } from '../src/interfaces';

// Defines testing environment

export const web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:8545');
export const registryContractAddress =
  '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const did: IDIDManager = new DID(
  web3.currentProvider,
  '0x5FbDB2315678afecb367f032d93F642f64180aa3'
);
