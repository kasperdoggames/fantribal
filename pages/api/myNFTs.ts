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

type Data = {
  bands: any;
};

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
  res: NextApiResponse<Data>
) {
  const {
    query: { storeId, ownerId },
    method,
  } = req;

  console.log({ storeId, ownerId });

  if (method === "GET") {
    if (!ownerId) {
      return res.status(400);
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

      console.log(tokenResults.data.token);

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
            listedPrice: !result.list?.removedAt ? result.list?.price : null,
          };
        });

      const sortedByEventDate = reshapedResults.sort(
        (
          a: { eventDate: string | number | Date },
          b: { eventDate: string | number | Date }
        ) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      );

      const groupByArtistName = sortedByEventDate.reduce(
        (group: any[], result: any) => {
          const { artistName } = result;

          if (
            group.length === 0 ||
            artistName !== group[group.length - 1].artistName
          ) {
            const entry: {
              artistName: string;
              merch: any[];
            } = {
              artistName: artistName,
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

      const sortedByArtistName = groupByArtistName.sort(
        (a: { artistName: string }, b: { artistName: string }) => {
          const artistNameA = a.artistName.toUpperCase();
          const artistNameB = b.artistName.toUpperCase();
          if (artistNameA < artistNameB) {
            return -1;
          }
          if (artistNameA > artistNameB) {
            return 1;
          }

          // names must be equal
          return 0;
        }
      );

      return res.status(200).json(sortedByArtistName);
    } catch (err) {
      console.log(err);
      return res.status(404);
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
