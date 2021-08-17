import Web3 from 'web3';
import { IDIDManager } from './interfaces';

export class ManagerBase {
  did: IDIDManager;

  constructor(did: IDIDManager) {
    this.did = did;
  }

  protected get web3() {
    return this.did.web3;
  }
}
