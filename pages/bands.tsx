import type { NextPage } from "next";
import Head from "next/head";
import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { sortOptions } from "../support/data";
import ArtistBanner from "../components/ArtistBanner";
import { SearchIcon } from "@heroicons/react/solid";
import Fuse from "fuse.js";
import Header from "../components/Header";
import { classNames } from "../support/helpers";
import { toIpfsGatewayURL } from "../support/ipfsGateway";

const fuseOptions = {
  includeScore: true,
  keys: ["name"],
};

let fuse: Fuse<any[]>;

const Bands: NextPage = () => {
  const [bandList, setBandList] = useState<any[]>([]);
  const [bands, setBands] = useState<any[]>([]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const bandResponse = await fetch("/api/bands");
      if (bandResponse.ok) {
        const jsonData = await bandResponse.json();
        fuse = new Fuse(jsonData.bands, fuseOptions);
        setBands(jsonData.bands);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-[url('/background.png')] bg-center h-full">
      <div className="container h-full mx-auto max-w-7xl">
        <Head>
          <title>Bands-Fantribal</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Header currentPageHref="/bands" />
        <div>
          <main className="">
            <ArtistBanner />
            <div className="flex justify-between px-4 py-8 ">
              <h1 className="font-bold font-[Kanit] tracking-tight text-white sm:text-4xl">
                Artists and Bands
              </h1>
              <div className="flex">
                <div className="flex items-center">
                  <Menu
                    as="div"
                    className="relative z-10 inline-block text-left"
                  >
                    <div className="pr-4">
                      <Menu.Button className="inline-flex justify-center text-sm font-medium text-white group ">
                        Sort
                        <ChevronDownIcon
                          className="flex-shrink-0 w-5 h-5 ml-1 -mr-1 text-white"
                          aria-hidden="true"
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 w-40 mt-2 origin-top-right bg-white rounded-md shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1">
                          {sortOptions.map((option) => (
                            <Menu.Item key={option.name}>
                              {({ active }) => (
                                <a
                                  href={option.href}
                                  className={classNames(
                                    option.current
                                      ? "font-medium text-gray-900"
                                      : "text-gray-500",
                                    active ? "bg-gray-100" : "",
                                    "block px-4 py-2 text-sm"
                                  )}
                                >
                                  {option.name}
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <div className="flex justify-center lg:ml-6 lg:justify-end">
                  <div className="w-full max-w-lg lg:max-w-xs">
                    <label htmlFor="search" className="sr-only">
                      Search
                    </label>
                    <div className="flex flex-col h-full">
                      <div className="relative flex">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <SearchIcon
                            className="w-5 h-5 text-gray-400"
                            aria-hidden="true"
                          />
                        </div>
                        <input
                          autoComplete="off"
                          id="search"
                          name="search"
                          className="block w-full py-2 pl-10 leading-5 text-gray-300 placeholder-gray-400 border rounded-md focus:outline-none focus:bg-white focus:border-white focus:text-gray-900 sm:text-sm"
                          placeholder="Search"
                          type="search"
                          onChange={(e) => {
                            const results = fuse.search(e.target.value);
                            if (results && results.length > 0) {
                              setBandList(
                                results.filter(
                                  (result) =>
                                    result.score && result.score < 0.05
                                )
                              );
                            } else {
                              setBandList([]);
                            }
                          }}
                        />
                        <button className="p-2 ml-2 font-bold text-white bg-indigo-600 rounded">
                          Go
                        </button>
                      </div>
                      <div className="relative">
                        <ul className="absolute w-full mt-1">
                          {bandList.map((bandResult) => (
                            <li
                              key={bandResult.refIndex}
                              className="p-2 text-gray-900 bg-white hover:bg-gray-500"
                            >
                              <a href={`#${bandResult.item.id}`}>
                                <div className="w-full">
                                  {bandResult.item.name}
                                </div>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <section aria-labelledby="products-heading" className="pt-6 pb-24">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10">
                <form className="sticky hidden lg:block max-h-20 top-40">
                  <p className="p-4 text-white">Quick List</p>
                  <ul
                    role="list"
                    className="p-4 space-y-4 overflow-auto font-medium"
                  >
                    {bands.map((band) => (
                      <li key={band.name}>
                        <a className="text-white" href={`#${band.id}`}>
                          {band.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </form>
                {/* band grid */}
                <div className="lg:col-span-3">
                  <div className="grid grid-cols-1 px-4 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3">
                    {bands.map((band, index) => (
                      <a
                        key={index}
                        href={`/profile/${band.id}`}
                        id={band.id}
                        className="group"
                      >
                        <div className="p-2 rounded bg-white/90">
                          <div className="w-full overflow-hidden bg-gray-200 rounded-lg aspect-w-1 aspect-h-1 xl:aspect-w-7 xl:aspect-h-8">
                            <img
                              src={toIpfsGatewayURL(band.thumbnail)}
                              alt={band.name}
                              className="object-cover object-center w-full h-full group-hover:opacity-75"
                            />
                          </div>
                          <h3 className="px-2 pt-4 pb-2 text-xs truncate text-overflow:ellipsis">
                            {band.name}
                          </h3>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Bands;
