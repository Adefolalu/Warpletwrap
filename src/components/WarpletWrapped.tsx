import { useRef, useState } from "react";
import type { WarpletMetrics } from "../hooks/useWarpletData";
import { useAccount, useWriteContract, useSendCalls } from "wagmi";
import { parseEther, encodeFunctionData } from "viem";
import { sdk } from "@farcaster/miniapp-sdk";
import { uploadToIPFS, getIPFSUrl, uploadBlobToIPFS } from "../lib/pinata";
import { toBlob } from "html-to-image";
import { MintContract } from "../lib/Contracts";

interface WarpletWrappedProps {
  displayName: string;
  metrics: WarpletMetrics;
}

const themes = {
  christmas: {
    name: "Holiday",
    bg: "#022c22",
    bgImage:
      "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.2) 2%, transparent 0%)",
    cardBg: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
    cardBorder: "4px solid #fbbf24",
    cardShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 8px #166534",
    textColor: "white",
    accentColor: "#fbbf24",
    positiveColor: "#4ade80",
    negativeColor: "#fca5a5",
    secondaryBg: "rgba(0, 0, 0, 0.2)",
    icon: "🎅",
    decorationTop: "❄️",
    decorationBottom: "🎄",
    fontFamily: "serif",
  },
  Donut: {
    name: "Donut",
    bg: "#fbc8d1",
    bgImage: "none",
    cardBg: "#feface",
    cardBorder: "4px solid #333333",
    cardShadow: "8px 8px 0px #333333",
    textColor: "#333333",
    accentColor: "#ff6b6b",
    positiveColor: "#10b981",
    negativeColor: "#ef4444",
    secondaryBg: "rgba(255, 255, 255, 0.5)",
    icon: "✨",
    decorationTop: "🍩",
    decorationBottom: "🍩",
    fontFamily: "sans-serif",
  },
  farcaster: {
    name: "Farcaster",
    bg: "#472a91",
    bgImage: "radial-gradient(circle at 50% 50%, #855DCD 0%, #472a91 100%)",
    cardBg: "#ffffff",
    cardBorder: "none",
    cardShadow: "0 20px 40px rgba(0,0,0,0.2)",
    textColor: "#17101f",
    accentColor: "#855DCD",
    positiveColor: "#16a34a",
    negativeColor: "#dc2626",
    secondaryBg: "#f3f4f6",
    icon: "🟣",
    decorationTop: "📡",
    decorationBottom: "🦄",
    fontFamily: "system-ui",
  },
};

