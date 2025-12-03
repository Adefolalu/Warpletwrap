# Pinata IPFS Integration Setup

This guide walks through setting up Pinata for uploading Warplet Wrapped card metadata and images to IPFS.

## Steps to Setup Pinata

### 1. Create a Pinata Account

- Go to [pinata.cloud](https://pinata.cloud)
- Sign up for a free account
- Verify your email

### 2. Generate API JWT

1. Navigate to **API Keys** in the left sidebar
2. Click **+ New Key**
3. Select the following scopes:
   - ✅ `pinning:*` (allows uploading)
   - ✅ `data:*` (allows managing data)
4. Click **Generate API Key**
5. Copy the **JWT** token (starts with `eyJ...`)

### 3. Add JWT to Environment Variables

Create or update `.env.local` in your project root:

```env
VITE_PINATA_JWT=your_jwt_token_here
```

**Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

### 4. Verify Setup

The app will automatically upload to IPFS when a user mints an NFT:

- Card metadata (username, P/L, win rate, etc.) is uploaded as JSON
- Image data is referenced in the metadata
- IPFS hash is stored on-chain as part of the NFT tokenURI

## Features

- **Automatic metadata upload**: When minting, card stats are automatically pinned to IPFS
- **Image preservation**: NFT card images are stored on IPFS for permanence
- **On-chain reference**: Contract stores the IPFS hash for decentralized access
- **Gateway access**: Cards can be viewed via `https://gateway.pinata.cloud/ipfs/{hash}`

## IPFS Metadata Format

Each minted card creates a JSON file with:

```json
{
  "name": "{username}'s Warplet Wrapped",
  "description": "Farcaster trading card - Profit/Loss: $X",
  "attributes": [
    { "trait_type": "Username", "value": "..." },
    { "trait_type": "Total P/L", "value": "$..." },
    { "trait_type": "Win Rate", "value": "...%" },
    { "trait_type": "Net Worth", "value": "$..." },
    { "trait_type": "Minted", "value": "ISO timestamp" }
  ],
  "image": "https://..."
}
```

## Troubleshooting

**Error: "Pinata JWT not configured"**

- Check `.env.local` has `VITE_PINATA_JWT` set
- Verify JWT is valid (hasn't expired)
- Restart dev server after adding env vars

**Upload times out**

- Check internet connection
- Verify JWT has correct scopes (`pinning:*`)
- Ensure account hasn't hit upload limits

**Images not displaying**

- Verify the source image URL is accessible
- Check Pinata gateway status at [status.pinata.cloud](https://status.pinata.cloud)

## API Reference

### `uploadToIPFS(data)`

Uploads card metadata to IPFS

- **Returns**: IPFS hash string
- **Throws**: Error if JWT not configured or upload fails

### `uploadImageToIPFS(imageUrl)`

Uploads an image from URL to IPFS

- **Returns**: IPFS hash string
- **Throws**: Error if image fetch or upload fails

### `getIPFSUrl(hash)`

Constructs a Pinata gateway URL for accessing IPFS content

- **Returns**: Full HTTPS URL via Pinata gateway
