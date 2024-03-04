import {
  SmartContract,
  state,
  State,
  method,
  PublicKey,
  Field,
  Bool,
  assert,
  Character,
} from 'o1js';
import { MultiPackedStringFactory } from 'o1js-pack';

export const UNCOMPRESSED_FIELD_SIZE = 3;
export const BLOCKHASH_LEADING_ZEROES = 2;
export const BLOCKHASH_ENDING_EMPTY = 29;
export const BTC_GENESIS_HASH =
  '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f';

export class BlockHash extends MultiPackedStringFactory(
  UNCOMPRESSED_FIELD_SIZE
) {}
export class BlockHashCompressed extends MultiPackedStringFactory(
  UNCOMPRESSED_FIELD_SIZE - 1
) {}

export function blockHashCompress(blockHash: BlockHash): BlockHashCompressed {
  const chars = BlockHash.unpack(blockHash.toFields());
  const charsCompressed = chars.slice(
    BLOCKHASH_LEADING_ZEROES,
    -BLOCKHASH_ENDING_EMPTY
  );

  return BlockHashCompressed.fromCharacters(charsCompressed);
}

export function blockHashUncompress(blockHash: BlockHashCompressed): BlockHash {
  const chars = BlockHashCompressed.unpack(blockHash.toFields());

  for (let i = 0; i < BLOCKHASH_LEADING_ZEROES; i++) {
    chars.unshift(Character.fromString('0'));
  }

  return BlockHash.fromCharacters(chars);
}

export function compareFields(a: Field[], b: Field[], size: number): Bool {
  assert(a.length === b.length);

  let result = Bool(true);
  for (let i = 0; i < size; i++) {
    let check = a[i].equals(b[i]);
    result = result.and(check);
  }

  return result;
}

export class BTCBlockOracle extends SmartContract {
  @state(PublicKey) updater = State<PublicKey>();
  @state(BlockHash) blockHash1 = State<BlockHashCompressed>();
  @state(BlockHash) blockHash2 = State<BlockHashCompressed>();
  @state(BlockHash) blockHash3 = State<BlockHashCompressed>();

  init(): void {
    super.init();
    this.updater.set(this.sender);
    this.blockHash1.set(
      blockHashCompress(BlockHash.fromString(BTC_GENESIS_HASH))
    );
    this.blockHash2.set(
      blockHashCompress(BlockHash.fromString(BTC_GENESIS_HASH))
    );
    this.blockHash3.set(
      blockHashCompress(BlockHash.fromString(BTC_GENESIS_HASH))
    );
  }

  @method update(blockHash: BlockHash): void {
    const updater = this.updater.getAndRequireEquals();
    updater.assertEquals(this.sender);
    this.blockHash3.set(this.blockHash2.getAndRequireEquals());
    this.blockHash2.set(this.blockHash1.getAndRequireEquals());
    this.blockHash1.set(blockHash);
  }

  @method verify(blockHash: BlockHash): Bool {
    const compressedBlockHash1 = this.blockHash1.getAndRequireEquals();
    const compressedBlockHash2 = this.blockHash2.getAndRequireEquals();
    const compressedBlockHash3 = this.blockHash3.getAndRequireEquals();
    const blockHash1 = blockHashUncompress(compressedBlockHash1);
    const blockHash2 = blockHashUncompress(compressedBlockHash2);
    const blockHash3 = blockHashUncompress(compressedBlockHash3);
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

    return check1.or(check2).or(check3);
  }
}
