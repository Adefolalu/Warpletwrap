export async function getWarpletNFT(walletAddress: string) {
  const apiKey = import.meta.env.VITE_ALCHEMY_API_KEY;

  // If the user provided a full RPC URL, try to extract the key
  const rpcUrl = import.meta.env.VITE_ALCHEMY_RPC_URL;
  const key = apiKey || (rpcUrl ? rpcUrl.split("/").pop() : null);

  if (!key) {
    console.warn("Missing VITE_ALCHEMY_API_KEY or VITE_ALCHEMY_RPC_URL");
    return null;
  }

  const contractAddress = "0x699727F9E01A822EFdcf7333073f0461e5914b4E";
  // Use the NFT API v3 endpoint on Base Mainnet
  const baseURL = `https://base-mainnet.g.alchemy.com/nft/v3/${key}`;
  const url = `${baseURL}/getNFTsForOwner?owner=${walletAddress}&contractAddresses[]=${contractAddress}&withMetadata=true&pageSize=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.ownedNfts?.[0] || null;
  } catch (error) {
    console.error("Error fetching Warplet NFT:", error);
    return null;
  }
}
