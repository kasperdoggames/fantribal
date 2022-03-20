import { useState, useContext, ChangeEvent } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useRouter } from "next/router";
import { WalletContext } from "../services/providers/MintbaseWalletContext";
import { createHash } from "crypto";
import { classNames } from "../support/helpers";
import { CONTRACT_NAME } from "../constants/mintbase";

type Profile = {
  name: string;
  bio: string;
  coverPhoto: string;
  owner: string;
};

const CreateProfile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>({
    name: "",
    bio: "",
    coverPhoto: "",
    owner: "",
  });
  const { wallet, isConnected } = useContext(WalletContext);
  const [hasName, setHasName] = useState(true);
  const [hasBio, setHasBio] = useState(true);
  const [hasCoverPhoto, setHasCoverPhoto] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const updateProfile = (updatedValue: any) => {
    const currentProfile = profile;
    setProfile({ ...currentProfile, ...updatedValue });
  };

  const validateName = (value: string) => {
    setHasName(true);
    if (value.length === 0) {
      setHasName(false);
    }
  };

  const onHandleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    validateName(value);
    updateProfile({ name: value });
  };

  const validateBio = (value: string) => {
    setHasBio(true);
    if (value.length === 0) {
      setHasBio(false);
    }
  };

  const onHandleBioChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    validateBio(value);
    updateProfile({ bio: value });
  };

  const validateForm = () => {
    let validated = true;
    setHasName(true);
    setHasBio(true);
    setHasCoverPhoto(true);

    if (profile.name.length === 0) {
      setHasName(false);
      validated = false;
    }

    if (profile.bio.length === 0) {
      setHasBio(false);
      validated = false;
    }

    if (!selectedFile) {
      setHasCoverPhoto(false);
      validated = false;
    }

    return validated;
  };

  const uploadCoverPhoto = async () => {
    console.log("Uploading cover photo");
    try {
      const result = await fetch("api/uploadImage", {
        method: "POST",
        body: selectedFile,
      });
      if (result.status === 200) {
        const json = await result.json();
        return json.ipfsUri;
      }
    } catch (err) {
      console.log("error in upload of cover photo: ", err);
      return;
    }
  };

  const onSubmitForm = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      if (validateForm()) {
        const signature = await signMessage();
        if (!signature) {
          console.log("No signature found");
          //TODO: Notification?
          return;
        }
        const verified = await verifySignature(signature);
        if (!verified) {
          console.log("Signature was not verified");
          //TODO: Notification?
          return;
        }

        const ipfsUri = await uploadCoverPhoto();
        profile.coverPhoto = ipfsUri;
        profile.owner = wallet!.activeAccount!.accountId;

        const res = await axios.post("/api/profile", { profile });
        if (res.status === 200) {
          const profile = res.data.band;
          console.log({ profile });
          router.push(`/profile/${profile.id}`);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-[url('/background.png')] bg-center h-full">
      <div className="container h-full max-w-7xl mx-auto">
        <Header currentPageHref="/createProfile" />

        <div className="h-screen bg-[#1A0848] ">
          {/* border-t border-violet-900 */}
          <h1 className="font-bold font-[Kanit] tracking-tight text-white sm:text-4xl p-8">
            Create Profile
          </h1>
          {isConnected ? (
            <div className="h-screen p-8 bg-white">
              <form
                className="space-y-8 divide-y divide-gray-200"
                onSubmit={onSubmitForm}
              >
                <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
                  <div>
                    <div>
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Artist Profile
                      </h3>
                      <p className="max-w-2xl mt-1 text-sm text-gray-500">
                        This information will be displayed publicly so be
                        careful what you share.
                      </p>
                    </div>
                    <div className="mt-6 space-y-6 sm:mt-5 sm:space-y-5">
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                        >
                          Name (Band or Artist)
                        </label>
                        <div className="flex flex-col">
                          <div className="relative mt-1 rounded-md shadow-sm">
                            <input
                              type="text"
                              name="name"
                              id="name"
                              className={classNames(
                                hasName
                                  ? "border-violet-300 focus:ring-violet-500 focus:border-violet-500"
                                  : "border-red-300 focus:ring-red-500 focus:border-red-500",
                                "block w-full pr-10 text-gray-900 rounded-md focus:outline-none sm:text-sm"
                              )}
                              aria-invalid={!hasName ? true : false}
                              aria-describedby={!hasName ? "name-error" : ""}
                              value={profile.name ? profile.name : ""}
                              onChange={onHandleNameChange}
                            />
                          </div>
                          {!hasName && (
                            <p
                              className="mt-2 text-sm text-red-600"
                              id="name-error"
                            >
                              Your name cannot be blank.
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                        <label
                          htmlFor="bio"
                          className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                        >
                          Bio
                        </label>
                        <div className="mt-1 sm:mt-0 sm:col-span-2">
                          <p className="pb-2 mt-2 text-sm text-gray-500">
                            Write a few sentences about your band or yourself.
                          </p>
                          <div className="flex flex-col">
                            <textarea
                              id="bio"
                              name="bio"
                              rows={3}
                              className={classNames(
                                hasBio
                                  ? "border-violet-300 focus:ring-violet-500 focus:border-violet-500"
                                  : "border-red-300 focus:ring-red-500 focus:border-red-500",
                                "block w-full pr-10 text-gray-900 rounded-md focus:outline-none sm:text-sm"
                              )}
                              aria-invalid={!hasBio ? true : false}
                              aria-describedby={!hasBio ? "bio-error" : ""}
                              value={profile.bio ? profile.bio : ""}
                              onChange={onHandleBioChange}
                            />
                            {!hasBio && (
                              <p
                                className="mt-2 text-sm text-red-600"
                                id="bio-error"
                              >
                                Your bio cannot be blank.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                        <label
                          htmlFor="cover-photo"
                          className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2"
                        >
                          Cover photo
                        </label>
                        <div className="mt-1 sm:mt-0 sm:col-span-2">
                          <div className="flex justify-center max-w-lg px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
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
                                  <p className="">Upload a file</p>
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
                                {/* <p className="pl-1">or drag and drop</p> */}
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </div>
                          </div>
                          {!hasCoverPhoto && (
                            <p
                              className="mt-2 text-sm text-red-600"
                              id="cover-image-error"
                            >
                              Your gonna need a cover photo.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-5">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center px-4 py-2 ml-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex items-start justify-center h-screen pt-4">
              <div className="flex flex-col items-center space-y-4">
                <p className="text-white">
                  You need to be connected to create your profile.
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
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
