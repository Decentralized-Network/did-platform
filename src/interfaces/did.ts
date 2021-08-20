import Web3 from 'web3';
import { Contract, SendOptions } from 'web3-eth-contract';
import { Claim, ClaimHash, Expiration, Identity } from './credential';

export interface IDIDManager {
  web3: Web3;

  registry: Contract;
  issuerDomain?: Contract;

  issuer: IIssuerManager;

  getRegistryDomainSeparator(): Promise<string>;
}

export interface IDIDController {
  did: IDIDManager;
}

export type DomainConfig = {
  icon?: string;
};

export type DomainQueryConfig = {
  issuerDomain?: string;
}

export interface IIssuerManager {
  at(issuer: Identity): Promise<Issuer>;
  domain(issuer: string, config?: DomainQueryConfig): Promise<Issuer>;

  create(
    domainName: string,
    icon: string,
    txOptions: SendOptions
  ): Promise<Identity>;
}

export interface Issuer {
  issuer: Identity;
  claimParser: (o: Claim) => ClaimHash;

  issueVerfiaibleCredential(
    identity: Identity,
    claim: Claim,
    expiredAt: Expiration
  ): Promise<void>;

  getCredentialHash(identity: Identity, claim: Claim): Promise<string>;
}
