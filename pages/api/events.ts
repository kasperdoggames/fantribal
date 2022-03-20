import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../support/supabaseClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  if (method === "GET") {
    const { bandId } = req.query;
    try {
      const { data: events, error } = await supabase
        .from("events")
        .select(`id, title, token_id, event_date`)
        .eq("band_id", bandId);
      if (error || !events) {
        throw error;
      }

      return res.status(200).json({ events });
    } catch (err) {
      console.log(err);
      return res.status(404);
    }
  }
  if (method === "POST") {
    try {
      const { bandId, title, tokenId, eventDate } = req.body;
      const { data, error } = await supabase.from("events").insert([
        {
          title,
          token_id: tokenId,
          event_date: eventDate,
          band_id: bandId,
        },
      ]);
      if (error || !data || data?.length === 0) {
        throw error;
      }
      return res.status(200).json({ message: "done", event: data[0] });
    } catch (err) {
      console.log(err);
      return res.status(400);
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
