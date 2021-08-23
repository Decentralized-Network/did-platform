import Web3 from 'web3';
import { Contract, SendOptions } from 'web3-eth-contract';
import { IDIDManager, Issuer } from './interfaces';
import { Claim, Expiration, Identity } from './interfaces/credential';
import { keccak256, toEtherTimestamp } from './utils';

const _issuerInterfaceJson = require('./contracts/abi/issuer.interface.json');

/**
 * checks if the address is the contract that is an issuer which manages verifiable credentials.
 *
 * @param address ethereum address.
 * @returns true if it's contract or false.
 */
export const isIssuerContract = async (web3: Web3, address: Identity) => {
  return (await web3.eth.getCode(address)) !== '0x';
};

export const defaultClaimParser = (o: Object) => {
  return JSON.stringify(o);
};

export const getIssuer = async (
  did: IDIDManager,
  issuer: Identity
): Promise<Issuer> => {
  if (await isIssuerContract(did.web3, issuer)) {
    return new ContractIssuer(did, issuer);
  } else {
    return new WalletIssuer(did, issuer);
  }
};

export class WalletIssuer implements Issuer {
  did: IDIDManager;
  issuer: Identity;
  claimParser = defaultClaimParser;

  constructor(did: IDIDManager, issuer: Identity) {
    this.did = did;
    this.issuer = issuer;
  }

  async issueVerfiaibleCredential(
    identity: Identity,
    claim: Claim,
    expiredAt: Expiration,
    txOptions?: SendOptions
  ): Promise<void> {
    await this.did.registry.methods
      .validateCredential(
        identity,
        await this.getCredentialHash(identity, claim),
        toEtherTimestamp(expiredAt)
      )
      .send({ from: this.issuer, ...(txOptions || {}) });
  }

  async getCredentialHash(identity: Identity, claim: Claim): Promise<string> {
    return keccak256(
      this.did.web3.eth.abi.encodeParameters(
        ['bytes32', 'address', 'bytes32'],
        [
          await this.did.registry.methods.DOMAIN_SEPARATOR().call(),
          identity,
          keccak256(this.claimParser(claim)),
        ]
      )
    );
  }

  async delegate(
    identity: Identity,
    expiredAt: Expiration,
    txOptions?: SendOptions
  ): Promise<void> {
    throw new Error('Wallet issuer cannot delegate');
  }

  async isIssuable(identity: Identity): Promise<boolean> {
    // Only issuer can issue in wallet issuer
    return identity === this.issuer;
  }

  async validateCredential(identity: Identity, claim: Claim): Promise<boolean> {
    const credentialHash = await this.getCredentialHash(identity, claim);
    return await this.did.registry.methods
      .checkCredential(this.issuer, credentialHash)
      .call();
  }
}

export class ContractIssuer implements Issuer {
  did: IDIDManager;
  issuer: Identity;
  contract: Contract;
  claimParser = defaultClaimParser;

  constructor(did: IDIDManager, issuer: Identity) {
    this.did = did;
    this.issuer = issuer;
    this.contract = new this.did.web3.eth.Contract(
      _issuerInterfaceJson,
      issuer
    );
  }

  async issueVerfiaibleCredential(
    identity: Identity,
    claim: Claim,
    expiredAt: Expiration,
    txOptions: SendOptions
  ): Promise<void> {
    return await this.contract.methods
      .issue(identity, await this.getCredentialHash(identity, claim), expiredAt)
      .send(txOptions);
  }

  async getCredentialHash(identity: Identity, claim: Claim): Promise<string> {
    return await this.contract.methods
      .getCredentialHash(identity, keccak256(this.claimParser(claim)))
      .call();
  }

  async delegate(
    identity: Identity,
    expiredAt: Expiration,
    txOptions: SendOptions
  ): Promise<void> {
    return await this.contract.methods
      .addDelegate(identity, toEtherTimestamp(expiredAt))
      .send(txOptions);
  }

  async isIssuable(identity: Identity): Promise<boolean> {
    return await this.contract.methods.isIssuable(identity).call();
  }

  async validateCredential(identity: Identity, claim: Claim): Promise<boolean> {
    const credentialHash = await this.getCredentialHash(identity, claim);
    return await this.did.registry.methods
      .checkCredential(this.issuer, credentialHash)
      .call();
  }
}
