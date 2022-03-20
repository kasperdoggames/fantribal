import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../support/supabaseClient";
import {
  ApolloClient,
  InMemoryCache,
  gql,
  DefaultOptions,
} from "@apollo/client";
import { GRAPH_TESTNET_HTTPS_URI } from "../../support/mintbase";

const FETCH_TOKEN = gql`
  query FetchToken($storeId: String!, $ownerId: String!) {
    token(
      where: {
        storeId: { _eq: $storeId }
        ownerId: { _eq: $ownerId }
        burnedAt: { _is_null: true }
      }
      order_by: { thing: { createdAt: desc } }
    ) {
      ownerId
      thing {
        metadata {
          title
          media
          extra
        }
        createdAt
      }
      id
      list {
        createdAt
        removedAt
        price
      }
    }
  }
`;

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  },
  query: {
    fetchPolicy: "no-cache",
    errorPolicy: "all",
  },
};

const client = new ApolloClient({
  uri: GRAPH_TESTNET_HTTPS_URI,
  cache: new InMemoryCache(),
  defaultOptions: defaultOptions,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    query: { storeId, ownerId, profileId },
    method,
  } = req;

  if (method === "GET") {
    if (!ownerId) {
      return res.status(400).json({ message: "bad request" });
    }

    if (!storeId) {
      return res.status(400).json({ message: "bad request" });
    }
    if (!profileId) {
      return res.status(400).json({ message: "bad request" });
    }
    try {
      const tokenResults = await client.query({
        query: FETCH_TOKEN,
        variables: {
          ownerId: ownerId,
          storeId: storeId,
          limit: 10,
          offset: 0,
        },
      });

      const results = tokenResults.data.token
        .filter(
          (item: any) =>
            item.thing.metadata &&
            Number(profileId) === item.thing.metadata?.extra?.artist_id?.value
        )
        .map((result: any) => {
          return {
            id: result.id,
            ownerId: result.ownerId,
            title: result.thing.metadata?.title,
            media: result.thing.metadata?.media,
            startDate: result.thing.metadata?.extra?.start_date?.value,
            createdAt: result.thing.createdAt,
            eventDate: result.thing.metadata?.extra?.event_date?.value,
            artist: result.thing.metadata?.extra?.artist?.value,
            eventId: result.thing.metadata?.extra?.event_id?.value,
            listedAt: !result.list?.removedAt ? result.list?.createdAt : null,
            listedPrice: !result.list?.removedAt ? result.list?.price : null,
          };
        });

      return res.status(200).json(results);
    } catch (err) {
      console.log(err);
      return res.status(404);
    }
  }
  if (method === "POST") {
    try {
      const { merch } = req.body;
      const { data, error } = await supabase.from("merch").insert([
        {
          ...merch,
        },
      ]);
      if (error || !data || data?.length === 0) {
        throw error;
      }
      return res.status(200).json({ message: "done", merch: data[0] });
    } catch (err) {
      console.log(err);
      return res.status(400);
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
