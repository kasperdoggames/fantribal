import { toGatewayURL } from "nft.storage";

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

export const toIpfsGatewayURL = (ipfsPath: string) => {
  try {
    return toGatewayURL(ipfsPath, {
      gateway: IPFS_GATEWAY,
    }).toString();
  } catch (err) {
    console.log(err);
    return ipfsPath;
  }
};
