import Web3 from 'web3';
import { provider } from 'web3-core';
import { Identity } from './credential';
import { IdentityManager } from './IdentityManager';
import { IDIDManager } from './interfaces/IDIDManager';
import { getIssuer, IssuerBase } from './IssuerManager';

export class DID implements IDIDManager {
  web3: Web3;
  registry: string;

  identity: IdentityManager;
  issuer: (issuer: Identity) => Promise<IssuerBase>;

  constructor(provider: provider, registryContract: string) {
    this.web3 = new Web3(provider);
    this.registry = registryContract;

    this.identity = new IdentityManager(this);

    this.issuer = (issuer: Identity) => getIssuer(this.web3, issuer);
  }
}
