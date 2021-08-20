import { expect } from 'chai';
import chai from 'chai';
import Web3 from 'web3';
import { Issuer } from '../src/interfaces';
import { Identity } from '../src/interfaces/credential';
import { DID } from './../src/did';
import { provider, registry as _registry } from './environment';

chai.use(require('chai-as-promised'));

describe('WalletIssuer', () => {
  const web3 = new Web3(provider);
  const did = new DID({ web3, registry: _registry });
  const { registry } = did;

  let issuerAddress: string;
  let issuer: Issuer;
  let identities: Identity[];

  const testClaim = {
    alumniOf: {
      name: 'Hanyang Univ.',
    },
  };

  const expirationGenerator = (seconds?: number) =>
    Math.floor(new Date().getTime() / 1000) + (seconds ? seconds : 86400);

  before(async () => {
    [issuerAddress, ...identities] = await web3.eth.getAccounts();
    issuer = await did.issuer.at(issuerAddress);
  });

  // Instance generated from DID Manager should be wallet issuer, not
  // contract issuer when the address is not contract.
  it('Should be wallet issuer', async () => {
    expect(issuer).to.not.have.all.keys('contract');
  });

  // When issuing credentials with a personal wallet, credential hash
  // should be saved in DID registry contract.
  it('Should generate credential', async () => {
    const credentialHash = await issuer.getCredentialHash(
      identities[0],
      testClaim
    );

    await issuer.issueVerfiaibleCredential(
      identities[0],
      testClaim,
      expirationGenerator()
    );

    // expected the expiration timestamp in the credential hash key.
    expect(
      await registry.methods.credentials(issuerAddress, credentialHash).call()
    ).to.be.not.equal(0);

    // check validation with contract call
    expect(
      await registry.methods
        .checkCredential(issuerAddress, credentialHash)
        .call()
    ).to.be.equal(true);
  });

  it('Should fail validation for expired credential', async () => {
    const credentialHash = await issuer.getCredentialHash(
      identities[1],
      testClaim
    );

    await issuer.issueVerfiaibleCredential(
      identities[1],
      testClaim,
      expirationGenerator(-86400)
    );

    // check validation failure with expired credentials
    expect(
      await registry.methods
        .checkCredential(issuerAddress, credentialHash)
        .call()
    ).to.be.not.equal(true);
  });

  it('Should not delegate other', async () => {
    expect(issuer.delegate(identities[0], expirationGenerator())).to.be
      .rejected;
  });
});
