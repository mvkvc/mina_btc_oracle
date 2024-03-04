import { SmartContract, state, State, method, Bool, Permissions } from 'o1js';
import {
  BTC_GENESIS_HASH,
  UNCOMPRESSED_FIELD_SIZE,
  BlockHash,
  BlockHashCompressed,
  blockHashCompress,
  blockHashUncompress,
  compareFields,
} from './utils.js';

export class BTCBlockOracle extends SmartContract {
  @state(BlockHashCompressed) blockHash1 = State<BlockHashCompressed>();
  @state(BlockHashCompressed) blockHash2 = State<BlockHashCompressed>();
  @state(BlockHashCompressed) blockHash3 = State<BlockHashCompressed>();
  @state(BlockHashCompressed) blockHash4 = State<BlockHashCompressed>();

  init(): void {
    super.init();
    this.account.permissions.set({
      ...Permissions.default(),
      editState: Permissions.signature(),
    });
    this.blockHash1.set(
      blockHashCompress(BlockHash.fromString(BTC_GENESIS_HASH))
    );
    this.blockHash2.set(
      blockHashCompress(BlockHash.fromString(BTC_GENESIS_HASH))
    );
    this.blockHash3.set(
      blockHashCompress(BlockHash.fromString(BTC_GENESIS_HASH))
    );
    this.blockHash4.set(
      blockHashCompress(BlockHash.fromString(BTC_GENESIS_HASH))
    );
  }

  @method update(blockHash: BlockHash): void {
    this.requireSignature();
    const blockHash1 = this.blockHash1.getAndRequireEquals();
    const blockHash2 = this.blockHash2.getAndRequireEquals();
    const blockHash3 = this.blockHash3.getAndRequireEquals();
    this.blockHash2.set(blockHash1);
    this.blockHash3.set(blockHash2);
    this.blockHash4.set(blockHash3);
    this.blockHash1.set(blockHashCompress(blockHash));
  }

  @method verify(blockHash: BlockHash): Bool {
    const compressedBlockHash1 = this.blockHash1.getAndRequireEquals();
    const compressedBlockHash2 = this.blockHash2.getAndRequireEquals();
    const compressedBlockHash3 = this.blockHash3.getAndRequireEquals();
    const compressedBlockHash4 = this.blockHash4.getAndRequireEquals();
    const blockHash1 = blockHashUncompress(compressedBlockHash1);
    const blockHash2 = blockHashUncompress(compressedBlockHash2);
    const blockHash3 = blockHashUncompress(compressedBlockHash3);
    const blockHash4 = blockHashUncompress(compressedBlockHash4);
    const check1 = compareFields(
      blockHash.toFields(),
      blockHash1.toFields(),
      UNCOMPRESSED_FIELD_SIZE
    );
    const check2 = compareFields(
      blockHash.toFields(),
      blockHash2.toFields(),
      UNCOMPRESSED_FIELD_SIZE
    );
    const check3 = compareFields(
      blockHash.toFields(),
      blockHash3.toFields(),
      UNCOMPRESSED_FIELD_SIZE
    );
    const check4 = compareFields(
      blockHash.toFields(),
      blockHash4.toFields(),
      UNCOMPRESSED_FIELD_SIZE
    );

    return check1.or(check2).or(check3).or(check4);
  }
}