export default function WarpletWrapped({
  displayName,
  metrics,
}: WarpletWrappedProps) {
  const [currentTheme, setCurrentTheme] =
    useState<keyof typeof themes>("christmas");
  // Removed modal-based mint flow
  const [isLoadingMint, setIsLoadingMint] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const { address } = useAccount();
  // Balance not needed for direct flow
  const { writeContractAsync: mintWithETHWrite } = useWriteContract();
  const { sendCalls } = useSendCalls();
  const theme = themes[currentTheme];
  const cardRef = useRef<HTMLDivElement | null>(null);

  const DONUT_TOKEN_ADDRESS =
    "0xae4a37d554c6d6f3e398546d8566b25052e0169c" as const;

  const [imageUrlForShare, setImageUrlForShare] = useState<string | null>(null);
  const handleShareOnFarcaster = async () => {
    if (!imageUrlForShare) return;
    try {
      const text = `Check out my Warplet data for 2025! 🍩\n\nLet's see yours too 👇`;
      await sdk.actions.composeCast({
        text,
        embeds: [imageUrlForShare, window.location.origin] as [string, string],
      });
      setShowShareModal(false);
    } catch (e) {
      console.error("Failed to share on Farcaster", e);
    }
  };

  const mintWrappedWithETH = async () => {
    if (!address) return;
    try {
      setIsLoadingMint(true);
      setMintError(null);
      // Render card to image and upload to IPFS first
      const node = cardRef.current;
      if (!node) throw new Error("Card element not found");
      const blob = await toBlob(node, { cacheBust: true });
      if (!blob) throw new Error("Failed to render card image");
      const imageHash = await uploadBlobToIPFS(blob, "warplet-card.png");
      const imageUrl = getIPFSUrl(imageHash);
      setImageUrlForShare(imageUrl);

      // Upload metadata including image URL
      const hash = await uploadToIPFS({
        username: displayName,
        totalProfitLoss: metrics.totalProfitLoss,
        winRate: metrics.winRate,
        netWorth: metrics.currentNetWorth,
        imageUrl,
        timestamp: Date.now(),
      });
      setIpfsHash(hash);
      const txHash = await mintWithETHWrite({
        address: MintContract.address as `0x${string}`,
        abi: MintContract.abi,
        functionName: "mintWithETH",
        args: [
          displayName,
          BigInt(Math.floor(metrics.totalProfitLoss * 100)),
          BigInt(Math.floor(metrics.winRate * 100)),
          BigInt(Math.floor(metrics.currentNetWorth * 100)),
        ],
        value: parseEther("0.01"),
      });
      if (txHash) {
        setShowShareModal(true);
      }
    } catch (err: any) {
      setMintError(err?.message || "Transaction failed");
    } finally {
      setIsLoadingMint(false);
    }
  };

  const mintWrappedWithDonut = async () => {
    if (!address) return;
    try {
      setIsLoadingMint(true);
      setMintError(null);
      // Render card to image and upload to IPFS first
      const node = cardRef.current;
      if (!node) throw new Error("Card element not found");
      const blob = await toBlob(node, { cacheBust: true });
      if (!blob) throw new Error("Failed to render card image");
      const imageHash = await uploadBlobToIPFS(blob, "warplet-card.png");
      const imageUrl = getIPFSUrl(imageHash);
      setImageUrlForShare(imageUrl);

      // Upload metadata including image URL
      const hash = await uploadToIPFS({
        username: displayName,
        totalProfitLoss: metrics.totalProfitLoss,
        winRate: metrics.winRate,
        netWorth: metrics.currentNetWorth,
        imageUrl,
        timestamp: Date.now(),
      });
      setIpfsHash(hash);
      const calls = [
        {
          to: DONUT_TOKEN_ADDRESS as `0x${string}`,
          data: encodeFunctionData({
            abi: [
              {
                type: "function",
                name: "approve",
                inputs: [
                  { name: "spender", type: "address" },
                  { name: "amount", type: "uint256" },
                ],
                outputs: [{ name: "", type: "bool" }],
                stateMutability: "nonpayable",
              },
            ],
            functionName: "approve",
            args: [
              MintContract.address as `0x${string}`,
              BigInt(
                "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
              ),
            ],
          }),
        },
        {
          to: MintContract.address as `0x${string}`,
          data: encodeFunctionData({
            abi: MintContract.abi,
            functionName: "mintWithERC20",
            args: [
              DONUT_TOKEN_ADDRESS as `0x${string}`,
              displayName,
              BigInt(Math.floor(metrics.totalProfitLoss * 100)),
              BigInt(Math.floor(metrics.winRate * 100)),
              BigInt(Math.floor(metrics.currentNetWorth * 100)),
            ],
          }),
        },
      ];
      await sendCalls({ calls, account: address });
      setShowShareModal(true);
    } catch (err: any) {
      setMintError(err?.message || "Transaction failed");
    } finally {
      setIsLoadingMint(false);
    }
  };

  const formatUSD = (amount: number) => {
    const sign = amount >= 0 ? "+" : "";
    return `${sign}$${Math.abs(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  return (
    <div
      className="warplet-container"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.fontFamily,
        backgroundColor: theme.bg,
        backgroundImage: theme.bgImage,
        backgroundSize: "100px 100px",
        transition: "all 0.3s ease",
      }}
    >
      {/* Theme Switcher */}
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          gap: "1rem",
          background: "rgba(255, 255, 255, 0.2)",
          padding: "0.5rem",
          borderRadius: "2rem",
          backdropFilter: "blur(10px)",
        }}
      >
        {(Object.keys(themes) as Array<keyof typeof themes>).map((key) => (
          <button
            key={key}
            onClick={() => setCurrentTheme(key)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "1.5rem",
              border: "none",
              background: currentTheme === key ? "white" : "transparent",
              color: currentTheme === key ? "black" : "white",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s ease",
            }}
          >
            {themes[key].name}
          </button>
        ))}
      </div>

      <div
        className="warplet-card"
        style={{
          background: theme.cardBg,
          borderRadius: "1.5rem",
          color: theme.textColor,
          boxShadow: theme.cardShadow,
          position: "relative",
          overflow: "hidden",
          border: theme.cardBorder,
          transition: "all 0.3s ease",
        }}
        ref={cardRef}
      >
        {/* Decorations */}
        <div
          style={{
            position: "absolute",
            top: "-10px",
            right: "-10px",
            fontSize: "3rem",
            opacity: 0.2,
            pointerEvents: "none",
          }}
        >
          {theme.decorationTop}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "-10px",
            left: "-10px",
            fontSize: "3rem",
            opacity: 0.2,
            pointerEvents: "none",
          }}
        >
          {theme.decorationBottom}
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>
            {metrics.warpletNft?.image?.thumbnailUrl ||
            metrics.warpletNft?.image?.pngUrl ||
            metrics.warpletNft?.image?.originalUrl ? (
              <img
                src={
                  metrics.warpletNft.image.thumbnailUrl ||
                  metrics.warpletNft.image.pngUrl ||
                  metrics.warpletNft.image.originalUrl
                }
                alt={metrics.warpletNft.name || "Warplet NFT"}
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `3px solid ${theme.accentColor}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  display: "inline-block",
                }}
              />
            ) : (
              theme.icon
            )}
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              marginBottom: "0.25rem",
              textShadow:
                currentTheme === "christmas"
                  ? "2px 2px 4px rgba(0,0,0,0.3)"
                  : "none",
            }}
          >
            {displayName}'s
            <br />
            <span style={{ color: theme.accentColor }}>
              {currentTheme === "christmas" ? "Holiday" : "Warplet"} Wrapped
            </span>
          </h1>
          {metrics.firstTransactionDate && (
            <div
              style={{
                opacity: 0.9,
                fontSize: "0.7rem",
                fontStyle: "italic",
                background: theme.secondaryBg,
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: "20px",
              }}
            >
              Trading since{" "}
              {new Date(metrics.firstTransactionDate).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              )}
            </div>
          )}
        </div>

        {/* Total Stats Grid */}
        <div
          className="warplet-grid"
          style={{
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              background: theme.secondaryBg,
              padding: "0.5rem",
              borderRadius: "1rem",
              textAlign: "center",
              border:
                currentTheme === "christmas"
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "none",
            }}
          >
            <div
              style={{ fontSize: "0.7rem", opacity: 0.8, marginBottom: "4px" }}
            >
              Total P/L
            </div>
            <div
              className="warplet-stat-value"
              style={{
                color:
                  metrics.totalProfitLoss >= 0
                    ? theme.positiveColor
                    : theme.negativeColor,
                textShadow:
                  currentTheme === "christmas"
                    ? "0 1px 2px rgba(0,0,0,0.5)"
                    : "none",
              }}
            >
              {formatUSD(metrics.totalProfitLoss)}
            </div>
          </div>

          <div
            style={{
              background: theme.secondaryBg,
              padding: "0.5rem",
              borderRadius: "1rem",
              textAlign: "center",
              border:
                currentTheme === "christmas"
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "none",
            }}
          >
            <div
              style={{ fontSize: "0.7rem", opacity: 0.8, marginBottom: "4px" }}
            >
              Net Worth
            </div>
            <div
              className="warplet-stat-value"
              style={{
                color: theme.accentColor,
                textShadow:
                  currentTheme === "christmas"
                    ? "0 1px 2px rgba(0,0,0,0.5)"
                    : "none",
              }}
            >
              $
              {metrics.currentNetWorth.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <div
            style={{
              background: theme.secondaryBg,
              padding: "0.5rem",
              borderRadius: "1rem",
              textAlign: "center",
              border:
                currentTheme === "christmas"
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "none",
            }}
          >
            <div
              style={{ fontSize: "0.7rem", opacity: 0.8, marginBottom: "4px" }}
            >
              Win Rate
            </div>
            <div className="warplet-stat-value">
              {formatPercent(metrics.winRate)}
            </div>
          </div>

          <div
            style={{
              background: theme.secondaryBg,
              padding: "0.5rem",
              borderRadius: "1rem",
              textAlign: "center",
              border:
                currentTheme === "christmas"
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "none",
            }}
          >
            <div
              style={{ fontSize: "0.7rem", opacity: 0.8, marginBottom: "4px" }}
            >
              Total Trades
            </div>
            <div className="warplet-stat-value">
              {metrics.totalTrades.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              background: theme.secondaryBg,
              padding: "0.5rem",
              borderRadius: "1rem",
              textAlign: "center",
              border:
                currentTheme === "christmas"
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "none",
            }}
          >
            <div
              style={{ fontSize: "0.7rem", opacity: 0.8, marginBottom: "4px" }}
            >
              Transfers
            </div>
            <div className="warplet-stat-value">
              {metrics.totalTokenTransfers.toLocaleString()}
            </div>
          </div>

          <div
            style={{
              background: theme.secondaryBg,
              padding: "0.5rem",
              borderRadius: "1rem",
              textAlign: "center",
              border:
                currentTheme === "christmas"
                  ? "1px solid rgba(255,255,255,0.1)"
                  : "none",
            }}
          >
            <div
              style={{ fontSize: "0.7rem", opacity: 0.8, marginBottom: "4px" }}
            >
              NFT Collections
            </div>
            <div className="warplet-stat-value">
              {metrics.totalNFTCollections.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Biggest Win */}
        {metrics.biggestWin && (
          <div
            style={{
              marginBottom: "0.5rem",
              padding: "0.5rem",
              background:
                currentTheme === "christmas"
                  ? "rgba(20, 83, 45, 0.4)"
                  : theme.secondaryBg,
              borderRadius: "1rem",
              border:
                currentTheme === "christmas"
                  ? "1px solid rgba(74, 222, 128, 0.3)"
                  : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                minWidth: 0,
                flex: 1,
              }}
            >
              <div style={{ fontSize: "1.25rem", flexShrink: 0 }}>🎁</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                  Biggest Win
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {metrics.biggestWin.token.symbol}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontWeight: "bold",
                  color: theme.positiveColor,
                  fontSize: "0.9rem",
                }}
              >
                {formatUSD(metrics.biggestWin.profitUsd)}
              </div>
              <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                {formatPercent(
                  metrics.biggestWin.token.realized_profit_percentage
                )}
              </div>
            </div>
          </div>
        )}

        {/* Biggest Loss */}
        {metrics.biggestLoss && metrics.biggestLoss.profitUsd < 0 && (
          <div
            style={{
              marginBottom: "0.5rem",
              padding: "0.5rem",
              background:
                currentTheme === "christmas"
                  ? "rgba(127, 29, 29, 0.4)"
                  : theme.secondaryBg,
              borderRadius: "1rem",
              border:
                currentTheme === "christmas"
                  ? "1px solid rgba(248, 113, 113, 0.3)"
                  : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                minWidth: 0,
                flex: 1,
              }}
            >
              <div style={{ fontSize: "1.25rem", flexShrink: 0 }}>📉</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                  Biggest Loss
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {metrics.biggestLoss.token.symbol}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div
                style={{
                  fontWeight: "bold",
                  color: theme.negativeColor,
                  fontSize: "0.9rem",
                }}
              >
                {formatUSD(metrics.biggestLoss.profitUsd)}
              </div>
              <div style={{ fontSize: "0.7rem", opacity: 0.8 }}>
                {formatPercent(
                  Math.abs(metrics.biggestLoss.token.realized_profit_percentage)
                )}
              </div>
            </div>
          </div>
        )}

        {/* Volume Summary - Compact */}
        <div
          style={{
            background: theme.secondaryBg,
            borderRadius: "1rem",
            padding: "0.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.5rem",
            borderTop:
              currentTheme === "christmas"
                ? "2px dashed rgba(255,255,255,0.2)"
                : "none",
          }}
        >
          <div style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>Bought</div>
            <div
              style={{
                fontWeight: "bold",
                color: theme.positiveColor,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              $
              {metrics.totalBoughtVolume.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
          <div style={{ fontSize: "1.2rem", opacity: 0.5, flexShrink: 0 }}>
            {theme.decorationTop}
          </div>
          <div style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>Sold</div>
            <div
              style={{
                fontWeight: "bold",
                color: theme.negativeColor,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              $
              {metrics.totalSoldVolume.toLocaleString("en-US", {
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mint Buttons - Side by Side */}
      <div
        className="mint-buttons-container"
        style={{
          marginTop: "2rem",
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          className="mint-button"
          onClick={mintWrappedWithETH}
          style={{
            padding: "1rem 2rem",
            background: theme.accentColor,
            color: theme.cardBg,
            border: "none",
            borderRadius: "1.5rem",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: isLoadingMint || !address ? "not-allowed" : "pointer",
            opacity: isLoadingMint || !address ? 0.6 : 1,
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {isLoadingMint ? "Minting..." : "💰 Mint with ETH"}
        </button>
        <button
          className="mint-button"
          onClick={mintWrappedWithDonut}
          style={{
            padding: "1rem 2rem",
            background: theme.accentColor,
            color: theme.cardBg,
            border: "none",
            borderRadius: "1.5rem",
            fontSize: "1rem",
            fontWeight: "bold",
            cursor: isLoadingMint || !address ? "not-allowed" : "pointer",
            opacity: isLoadingMint || !address ? 0.6 : 1,
            transition: "all 0.2s ease",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          }}
        >
          {isLoadingMint ? "Minting..." : "🍩 Mint with $Donut"}
        </button>
      </div>

      {mintError && (
        <div
          style={{
            marginTop: "1rem",
            background: "#fee2e2",
            color: "#991b1b",
            padding: "0.75rem 1rem",
            borderRadius: "1rem",
            fontSize: "0.9rem",
          }}
        >
          {mintError}
        </div>
      )}

      {showShareModal && ipfsHash && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setShowShareModal(false)}
        >
          <div
            style={{
              background: theme.cardBg,
              borderRadius: "1.5rem",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%",
              color: theme.textColor,
              border: theme.cardBorder,
              boxShadow: theme.cardShadow,
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowShareModal(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: theme.textColor,
              }}
            >
              ✕
            </button>

            <h2
              style={{
                marginBottom: "1.5rem",
                color: theme.accentColor,
                fontSize: "1.5rem",
              }}
            >
              Share Your Wrapped
            </h2>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <div
                style={{
                  background: theme.secondaryBg,
                  padding: "1rem",
                  borderRadius: "1rem",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 0 0.5rem 0",
                    fontSize: "0.9rem",
                    opacity: 0.8,
                  }}
                >
                  Share this on Farcaster:
                </p>
                <div
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    padding: "1rem",
                    borderRadius: "0.75rem",
                    fontSize: "0.85rem",
                    lineHeight: "1.5",
                    margin: "0.5rem 0",
                  }}
                >
                  Check out my Warplet data for 2025! 🍩
                  <br />
                  Let&apos;s see yours too 👇
                </div>
              </div>

              <button
                onClick={handleShareOnFarcaster}
                style={{
                  padding: "1rem",
                  borderRadius: "1rem",
                  background: theme.accentColor,
                  color: theme.cardBg,
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold",
                }}
              >
                📲 Share on Farcaster
              </button>

              <button
                onClick={() => {
                  const shareText = `Check out my Warplet data for 2025! 🍩\n${imageUrlForShare ?? ""}\n${window.location.origin}`;
                  navigator.clipboard.writeText(shareText);
                  alert("Share text copied to clipboard!");
                }}
                style={{
                  padding: "0.75rem",
                  borderRadius: "1rem",
                  background: "transparent",
                  color: theme.accentColor,
                  border: `1px solid ${theme.accentColor}`,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                📋 Copy Share Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
