import mempoolJS from "@mempool/mempool.js";
import { Block } from "@mempool/mempool.js/lib/interfaces";

export async function getLatestBlockHash() {
  const {
    bitcoin: { blocks },
  } = mempoolJS({
    hostname: "mempool.space",
  });

  const blocksTipHash = await blocks.getBlocksTipHash();
  return blocksTipHash;
}

export async function getRandomBlockHash() {
  const {
    bitcoin: { blocks },
  } = mempoolJS({
    hostname: "mempool.space",
  });

  const blocksTipHeight = await blocks.getBlocksTipHeight();
  const randomBlockHeight = Math.floor(Math.random() * blocksTipHeight);
  const blocksTipHash = await blocks.getBlockHeight({
    height: randomBlockHeight,
  });

  return blocksTipHash;
}

export async function getBlockData(hash: string): Promise<Block> {
  const {
    bitcoin: { blocks },
  } = mempoolJS({
    hostname: "mempool.space",
  });

  const block = await blocks.getBlock({ hash });
  return block;
}
