import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../support/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  if (method === "POST") {
    try {
      const { image } = req.body;
      const { data, error } = await supabase.from("images").insert([
        {
          ...image,
        },
      ]);
      if (error || !data || data?.length === 0) {
        throw error;
      }

      //TODO: Check if not already a minter and if not add this account as a new minter. This needs
      // to be done in an api function as it has to be performed using dogfood20.testnet wallet on
      // behalf of the caller. The `grantMinter` contract operation can only be performed by owner
      // (the account that deployed the contract).

      return res.status(200).json({ message: "done", band: data[0] });
    } catch (err) {
      console.log(err);
      return res.status(400);
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
