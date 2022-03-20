import type { NextPage } from "next";
import Head from "next/head";
import { Fragment, useEffect, useState, useContext } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { sortOptions } from "../support/data";
import { SearchIcon } from "@heroicons/react/solid";
import Fuse from "fuse.js";
import Header from "../components/Header";
import { classNames } from "../support/helpers";
import { WalletContext } from "../services/providers/MintbaseWalletContext";
import { format } from "date-fns";
import Spinner from "../components/Spinner";

const fuseOptions = {
  includeScore: true,
  keys: ["title"],
};

let fuse: Fuse<any[]>;

const MyNFTs: NextPage = () => {
  const [myNFTsList, setMyNFTsList] = useState<any[]>([]);
  const [myNFTs, setMyNFTs] = useState<any[]>([]);
  const { wallet, isConnected } = useContext(WalletContext);
  const [isLoading, setIsLoading] = useState(false);

  const storeId = process.env.NEXT_PUBLIC_STOREID;

  useEffect(() => {
    init();
  }, [wallet]);

  const init = async () => {
    try {
      setIsLoading(true);
      const ownerId = wallet?.activeAccount?.accountId;
      console.log(`ownerId: ${ownerId}`);
      if (ownerId) {
        const myNFTsResponse = await fetch(
          `/api/myNFTs?storeId=${storeId}&ownerId=${ownerId}`
        );
        if (myNFTsResponse.ok) {
          const jsonData = await myNFTsResponse.json();
          console.log({ jsonData });
          fuse = new Fuse(jsonData, fuseOptions);
          setMyNFTs(jsonData);
        }
        setIsLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const onHandleList = async (tokenId: string) => {
    try {
      if (!wallet || !storeId) {
        return;
      }

      const success = await wallet.list(
        tokenId.split(":")[0],
        storeId,
        "1000000000000000000000000"
      );
      console.log({ success });
    } catch (err) {
      console.log(err);
    }
  };

  const onHandleUnlist = async (tokenId: string) => {
    try {
      if (!wallet || !storeId) {
        return;
      }

      console.log(
        wallet.activeAccount?.accountId,
        tokenId.split(":")[0],
        storeId
      );
      const success = await wallet.transfer(
        [[tokenId.split(":")[0], "iangriggs.testnet"]],
        storeId
      );
      console.log({ success });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-[url('/background.png')] bg-center h-full">
      <div className="container h-full mx-auto max-w-7xl">
        <Head>
          <title>MyNFTs-Fantribal</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Header currentPageHref="/myNFTs" />
        <main className="h-screen bg-[#1A0848]">
          <div className="flex justify-between p-8 ">
            <h1 className="font-bold font-[Kanit] tracking-tight text-white sm:text-4xl">
              My NFTs
            </h1>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center pt-10">
              <Spinner className="w-10 h-10 text-white " />
            </div>
          ) : (
            <section>
              {isConnected ? (
                <div className="px-8">
                  {myNFTs &&
                    myNFTs.map((myNFT, myNFTIndex) => (
                      <div className="px-4 py-4 my-8 rounded-lg bg-indigo-600/50">
                        <p className="pb-4 font-bold text-white text-2xl font-[Kanit]">
                          {myNFT.artistName}
                        </p>
                        <div
                          key={myNFTIndex}
                          className="grid grid-cols-1 gap-y-10 sm:grid-cols-3 gap-x-6 lg:grid-cols-4"
                        >
                          {myNFT.merch.map((merch: any, merchIndex: number) => (
                            <a
                              key={merchIndex}
                              href={`#`}
                              id={merch.id}
                              className="group"
                            >
                              <div className="p-2 rounded-lg bg-white/90">
                                <p className="pb-2 text-sm font-bold truncate text-overflow:ellipsis">
                                  {merch.title}
                                </p>
                                <div className="w-full overflow-hidden bg-gray-200 rounded-lg aspect-w-1 aspect-h-1 xl:aspect-w-7 xl:aspect-h-8">
                                  <img
                                    src={merch.media}
                                    alt={merch.title}
                                    className="object-cover object-center w-full h-full group-hover:opacity-75"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <div className="py-2 space-y-1">
                                    <p className="text-sm truncate text-overflow:ellipsis">
                                      {merch.eventTitle}
                                    </p>
                                    <p className="text-xs font-light">
                                      {format(
                                        new Date(merch.eventDate),
                                        "do MMM yyyy"
                                      )}
                                    </p>
                                  </div>
                                  {!merch.listedAt ? (
                                    <button
                                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-violet-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                      onClick={() => onHandleList(merch.id)}
                                    >
                                      List for Sale
                                    </button>
                                  ) : (
                                    <button
                                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-violet-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                      onClick={() => onHandleUnlist(merch.id)}
                                    >
                                      Cancel Sale
                                    </button>
                                  )}
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="flex items-start justify-center h-screen">
                  <div className="flex flex-col items-center space-y-4">
                    <p className="text-white">
                      You need to be connected to view your personal NFT
                      collection.
                    </p>
                    <button
                      type="submit"
                      className="inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-violet-500 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => {
                        wallet?.connect({ requestSignIn: true });
                      }}
                    >
                      Please connect
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyNFTs;
