import { CronJob } from "cron";
import { BTC_GENESIS_HASH, submitUpdate } from "mina_btc_oracle_contracts";
import { PrivateKey } from "o1js";
import dotenv from "dotenv";

dotenv.config();

let LATEST_BLOCK_HEIGHT = 0;
let LATEST_BLOCK_HASH = BTC_GENESIS_HASH;
const URL_BLOCKCHAIN_COM = "https://blockchain.info/latestblock";
const KEY_FEE_PAYER_STR = process.env.KEY_PRIVATE_DEV || "";
const KEY_ZKAPP_STR = process.env.KEY_PRIVATE_ZKAPP || "";
const TX_FEE = Number.parseFloat(process.env.TX_FEE || "0.05");

const KEY_FEE_PAYER = PrivateKey.fromBase58(KEY_FEE_PAYER_STR);
const KEY_ZKAPP = PrivateKey.fromBase58(KEY_ZKAPP_STR);
const ADDRESS_FEE_PAYER = KEY_FEE_PAYER.toPublicKey();

type APIResponse = {
  height: number;
  hash: string;
};

export async function getLatestBlockHash(
  url: string = URL_BLOCKCHAIN_COM,
): Promise<APIResponse | null> {
  let result;
  try {
    const res = await fetch(URL_BLOCKCHAIN_COM);
    const json: APIResponse = await res.json();
    return { height: json.height, hash: json.hash };
  } catch (e) {
    console.log("ERROR: ", e);
    return null;
  }
}

const main = async () => {
  const result = await getLatestBlockHash();

  if (result !== null) {
    if (
      LATEST_BLOCK_HEIGHT < result.height &&
      LATEST_BLOCK_HASH !== result.hash
    ) {
      LATEST_BLOCK_HEIGHT = result.height;
      LATEST_BLOCK_HASH = result.hash;

      console.log("HEIGHT: ", LATEST_BLOCK_HEIGHT);
      console.log("HASH: ", LATEST_BLOCK_HASH);

      try {
        await submitUpdate(
          result.hash,
          ADDRESS_FEE_PAYER,
          KEY_FEE_PAYER,
          KEY_ZKAPP,
          TX_FEE,
        );
      } catch (e) {
        console.log(e);
      }
    }
  }
};

// const job = new CronJob(
//   "*/2 * * * *",
//   function () {
//     main();
//   },
//   null,
//   true,
//   "America/Los_Angeles",
// );

main();