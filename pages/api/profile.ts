import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../support/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  if (method === "GET") {
    const {
      query: { bandId },
    } = req;
    const { data, error } = await supabase
      .from("bands")
      .select(
        `id, name, bio, cover_photo, owner,
      images (title, image_src)`
      )
      .eq("id", bandId)
      .limit(1);

    if (error) {
      console.log(error);
      return res.status(500).send("");
    }
    if (!data || data.length === 0) {
      return res.status(404);
    }
    return res.status(200).json({ profile: data[0] });
  }
  if (method === "POST") {
    try {
      const profile = req.body.profile;
      const { data, error } = await supabase.from("bands").insert([
        {
          name: profile.name,
          bio: profile.bio,
          cover_photo: profile.coverPhoto,
          thumbnail: profile.coverPhoto,
          owner: profile.owner,
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
  }
  if (method === "PUT") {
    const profile = req.body.profile;
    try {
      const { data, error } = await supabase
        .from("bands")
        .update({ ...profile })
        .match({ id: profile.id });
      if (error || !data || data?.length === 0) {
        throw error;
      }
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
