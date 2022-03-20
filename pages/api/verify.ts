import type { NextApiRequest, NextApiResponse } from "next";
import { Near, keyStores } from "near-api-js";
import * as nacl from "tweetnacl";
import * as bs58 from "bs58";
import { createHash } from "crypto";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  if (method === "POST") {
    try {
      const { signedMessage, accountId, contractName } = req.body;
      const config = {
        networkId: "testnet",
        nodeUrl: "https://rpc.testnet.near.org",
      };

      const keyStore = new keyStores.InMemoryKeyStore();
      const { networkId, nodeUrl } = config;
      const near = new Near({
        networkId,
        nodeUrl,
        deps: { keyStore },
      });

      const nearAccount = await near.account(accountId);
      const hash = new Uint8Array(
        createHash("sha256").update("validation check").digest()
      );

      let accessKeys = await nearAccount.getAccessKeys();
      if (contractName) {
        accessKeys = accessKeys.filter(
          ({
            access_key: { permission },
          }: {
            access_key: { [key: string]: any };
          }) =>
            permission &&
            permission.FunctionCall &&
            permission.FunctionCall.receiver_id === contractName
        );
      } else {
        accessKeys = accessKeys.filter(
          ({
            access_key: { permission },
          }: {
            access_key: { [key: string]: any };
          }) => permission === "FullAccess"
        );
      }
      const verified = accessKeys.some(
        ({ public_key }: { public_key: string }) => {
          const publicKey = public_key.replace("ed25519:", "");
          const verified = nacl.sign.detached.verify(
            hash,
            Buffer.from(signedMessage, "base64"),
            bs58.decode(publicKey)
          );
          return verified;
        }
      );
      return res.status(200).json({ message: "done", verified });
    } catch (err) {
      console.log(err);
      return res.status(400);
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
