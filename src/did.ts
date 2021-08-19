import Web3 from 'web3';
import { provider } from 'web3-core';
import { Identity } from './interfaces/credential';
import { IdentityManager } from './IdentityManager';
import { getIssuer } from './IssuerManager';
import { Contract } from 'web3-eth-contract';
import { IDIDManager, IssuerBase } from './interfaces';

const _registryInterfaceJson = require('./contracts/abi/registry.interface.json');

export class DID implements IDIDManager {
  web3: Web3;
  registry: Contract;

  identity: IdentityManager;
  issuer: (issuer: Identity) => Promise<IssuerBase>;

  constructor(provider: provider, registryContract: string) {
    this.web3 = new Web3(provider);
    this.registry = new this.web3.eth.Contract(
      _registryInterfaceJson,
      registryContract
    );

    this.identity = new IdentityManager(this);

    this.issuer = (issuer: Identity) => getIssuer(this, issuer);
  }

  public async getRegistryDomainSeparator() {
    return await this.registry.methods.DOMAIN_SEPARATOR().call();
  }
}
