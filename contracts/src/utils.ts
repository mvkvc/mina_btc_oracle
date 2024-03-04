import { Field, Character, Bool, assert } from 'o1js';
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
