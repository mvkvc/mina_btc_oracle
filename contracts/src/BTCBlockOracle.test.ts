import { BTCBlockOracle, BlockHash, blockHashCompress, BTC_GENESIS_HASH } from './BTCBlockOracle';
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
    const blockHash = zkApp.blockHash1.get();
    const compressedGenesisBlockHash = blockHashCompress(BlockHash.fromString(BTC_GENESIS_HASH));
    expect(blockHash).toEqual(compressedGenesisBlockHash);
  });

  it('correctly updates the num state on the `BTCBlockOracle` smart contract', async () => {
    await localDeploy();

    const latestBlockHash = "000000000000000000018f68fe07746b3a2c68424d763ab352ad8717aa0428e8";
    const newBlockHash = BlockHash.fromString(latestBlockHash);

    // BTCBlockOracle transaction
    const txn = await Mina.transaction(deployerAccount, () => {
      zkApp.update(newBlockHash);
    });

    await txn.prove();
    await txn.sign([deployerKey]).send();

    const UpdatedBlockHash = zkApp.blockHash1.get();
    expect(UpdatedBlockHash).toEqual(newBlockHash);
  });
});
