import { CronJob } from "cron";
import {
  Update,
  BlockHash,
  Timestamp,
  getTimestamp,
} from "bitflip_contracts";
import {
  getLatestBlockHash,
  getRandomBlockHash,
  getBlockData,
} from "./mempool";

const GENESIS_BLOCK_HASH =
  "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";

let LATEST_BLOCK_HASH = "";

const main = async () => {
  const latestBlockHash = await getLatestBlockHash();

  if (LATEST_BLOCK_HASH !== latestBlockHash) {
    console.log("New block found");
    console.log(latestBlockHash);
    LATEST_BLOCK_HASH = latestBlockHash;
  }

  const blockData = await getBlockData(latestBlockHash);
  console.log(blockData);
};

const job = new CronJob(
  "* * * * * *", // cronTime
  function () {
    main();
  }, // onTick
  null, // onComplete
  true, // start
  "America/Los_Angeles", // timeZone
);
// job.start() is optional here because of the fourth parameter set to true.
