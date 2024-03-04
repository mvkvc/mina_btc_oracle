import { BTCBlockOracle } from './BTCBlockOracle.js';
import {
  BlockHash,
  blockHashCompress,
  BTC_GENESIS_HASH,
  blockHashUncompress,
} from './utils.js';
import { Mina, PrivateKey, PublicKey, AccountUpdate } from 'o1js';

let proofsEnabled = false;

describe('BTCBlockOracle', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: BTCBlockOracle;

  beforeAll(async () => {
    if (proofsEnabled) await BTCBlockOracle.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: senderKey, publicKey: senderAccount } =
      Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new BTCBlockOracle(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account BTCBlockOracle that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the `BTCBlockOracle` smart contract', async () => {
    await localDeploy();
    const blockHash1 = zkApp.blockHash1.get();
    const genesisBlock = BlockHash.fromString(BTC_GENESIS_HASH);
    const genesisBlockCompressed = blockHashCompress(genesisBlock);
    expect(blockHash1).toEqual(genesisBlockCompressed);
  });

  it('correctly updates the blockHash1 state on the `BTCBlockOracle` smart contract', async () => {
    await localDeploy();

    const latestBlockHash =
      '000000000000000000018f68fe07746b3a2c68424d763ab352ad8717aa0428e8';
    const newBlockHash = BlockHash.fromString(latestBlockHash);

    // BTCBlockOracle transaction
    const txn = await Mina.transaction(deployerAccount, () => {
      zkApp.update(newBlockHash);
    });

    await txn.prove();
    // await txn.sign([deployerKey]).send();
    const result = await txn.sign([deployerKey, zkAppPrivateKey]).send();

    const updatedBlockHashCompressed = zkApp.blockHash1.get();
    const updatedBlockHash = blockHashUncompress(updatedBlockHashCompressed);
    expect(updatedBlockHash).toEqual(newBlockHash);
  });
});
