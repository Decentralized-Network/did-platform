import { expect } from 'chai';
import chai from 'chai';
import Web3 from 'web3';
import { Identity } from '../src/interfaces/credential';
import { DID } from './../src/did';
import {
  provider,
  registry as _registry,
  issuerDomain as _issuerDomain,
} from './environment';

chai.use(require('chai-as-promised'));

describe('IssuerDomain', () => {
  const domainName = `Test Domain ${Math.floor(Math.random() * 10000000)}`;
  const issuerAbi = require('../src/contracts/abi/issuer.interface.json');
  const web3 = new Web3(provider);
  const did = new DID({
    web3,
    registry: _registry,
    issuerDomain: _issuerDomain,
  });

  let issuerAddress: string;
  let identities: Identity[];

  before(async () => {
    [issuerAddress, ...identities] = await web3.eth.getAccounts();
  });

  it('Should create issuer by domain', async () => {
    const contractAddress = (await did.issuer.create(domainName, '', {
      from: issuerAddress,
    })) as any;

    const contract = new web3.eth.Contract(issuerAbi, contractAddress);

    expect(await contract.methods.domainName().call()).to.be.equal(domainName);
  });

  it('Should not create issuer with the duplicated domain name', async () => {
    expect(did.issuer.create(domainName, '', { from: issuerAddress })).to.be
      .rejected;

    expect(did.issuer.create(domainName, '', { from: identities[1] })).to.be
      .rejected;
  });

  it('Should find domain by domain name', async () => {
    expect(did.issuer.domain(domainName)).to.be.not.rejected;
  });

  it('Should be rejected for not registered domain name', async () => {
    expect(did.issuer.domain('Test DoMain')).to.be.rejected;
  });
});
