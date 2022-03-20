// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import {
  ApolloClient,
  InMemoryCache,
  gql,
  DefaultOptions,
} from "@apollo/client";
import {
  GRAPH_MAINNET_HTTPS_URI,
  GRAPH_TESTNET_HTTPS_URI,
} from "../../support/mintbase";
import { supabase } from "../../support/supabaseClient";

type Data = {
  bands: any;
};

const FETCH_TOKEN = gql`
  query FetchToken($storeId: String!, $minterId: String!) {
    token(
      where: {
        storeId: { _eq: $storeId }
        burnedAt: { _is_null: true }
        minter: { _eq: $minterId }
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
      minter
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
  res: NextApiResponse<Data>
) {
  const {
    query: { storeId, bandId },
    method,
  } = req;

  if (method === "GET") {
    if (!storeId || !bandId) {
      return res.status(400);
    }

    const { data: bands } = await supabase
      .from("bands")
      .select("owner")
      .eq("id", bandId);

    if (!bands || bands.length !== 1) {
      return res.status(400);
    }

    const minterAccountId = bands[0].owner;

    try {
      const tokenResults = await client.query({
        query: FETCH_TOKEN,
        variables: {
          minterId: minterAccountId,
          storeId: storeId,
          offset: 0,
        },
      });

      const reshapedResults = tokenResults.data.token
        .filter((item: any) => item.thing.metadata)
        .map((result: any) => {
          return {
            id: result.id,
            ownerId: result.ownerId,
            title: result.thing.metadata?.title,
            eventTitle: result.thing.metadata?.extra?.event_title?.value,
            media: result.thing.metadata?.media,
            eventDate:
              result.thing.metadata?.extra?.event_date?.value !== null
                ? result.thing.metadata?.extra?.event_date?.value
                : 0,
            validFrom:
              result.thing.metadata?.extra?.valid_from?.value != null
                ? result.thing.metadata?.extra?.valid_from?.value
                : 0,
            validTo:
              result.thing.metadata?.extra?.valid_to?.value != null
                ? result.thing.metadata?.extra?.valid_to?.value
                : 0,
            artistName: result.thing.metadata?.extra?.artist_name?.value,
            createdAt: result.thing.createdAt,
            listedAt: !result.list?.removedAt ? result.list?.createdAt : null,
            listedPrice:
              !result.list?.removedAt && result.list?.price
                ? result.list?.price.toLocaleString("en-US", {
                    useGrouping: false,
                  })
                : null,
          };
        });

      const sortedResults = reshapedResults.sort(
        (
          a: { eventDate: string | number | Date },
          b: { eventDate: string | number | Date }
        ) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      );

      const groupByEventDate = sortedResults.reduce(
        (group: any[], result: any) => {
          const { eventDate, eventTitle } = result;

          const simplifiedDate = (theDate: Date) =>
            new Date(
              theDate.getFullYear(),
              theDate.getMonth(),
              theDate.getDate()
            ).toISOString();

          if (
            group.length === 0 ||
            simplifiedDate(new Date(eventDate)) !==
              simplifiedDate(new Date(group[group.length - 1].eventDate))
          ) {
            const entry: {
              eventDate: string;
              eventTitle: string;
              merch: any[];
            } = {
              eventDate: simplifiedDate(new Date(eventDate)),
              eventTitle: eventTitle,
              merch: [],
            };
            entry.merch.push(result);
            group.push(entry);
          } else {
            const entry = group[group.length - 1];
            entry.merch.push(result);
          }

          return group;
        },
        []
      );

      return res.status(200).json(groupByEventDate);
    } catch (err) {
      console.log(err);
      return res.status(404);
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
