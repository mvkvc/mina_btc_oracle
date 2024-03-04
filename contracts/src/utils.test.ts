import { BTCBlockOracle } from './BTCBlockOracle.js';
import {
  BlockHash,
  blockHashCompress,
  BTC_GENESIS_HASH,
  blockHashUncompress,
} from './utils.js';

describe('utils', () => {
  let testHashStr: string;

  beforeAll(async () => {
    testHashStr =
      '000000000000000000018f68fe07746b3a2c68424d763ab352ad8717aa0428e8';
  });

  beforeEach(() => {});

  it('check compression', async () => {
    const testHash = BlockHash.fromString(testHashStr);
    expect(testHashStr).toEqual(testHash.toString());
  });

  it('check string matches after import', async () => {
    const testHash = BlockHash.fromString(testHashStr);
    expect(testHashStr).toEqual(testHash.toString());
  });

  it('check string matches after import and compression', async () => {
    const testHash = BlockHash.fromString(testHashStr);
    const testHashCompressed = blockHashCompress(testHash);
    const testHashUncompressed = blockHashUncompress(testHashCompressed);
    expect(testHashStr).toEqual(testHashUncompressed.toString());
    expect(testHash).toEqual(testHashUncompressed);
  });
});
