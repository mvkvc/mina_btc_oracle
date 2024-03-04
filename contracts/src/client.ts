import { Mina, NetworkId, PrivateKey, PublicKey } from 'o1js';
import { BTCBlockOracle } from './BTCBlockOracle.js';
import { BlockHash } from './utils.js';

export async function submitUpdate(
  blockHash: string,
  feepayerAddress: PublicKey,
  feepayerKey: PrivateKey,
  zkAppKey: PrivateKey,
  fee: number = 0.1,
  network: string = "testnet",
  url: string = "https://proxy.berkeley.minaexplorer.com/graphql"
): Promise<void> {
  const Network = Mina.Network({
    networkId: network as NetworkId,
    mina: url
  });
  fee = fee * 1e9;
  Mina.setActiveInstance(Network);
  let zkAppAddress = zkAppKey.toPublicKey();
  let zkApp = new BTCBlockOracle(zkAppAddress);
  await BTCBlockOracle.compile();
  let tx = await Mina.transaction({ sender: feepayerAddress, fee }, () => {
    zkApp.update(BlockHash.fromString(blockHash));
  });
  const sentTx = await tx.sign([feepayerKey, zkAppKey]).send();
  if (sentTx?.hash() !== undefined) {
    console.log(`
    Success! Update transaction sent.

    Your smart contract state will be updated
    as soon as the transaction is included in a block:
    ${getTxnUrl(url, sentTx.hash())}
    `);
  }
}

function getTxnUrl(graphQlUrl: string, txnHash: string | undefined) {
  const txnBroadcastServiceName = new URL(graphQlUrl).hostname
    .split('.')
    .filter((item) => item === 'minascan' || item === 'minaexplorer')?.[0];
  const networkName = new URL(graphQlUrl).hostname
    .split('.')
    .filter((item) => item === 'berkeley' || item === 'testworld')?.[0];
  if (txnBroadcastServiceName && networkName) {
    return `https://minascan.io/${networkName}/tx/${txnHash}?type=zk-tx`;
  }
  return `Transaction hash: ${txnHash}`;
}