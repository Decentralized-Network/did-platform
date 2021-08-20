import Web3 from 'web3';
import { provider } from 'web3-core';
import { Contract } from 'web3-eth-contract';
import { IdentityManager } from './identity-manager';
import { IDIDManager, IIssuerManager } from './interfaces';
import { IssuerManager } from './issuer-manager';

const _registryInterfaceJson = require('./contracts/abi/registry.interface.json');
const _issuerDomainInterfaceJson = require('./contracts/abi/issuer-domain.interface.json');

export type DIDConfig = {
  provider?: provider;
  web3?: Web3;
  registry: string;
  issuerDomain?: string;
};

export class DID implements IDIDManager {
  web3: Web3;

  registry: Contract;
  issuerDomain?: Contract;

  identity: IdentityManager;
  issuer: IIssuerManager;

  constructor(config: DIDConfig) {
    const { provider, web3, registry, issuerDomain } = config;

    // Use provider or web3 instance to interact with blockchain network.
    if (provider) {
      this.web3 = new Web3(provider);
    } else if (web3) {
      this.web3 = web3;
    } else {
      throw new Error('Should have provider or web3 instance in config');
    }

    this.registry = new this.web3.eth.Contract(
      _registryInterfaceJson,
      registry
    );

    if (issuerDomain) {
      this.issuerDomain = new this.web3.eth.Contract(
        _issuerDomainInterfaceJson,
        issuerDomain
      );
    }

    this.identity = new IdentityManager(this);
    this.issuer = new IssuerManager(this);
  }

  public async getRegistryDomainSeparator() {
    return await this.registry.methods.DOMAIN_SEPARATOR().call();
  }
}
