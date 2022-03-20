import { useRouter } from "next/router";
import Head from "next/head";
import { useContext, useEffect, useState, Fragment } from "react";
import axios from "axios";
import ArtistProfileHeader from "../../../components/ArtistProfileHeader";
import Header from "../../../components/Header";
import { WalletContext } from "../../../services/providers/MintbaseWalletContext";
import { Profile } from "./index";
import { Dialog, Transition } from "@headlessui/react";
import DatePicker from "../../../components/DatePicker";
import { MetadataField } from "mintbase";
import { format } from "date-fns";
import Spinner from "../../../components/Spinner";
import { utils } from "near-api-js";

const TimeLine = () => {
  const router = useRouter();
  const { bandId } = router.query;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addEventVisible, setAddEventVisible] = useState(false);
  const { wallet } = useContext(WalletContext);
  const [eventTitle, setEventTitle] = useState<string | null>("");
  const [merchTitle, setMerchTitle] = useState<string | null>("");
  const [listingPrice, setListingPrice] = useState<string>("0.1");
  const [eventDate, setEventDate] = useState<number | null>(null);
  const [events, setEvents] = useState<{ [key: string]: any }[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [uploadNFTPanel, setUploadNFTPanel] = useState<{
    visible: boolean;
  }>({
    visible: false,
  });

  const [purchasePanel, setPurchasePanel] = useState<{
    tokenId: string | null;
    visible: boolean;
    media: string | null;
    title: string | null;
    listedAt?: string | null;
    listedPrice?: string | null;
  }>({
    tokenId: null,
    visible: false,
    media: null,
    title: null,
    listedAt: null,
    listedPrice: null,
  });

  const storeId = process.env.NEXT_PUBLIC_STOREID;

  useEffect(() => {
    if (bandId && wallet) {
      init();
    }
  }, [bandId, wallet]);

  useEffect(() => {
    const ownerId = wallet?.activeAccount?.accountId;
    if (!ownerId || !storeId) {
      return;
    }
    const getTokens = async () => {
      const response = await axios.get(
        `/api/timeline?storeId=${storeId}&bandId=${bandId}`
      );
      setEvents(response.data);
      setTimeout(() => {
        getTokens();
      }, 5000);
    };
    getTokens();
  }, [wallet, storeId]);

  const sleep = (time: number) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, time);
    });

  const init = async () => {
    try {
      const dateTimestamp = new Date().getTime();
      setEventDate(dateTimestamp);

      const response = await axios.get(`/api/profile?bandId=${bandId}`);
      if (response.status === 200) {
        const profile = response.data.profile;
        console.log({ profile });
        setProfile(profile);
      } else {
        router.push("/bands");
      }
    } catch (err) {
      router.push("/bands");
    }
  };

  const mintMerch = async () => {
    if (!wallet || !wallet.minter) {
      console.log("no minter");
      return;
    }
    if (!selectedFile) {
      console.log("no file selected");
      return;
    }
    if (!storeId) {
      console.log("no store ID");
      return;
    }
    try {
      setIsLoading(true);
      const { error: fileError } = await wallet.minter.uploadField(
        MetadataField.Media,
        selectedFile
      );

      if (fileError) {
        console.error(fileError);
        return;
      }

      const metaData = {
        title: merchTitle,
        extra: [
          {
            trait_type: "Valid From",
            value: new Date().toISOString(),
            display_type: "date",
          },
          {
            trait_type: "Valid To",
            value: new Date().toISOString(),
            display_type: "date",
          },
          { trait_type: "Event Title", value: eventTitle },
          {
            trait_type: "Event Date",
            value: new Date(eventDate).toISOString(),
            display_type: "date",
          },
          { trait_type: "Artist Name", value: profile?.name },
        ],
      };

      wallet.minter.setMetadata(metaData);
      console.log("To Mint");
      await wallet.mint(1, storeId);
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  const addMerch = async () => {
    await mintMerch();
  };

  const addMoreMerch = async () => {
    try {
      await mintMerch();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDateChange = ({
    year,
    month,
    date,
  }: {
    year: number;
    month: number;
    date: number;
  }) => {
    const paddedMonth = `${month}`.padStart(2, "0");
    const paddedDate = `${date}`.padStart(2, "0");
    const dateTimestamp = new Date(
      `${year}-${paddedMonth}-${paddedDate}T06:30:00`
    ).getTime();
    setEventDate(dateTimestamp);
  };

  const tabs = [
    { name: "Profile", href: `/profile/${bandId}`, current: false },
    { name: "Timeline", href: `/profile/${bandId}/timeline`, current: true },
  ];

  return (
    profile && (
      <div className="bg-[url('/background.png')] bg-center h-screen">
        <div className="container h-full mx-auto max-w-7xl">
          <Head>
            <title>Timeline-FanTribal</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Header currentPageHref="/timeline" />
          {bandId && typeof bandId === "string" ? (
            <ArtistProfileHeader
              bandId={profile.id}
              bandName={profile.name}
              bandCover={profile.cover_photo}
              tabs={tabs}
            />
          ) : (
            <div></div>
          )}
          <section className="sticky top-0 z-30 items-center w-1/3 mx-auto -mt-24 max-w-1xl">
            <div className="flex justify-center">
              <div className="flex flex-col">
                <div className="relative flex-1 px-6 pt-16 md:px-8 w-44 sm:w-56 md:w-64">
                  <img src="/guitarHead.png" />
                </div>
              </div>
            </div>
          </section>

          <div className="relative p-10 overflow-hidden wrap">
            <div
              className="absolute h-[5000px] w-[46px] sm:w-[64px] md:w-[70px] bg-contain bg-repeat-y -top-32 left-1/2 transform -translate-x-1/2 bg-center"
              style={{ backgroundImage: "url('/neck.png')" }}
            ></div>
            {events.map((event, index) => {
              console.log(event);
              return (
                <div key={index}>
                  <div
                    className={`flex ${
                      index % 2 === 1
                        ? "flex-row-reverse left-timeline"
                        : "right-timeline"
                    } items-center justify-between w-full mb-8`}
                  >
                    <div className="order-1 w-5/12"></div>
                    <div className="z-20 flex items-center justify-center order-1 w-4 h-4 p-4 border-2 border-black rounded-full bg-slate-100">
                      <h1 className="mx-auto text-xs font-semibold text-black">
                        {index + 1}
                      </h1>
                    </div>

                    <div className="order-1 w-5/12 px-6 py-4 bg-white rounded-lg shadow-xl">
                      <h3 className="mb-1 text-xs font-light text-gray-800 ">
                        {format(new Date(event.eventDate), "do MMM yyyy")}
                      </h3>
                      <h3 className="mb-3 text-sm font-bold text-gray-800">
                        {event.eventTitle}
                      </h3>
                      {isLoading ? (
                        <div className="flex items-center justify-center pt-10">
                          <Spinner className="w-10 h-10 text-black" />
                        </div>
                      ) : (
                        <ul
                          role="list"
                          className="grid grid-cols-3 grid-rows-1 gap-x-1 gap-y-1"
                        >
                          {event.merch &&
                            event.merch.map(
                              (merch: any, merchIndex: number) => (
                                <li
                                  key={merchIndex}
                                  className={`relative`}
                                  onClick={() => {
                                    console.log({
                                      tokenId: merch.id,
                                      visible: true,
                                      media: merch.media,
                                      title: merch.title,
                                      listedAt: merch.listedAt,
                                      listedPrice: merch.listedPrice,
                                    });
                                    setPurchasePanel({
                                      tokenId: merch.id,
                                      visible: true,
                                      media: merch.media,
                                      title: merch.title,
                                      listedAt: merch.listedAt,
                                      listedPrice: merch.listedPrice,
                                    });
                                  }}
                                >
                                  <div className=" group aspect-w-10 aspect-h-7 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500">
                                    <img
                                      src={`${merch.media}`}
                                      alt=""
                                      className="object-cover rounded-lg pointer-events-none group-hover:opacity-75"
                                    />
                                  </div>
                                </li>
                              )
                            )}
                        </ul>
                      )}
                      {profile.owner === wallet?.activeAccount?.accountId && (
                        <div className="flex justify-start">
                          <button
                            className="p-2 mt-4 text-sm font-bold text-white bg-indigo-600 rounded hover:underline"
                            onClick={() => {
                              console.log({ event });
                              setEventDate(event.eventDate);
                              setEventTitle(event.eventTitle);
                              setUploadNFTPanel({
                                visible: true,
                              });
                            }}
                          >
                            + Add more
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {profile.owner === wallet?.activeAccount?.accountId && (
              <div className="flex justify-end">
                <button
                  className="p-2 mt-2 text-sm font-bold text-white bg-indigo-600 rounded hover:underline"
                  onClick={() => {
                    setAddEventVisible(true);
                  }}
                >
                  + Add Event
                </button>
              </div>
            )}
          </div>
        </div>
        {addEventVisible && (
          <Transition.Root show={addEventVisible} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-50 overflow-y-auto"
              onClose={setAddEventVisible}
            >
              <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                </Transition.Child>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span
                  className="hidden sm:inline-block sm:align-middle sm:h-screen"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="items-center">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-xl font-[Kanit] text-gray-900"
                        >
                          Add Event
                        </Dialog.Title>
                        <div className="mt-4">
                          {isLoading ? (
                            <div className="flex items-center justify-center pt-10">
                              <Spinner className="w-10 h-10 text-black" />
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex flex-col text-sm text-gray-600">
                                <label
                                  className="block mb-2 text-sm font-bold text-gray-700"
                                  htmlFor="title"
                                >
                                  Event Title
                                  <input
                                    id="title"
                                    className="w-full h-10 px-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
                                    value={eventTitle ? eventTitle : ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setEventTitle(value);
                                    }}
                                  ></input>
                                </label>
                                <label
                                  className="block mb-2 text-sm font-bold text-gray-700"
                                  htmlFor="description"
                                >
                                  Merch Title
                                  <input
                                    id="nft_title"
                                    className="w-full h-10 px-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
                                    value={merchTitle ? merchTitle : ""}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setMerchTitle(value);
                                    }}
                                  ></input>
                                </label>
                                <div className="pt-4">
                                  <DatePicker onDateChange={handleDateChange} />
                                </div>

                                <div className="mt-2">
                                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                      <svg
                                        className="w-12 h-12 mx-auto text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                      >
                                        <path
                                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                      <div className="flex justify-center text-sm text-gray-600">
                                        <label
                                          htmlFor="file-upload"
                                          className="relative font-medium text-indigo-600 bg-white rounded-md cursor-pointer hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                        >
                                          {selectedFile ? (
                                            <p>{selectedFile.name}</p>
                                          ) : (
                                            <p>Select Merch to upload</p>
                                          )}
                                          <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            onChange={(e) => {
                                              if (
                                                e.target.files &&
                                                e.target.files?.length > 0
                                              ) {
                                                setSelectedFile(
                                                  e.target.files[0]
                                                );
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>
                                      <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF up to 10MB
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={async () => {
                          await addMerch();
                          setAddEventVisible(false);
                        }}
                      >
                        + Add
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {
                          setAddEventVisible(false);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition.Root>
        )}
        {uploadNFTPanel.visible && (
          <Transition.Root show={uploadNFTPanel.visible} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-50 overflow-y-auto"
              onClose={() =>
                setUploadNFTPanel({
                  visible: false,
                })
              }
            >
              <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                </Transition.Child>
                <span
                  className="hidden sm:inline-block sm:align-middle sm:h-screen"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="items-center">
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-xl font-[Kanit] text-gray-900"
                        >
                          Add Merch to Event
                        </Dialog.Title>
                        <div className="mt-2">
                          {isLoading ? (
                            <div className="flex items-center justify-center pt-10">
                              <Spinner className="w-10 h-10 text-black" />
                            </div>
                          ) : (
                            <div className="pt-5 pb-6 rounded-md">
                              <div className="space-y-1">
                                <div className="flex flex-col text-sm text-gray-600">
                                  <label
                                    className="block mb-2 text-sm font-bold text-gray-700"
                                    htmlFor="description"
                                  >
                                    Merch Title
                                    <input
                                      id="nft_title"
                                      className="w-full h-10 px-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
                                      value={merchTitle ? merchTitle : ""}
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        setMerchTitle(value);
                                      }}
                                    ></input>
                                  </label>
                                  <div className="mt-2">
                                    <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                      <div className="space-y-1 text-center">
                                        <svg
                                          className="w-12 h-12 mx-auto text-gray-400"
                                          stroke="currentColor"
                                          fill="none"
                                          viewBox="0 0 48 48"
                                          aria-hidden="true"
                                        >
                                          <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                        <div className="flex justify-center text-sm text-gray-600">
                                          <label
                                            htmlFor="file-upload"
                                            className="relative font-medium text-indigo-600 bg-white rounded-md cursor-pointer hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                          >
                                            {selectedFile ? (
                                              <p>{selectedFile.name}</p>
                                            ) : (
                                              <p>Select Merch to upload</p>
                                            )}
                                            <input
                                              id="file-upload"
                                              name="file-upload"
                                              type="file"
                                              className="sr-only"
                                              onChange={(e) => {
                                                if (
                                                  e.target.files &&
                                                  e.target.files?.length > 0
                                                ) {
                                                  setSelectedFile(
                                                    e.target.files[0]
                                                  );
                                                }
                                              }}
                                            />
                                          </label>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                          PNG, JPG, GIF up to 10MB
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={async () => {
                          await addMoreMerch();
                          setUploadNFTPanel({
                            visible: false,
                          });
                        }}
                      >
                        + Add
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {
                          setUploadNFTPanel({
                            visible: false,
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition.Root>
        )}
        {purchasePanel.visible && (
          <Transition.Root show={purchasePanel.visible} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-50 overflow-y-auto"
              onClose={() =>
                setPurchasePanel({
                  tokenId: null,
                  visible: false,
                  media: null,
                  title: null,
                  listedAt: null,
                  listedPrice: null,
                })
              }
            >
              <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
                </Transition.Child>

                {/* This element is to trick the browser into centering the modal contents. */}
                <span
                  className="hidden sm:inline-block sm:align-middle sm:h-screen"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <div className="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div className="items-center">
                      <div className="mt-3 text-center sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-xl font-[Kanit] text-gray-900"
                        >
                          {purchasePanel.title}
                        </Dialog.Title>
                        <div className="mt-2">
                          <div className="rounded-md">
                            <div className="space-y-1 text-center">
                              <div className="flex flex-col justify-center text-sm text-gray-600">
                                <div className="flex justify-center rounded-md">
                                  <div className="space-y-1 text-center">
                                    {purchasePanel.media && (
                                      <img
                                        src={`${purchasePanel.media}`}
                                        alt=""
                                        className="object-cover rounded-lg pointer-events-none group-hover:opacity-75"
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col mt-2 space-y-2">
                      {purchasePanel.listedPrice ? (
                        <div className="flex items-baseline space-x-2">
                          <span className="text-xl font-bold">
                            {utils.format.formatNearAmount(
                              purchasePanel.listedPrice
                            )}
                          </span>
                          <span className="text-sm font-bold">NEAR</span>
                        </div>
                      ) : (
                        <div>
                          <label
                            className="block mb-2 text-sm font-bold text-gray-700"
                            htmlFor="description"
                          >
                            Price (NEAR)
                            <input
                              id="listing_price"
                              className="w-full h-10 px-2 font-semibold text-gray-700 bg-gray-100 border rounded outline-none focus:outline-none text-md hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100"
                              value={listingPrice ? listingPrice : ""}
                              onChange={(e) => {
                                const value = e.target.value;
                                setListingPrice(value);
                              }}
                            ></input>
                          </label>
                        </div>
                      )}
                      <div className="sm:flex sm:flex-row-reverse">
                        <button
                          type="button"
                          className="inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={async () => {
                            if (purchasePanel.tokenId && storeId) {
                              try {
                                purchasePanel.listedAt
                                  ? await wallet?.makeOffer(
                                      purchasePanel.tokenId,
                                      purchasePanel.listedPrice
                                    )
                                  : profile.owner ===
                                      wallet?.activeAccount?.accountId &&
                                    (await wallet?.list(
                                      purchasePanel.tokenId.split(":")[0],
                                      storeId,
                                      utils.format.parseNearAmount(listingPrice)
                                    ));
                              } catch (err) {
                                console.log(err);
                              }
                              setPurchasePanel({
                                tokenId: null,
                                visible: false,
                                media: null,
                                title: null,
                                listedAt: null,
                                listedPrice: null,
                              });
                            }
                          }}
                        >
                          {purchasePanel.listedAt
                            ? "Purchase Merch"
                            : "List NFT"}
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => {
                            setPurchasePanel({
                              tokenId: null,
                              visible: false,
                              media: null,
                              title: null,
                              listedAt: null,
                              listedPrice: null,
                            });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </Transition.Child>
              </div>
            </Dialog>
          </Transition.Root>
        )}
      </div>
    )
  );
};

export default TimeLine;
