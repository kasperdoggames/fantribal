import { useRouter } from "next/router";
import Head from "next/head";
import { useContext, useEffect, useState, Fragment } from "react";
import axios from "axios";
import ArtistProfileHeader, {
  Tab,
} from "../../../components/ArtistProfileHeader";
import Header from "../../../components/Header";
import { WalletContext } from "../../../services/providers/MintbaseWalletContext";
import { Dialog, Transition } from "@headlessui/react";
import { createHash } from "crypto";
import { CONTRACT_NAME } from "../../../constants/mintbase";
import { toIpfsGatewayURL } from "../../../support/ipfsGateway";
import ImageGallery from "../../../components/ImageGallery";

export type Profile = {
  id: number;
  name: string;
  bio: string;
  cover_photo: string;
  images: { title: string; image_src: string }[];
  owner: string;
};

const Profile = () => {
  const router = useRouter();
  const { bandId } = router.query;

  const { wallet } = useContext(WalletContext);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploadPanelVisible, setUploadPaneVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [editBioVisible, setEditBioVisible] = useState(false);
  const [bio, setBio] = useState("");

  const signMessage = async () => {
    if (wallet && wallet.keyStore && wallet.activeAccount) {
      const hash = new Uint8Array(
        createHash("sha256").update("validation check").digest()
      );
      const keyPair = await wallet.keyStore.getKey(
        "testnet",
        wallet.activeAccount.accountId
      );
      const signed = keyPair.sign(hash);
      const signature = Buffer.from(signed.signature).toString("base64");
      return signature;
    }
  };

  const verifySignature = async (signedMessage: string) => {
    const accountId = wallet?.activeAccount?.accountId;
    const res = await axios.post("/api/verify", {
      signedMessage,
      accountId,
      contractName: CONTRACT_NAME,
    });
    if (res.status === 200) {
      return res.data.verified;
    }
    return false;
  };

  const uploadGalleryImage = async () => {
    const result = await fetch("/api/uploadImage", {
      method: "POST",
      body: selectedFile,
    });
    if (result.status === 200) {
      const json = await result.json();
      return json.ipfsUri;
    }
  };

  const addGalleryImage = async () => {
    if (!profile) {
      return;
    }
    if (!selectedFile) {
      return;
    }
    try {
      const signature = await signMessage();
      if (!signature) {
        console.log("No signature found");
        return;
      }
      const verified = await verifySignature(signature);
      if (!verified) {
        console.log("Signature was not verified");
        return;
      }
      const ipfsUri = await uploadGalleryImage();
      const newImage = {
        title: selectedFile?.name,
        image_src: ipfsUri,
      };
      const res = await axios.post("/api/bandImages", {
        image: { ...newImage, band_id: profile?.id },
      });
      if (res.status === 200) {
        const updatedProfile = {
          ...profile,
        };
        updatedProfile.images = profile?.images
          ? [...profile?.images, newImage]
          : [newImage];
        setProfile(updatedProfile);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const tabs: Tab[] = [
    { name: "Profile", href: `/profile/${bandId}`, current: true },
    { name: "Timeline", href: `/profile/${bandId}/timeline`, current: false },
  ];

  useEffect(() => {
    if (bandId) {
      init();
    }
  }, [bandId]);

  const init = async () => {
    const response = await axios.get(`/api/profile?bandId=${bandId}`);
    if (response.status === 200) {
      const profile = response.data.profile;
      setProfile(profile);
      setBio(profile.bio);
    } else {
      router.push("/bands");
    }
  };

  const saveUpdatedProfile = async (
    key: "name" | "bio" | "cover_photo",
    value: any
  ) => {
    const currentProfile = { ...profile };
    currentProfile[key] = value;
    delete currentProfile.images;
    const res = await axios.put("/api/profile", { profile: currentProfile });
    if (res.status === 200) {
      if (profile) {
        const updatedProfile = { ...profile };
        updatedProfile[key] = value;
        setProfile(updatedProfile);
      }
    }
  };

  return (
    profile && (
      <div className="bg-[url('/background.png')] bg-center h-full">
        <div className="container h-full mx-auto bg-white max-w-7xl">
          <Head>
            <title>Profile-FanTribal</title>
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Header currentPageHref="/profile" />
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
          <div className="relative h-screen p-10 overflow-hidden wrap">
            <div>
              <h2 className="text-2xl font-[Kanit] mb-4">Image Gallery</h2>
              <ul
                role="list"
                className="grid grid-cols-3 grid-rows-2 gap-x-1 gap-y-1"
              >
                {profile.images.slice(0, 3).map((file, index) => (
                  <li
                    key={index}
                    className={`relative ${
                      index === 0 && "col-span-2 row-span-2"
                    }`}
                    onClick={() => {
                      console.log("show dialog");
                      setShowGallery(true);
                    }}
                  >
                    <div className="bg-gray-100 group aspect-w-10 aspect-h-7 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500">
                      <img
                        src={toIpfsGatewayURL(file.image_src)}
                        alt=""
                        className="object-cover rounded-lg pointer-events-none group-hover:opacity-75"
                      />
                      {profile.images.length > 3 && index === 2 && (
                        <button className="font-bold text-white">
                          +{profile.images.length - 3} More
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {profile.owner === wallet?.activeAccount?.accountId && (
                <button
                  className="p-2 mt-2 text-sm text-white bg-indigo-600 rounded hover:underline"
                  onClick={() => {
                    setUploadPaneVisible(true);
                  }}
                >
                  + Add more
                </button>
              )}
            </div>
            <div className="mt-8">
              <h2 className="text-2xl font-[Kanit] mb-2">Bio</h2>
              <p>{profile.bio}</p>
              {profile.owner === wallet?.activeAccount?.accountId && (
                <div className="flex justify-start">
                  <button
                    className="p-2 mt-2 text-sm text-white bg-indigo-600 rounded hover:underline"
                    onClick={() => {
                      setEditBioVisible(true);
                    }}
                  >
                    Edit Bio
                  </button>
                </div>
              )}
            </div>
            <div className="mt-8">
              <h2 className="text-2xl font-bold font-[Kanit]">12</h2>
              <p>Tribe Member</p>
            </div>
          </div>
        </div>
        {uploadPanelVisible && (
          <Transition.Root show={uploadPanelVisible} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-50 overflow-y-auto"
              onClose={setUploadPaneVisible}
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
                          Upload Gallery Image
                        </Dialog.Title>
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
                                    <p>Select a file</p>
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
                                        setSelectedFile(e.target.files[0]);
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
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={async () => {
                          await addGalleryImage();
                          setUploadPaneVisible(false);
                        }}
                      >
                        Upload
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => setUploadPaneVisible(false)}
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
        {editBioVisible && (
          <Transition.Root show={editBioVisible} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-50 overflow-y-auto"
              onClose={setEditBioVisible}
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
                          className="text-xl text-gray-900 font-[Kanit]"
                        >
                          Edit Your Bio
                        </Dialog.Title>
                        <div className="mt-2">
                          <div className="rounded-md ">
                            <textarea
                              rows={3}
                              className="form-control block w-full  py-1.5 text-md bg-gray-100 hover:text-black focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100 font-normal text-gray-700 bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:outline-none"
                              value={bio ? bio : ""}
                              onChange={(e) => {
                                const bio = e.target.value;
                                setBio(bio);
                              }}
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        className="inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={async () => {
                          await saveUpdatedProfile("bio", bio);
                          setEditBioVisible(false);
                        }}
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => setEditBioVisible(false)}
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
        {showGallery && (
          <Transition.Root show={showGallery} as={Fragment}>
            <Dialog
              as="div"
              className="fixed inset-0 z-50 overflow-y-auto"
              onClose={setShowGallery}
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
                        <div className="mt-2">
                          <ImageGallery images={profile.images} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"></div>
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

export default Profile;
