// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../support/supabaseClient";

type Data = {
  venues: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { method } = req;
  if (method === "GET") {
    try {
      const { data: venues } = await supabase.from("venues").select("*");
      return res.status(200).json({ venues });
    } catch (err) {
      console.log(err);
      return res.status(404);
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
