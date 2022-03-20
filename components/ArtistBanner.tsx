import { toIpfsGatewayURL } from "../support/ipfsGateway";

const ArtistBanner = () => {
  return (
    <div className="relative bg-indigo-800">
      <div className="absolute inset-0 overflow-hidden">
        <img
          className="object-cover w-full h-full"
          src={toIpfsGatewayURL(
            "ipfs://bafybeicudstqnunmre3kegkwexhsvxs67qlih7ks36slxwfznzezaz3hq4"
          )}
          alt=""
        />
        <div
          className="absolute inset-0 bg-indigo-800 mix-blend-multiply"
          aria-hidden="true"
        />
      </div>
      <div className="relative px-4 py-12 mx-auto sm:px-6 lg:px-8">
        <h1 className="text-3xl font-[Kanit] font-bold text-white sm:text-4xl lg:text-5xl">
          New Band
        </h1>
        <p className="mt-6 text-xl leading-7 text-indigo-100">
          In a sea of carbon-copy producers, New Band have cultivated their
          signature sound by creating forward-thinking electronic music that is
          influenced by old school funk, soul and hip-hop.
        </p>
        <div className="flex items-end justify-end mt-6">
          <button className="px-4 py-2 font-bold text-white bg-indigo-600 rounded-lg shadow-2xl shadow-white/25">
            Check them out!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtistBanner;
