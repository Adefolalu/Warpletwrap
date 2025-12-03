// Pinata IPFS integration
// For production: store PINATA_JWT in environment variables
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT || "";

interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export async function uploadToIPFS(data: {
  username: string;
  totalProfitLoss: number;
  winRate: number;
  netWorth: number;
  imageUrl?: string;
  timestamp: number;
}): Promise<string> {
  try {
    if (!PINATA_JWT) {
      throw new Error("Pinata JWT not configured. Set VITE_PINATA_JWT in .env");
    }

    // Create the metadata JSON
    const metadata = {
      name: `${data.username}'s Warplet Wrapped`,
      description: `Farcaster trading card - ${data.totalProfitLoss >= 0 ? "Profit" : "Loss"}: $${Math.abs(data.totalProfitLoss).toFixed(2)}`,
      attributes: [
        {
          trait_type: "Username",
          value: data.username,
        },
        {
          trait_type: "Total P/L",
          value: `$${data.totalProfitLoss.toFixed(2)}`,
        },
        {
          trait_type: "Win Rate",
          value: `${data.winRate.toFixed(1)}%`,
        },
        {
          trait_type: "Net Worth",
          value: `$${data.netWorth.toFixed(2)}`,
        },
        {
          trait_type: "Minted",
          value: new Date(data.timestamp).toISOString(),
        },
      ],
      image: data.imageUrl || "",
    };

    // Create FormData for multipart upload
    const formData = new FormData();
    const jsonString = JSON.stringify(metadata);
    const blob = new Blob([jsonString], { type: "application/json" });
    formData.append("file", blob, "metadata.json");

    // Add optional metadata for Pinata
    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: `warplet-wrapped-${data.username}-${data.timestamp}`,
      })
    );

    const response = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const result = (await response.json()) as PinataUploadResponse;
    return result.IpfsHash;
  } catch (error) {
    console.error("IPFS upload error:", error);
    throw error;
  }
}

export async function uploadImageToIPFS(imageUrl: string): Promise<string> {
  try {
    if (!PINATA_JWT) {
      throw new Error("Pinata JWT not configured. Set VITE_PINATA_JWT in .env");
    }

    // Fetch the image from URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch image");
    }

    const blob = await response.blob();
    const formData = new FormData();
    formData.append("file", blob, "card-image.png");

    const uploadResponse = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(`Image upload failed: ${uploadResponse.statusText}`);
    }

    const result = (await uploadResponse.json()) as PinataUploadResponse;
    return result.IpfsHash;
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
}

export async function uploadBlobToIPFS(
  blob: Blob,
  filename = "file.bin"
): Promise<string> {
  try {
    if (!PINATA_JWT) {
      throw new Error("Pinata JWT not configured. Set VITE_PINATA_JWT in .env");
    }

    const formData = new FormData();
    formData.append("file", blob, filename);

    const uploadResponse = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PINATA_JWT}`,
        },
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error(`Blob upload failed: ${uploadResponse.statusText}`);
    }

    const result = (await uploadResponse.json()) as PinataUploadResponse;
    return result.IpfsHash;
  } catch (error) {
    console.error("Blob upload error:", error);
    throw error;
  }
}

export function getIPFSUrl(hash: string): string {
  return `https://bronze-objective-narwhal-944.mypinata.cloud/ipfs/${hash}`;
}
