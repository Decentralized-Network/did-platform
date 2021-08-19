import { expect } from 'chai';
import { WalletIssuer } from '../src/IssuerManager';
import { did, web3 } from './environment';

describe('Registry', () => {
  let issuerAddress: string;

  before(async () => {
    issuerAddress = (await web3.eth.getAccounts())[0];
  });

  it('Should get registry code', async () => {
    // Test environment is defined in `environment.ts`. If this test is not
    // passed, please check the environment.
    const contractCode = await web3.eth.getCode(did.registry.options.address);
    expect(contractCode).to.not.equal('0x');
  });

  it('Should have valid domain separator in registry', async () => {
    // Every DID registry has domain separator to prevent replay attack,
    // which separates the same claim hash with other registries.
    const calculatedDomainSeparator = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['bytes32', 'bytes32', 'uint', 'address'],
        [
          web3.utils.keccak256(
            'DIDRegistry(string version,uint256 chainId,address verifyingContract)'
          ),
          web3.utils.keccak256('1'),
          await web3.eth.net.getId(),
          did.registry.options.address,
        ]
      )
    );

    expect(calculatedDomainSeparator).to.be.equal(
      await did.getRegistryDomainSeparator()
    );
  });
});
