import { useState } from "react";
import {
  useAccount,
  useBalance,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSendCalls,
} from "wagmi";
import { parseEther, encodeFunctionData } from "viem";
import { MintContract } from "../lib/Contracts";
import { uploadToIPFS } from "../lib/pinata";
import type { WarpletMetrics } from "../hooks/useWarpletData";

interface MintModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayName: string;
  metrics: WarpletMetrics;
  theme: any;
}

type PaymentMethod = "eth" | "erc20" | null;

const DONUT_TOKEN_ADDRESS = "0xae4a37d554c6d6f3e398546d8566b25052e0169c";

export default function MintModal({
  isOpen,
  onClose,
  displayName,
  metrics,
  theme,
}: MintModalProps) {
  const { address } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>();

  const { writeContractAsync: mintWithETH } = useWriteContract();
  const { sendCalls } = useSendCalls();
  useWaitForTransactionReceipt({
    hash: pendingHash,
  });

  const resetModal = () => {
    setPaymentMethod(null);
    setIsLoading(false);
    setError(null);
    setSuccess(false);
    setPendingHash(undefined);
    onClose();
  };

  if (!isOpen) return null;

  const handleMintETH = () => {
    try {
      setIsLoading(true);
      setError(null);

      // Upload metadata to IPFS first
      uploadToIPFS({
        username: displayName,
        totalProfitLoss: metrics.totalProfitLoss,
        winRate: metrics.winRate,
        netWorth: metrics.currentNetWorth,
        timestamp: Date.now(),
      })
        .then(() => {
          mintWithETH({
            address: MintContract.address as `0x${string}`,
            abi: MintContract.abi,
            functionName: "mintWithETH",
            args: [
              displayName,
              BigInt(Math.floor(metrics.totalProfitLoss * 100)),
              BigInt(Math.floor(metrics.winRate * 100)),
              BigInt(Math.floor(metrics.currentNetWorth * 100)),
            ],
            value: parseEther("0.01"), // Default price, update as needed
          })
            .then((hash) => {
              setPendingHash(hash);
              setSuccess(true);
              setTimeout(() => {
                resetModal();
              }, 2000);
            })
            .catch((err: any) => {
              setError(err.message || "Transaction failed");
              setIsLoading(false);
            });
        })
        .catch((err: any) => {
          setError(err.message || "Failed to upload to IPFS");
          setIsLoading(false);
        });
    } catch (err: any) {
      setError(err.message || "Failed to initiate mint");
      setIsLoading(false);
    }
  };

  const handleMintERC20 = () => {
    try {
      setIsLoading(true);
      setError(null);

      // Upload metadata to IPFS first
      uploadToIPFS({
        username: displayName,
        totalProfitLoss: metrics.totalProfitLoss,
        winRate: metrics.winRate,
        netWorth: metrics.currentNetWorth,
        timestamp: Date.now(),
      })
        .then(async () => {
          try {
            // Create approval and mint calls for $Donut token
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
                    ), // Max uint256
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

            const result = await sendCalls({
              calls,
              account: address!,
            });

            setPendingHash(result as unknown as `0x${string}`);
            setSuccess(true);
            setTimeout(() => {
              resetModal();
            }, 2000);
          } catch (err: any) {
            setError(err.message || "Transaction failed");
            setIsLoading(false);
          }
        })
        .catch((err: any) => {
          setError(err.message || "Failed to upload to IPFS");
          setIsLoading(false);
        });
    } catch (err: any) {
      setError(err.message || "Failed to initiate mint");
      setIsLoading(false);
    }
  };

  return (
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
        zIndex: 1000,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
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
        {/* Close Button */}
        <button
          onClick={onClose}
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
          Mint Your Wrapped Card
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <button
            onClick={() => setPaymentMethod("eth")}
            style={{
              padding: "1.5rem",
              borderRadius: "1rem",
              border: `2px solid ${theme.accentColor}`,
              background: theme.secondaryBg,
              color: theme.textColor,
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = theme.accentColor;
              (e.target as HTMLElement).style.color = theme.cardBg;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = theme.secondaryBg;
              (e.target as HTMLElement).style.color = theme.textColor;
            }}
          >
            💰 Mint with ETH
          </button>
          <button
            onClick={() => setPaymentMethod("erc20")}
            style={{
              padding: "1.5rem",
              borderRadius: "1rem",
              border: `2px solid ${theme.accentColor}`,
              background: theme.secondaryBg,
              color: theme.textColor,
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = theme.accentColor;
              (e.target as HTMLElement).style.color = theme.cardBg;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = theme.secondaryBg;
              (e.target as HTMLElement).style.color = theme.textColor;
            }}
          >
            🍩 Mint with $Donut
          </button>

          {error && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "1rem",
                borderRadius: "1rem",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: "#dcfce7",
                color: "#166534",
                padding: "1rem",
                borderRadius: "1rem",
                fontSize: "0.9rem",
                fontWeight: "bold",
              }}
            >
              ✓ NFT Minted Successfully!
            </div>
          )}

          {paymentMethod === "eth" && (
            <>
              <div
                style={{
                  background: theme.secondaryBg,
                  padding: "1rem",
                  borderRadius: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                <p style={{ margin: "0 0 0.5rem 0" }}>ETH Balance:</p>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "bold",
                    color: theme.accentColor,
                  }}
                >
                  {ethBalance
                    ? (Number(ethBalance.value) / 1e18).toFixed(4)
                    : "0"}{" "}
                  ETH
                </p>
              </div>
              <button
                onClick={handleMintETH}
                disabled={isLoading || !address}
                style={{
                  padding: "1rem",
                  borderRadius: "1rem",
                  background: theme.accentColor,
                  color: theme.cardBg,
                  border: "none",
                  cursor: isLoading || !address ? "not-allowed" : "pointer",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  opacity: isLoading || !address ? 0.5 : 1,
                }}
              >
                {isLoading ? "Minting..." : "Confirm"}
              </button>
            </>
          )}

          {paymentMethod === "erc20" && (
            <button
              onClick={handleMintERC20}
              disabled={isLoading || !address}
              style={{
                padding: "1rem",
                borderRadius: "1rem",
                background: theme.accentColor,
                color: theme.cardBg,
                border: "none",
                cursor: isLoading || !address ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "bold",
                opacity: isLoading || !address ? 0.5 : 1,
              }}
            >
              {isLoading ? "Minting..." : "Confirm"}
            </button>
          )}

          {paymentMethod && (
            <button
              onClick={() => setPaymentMethod(null)}
              style={{
                padding: "0.75rem",
                borderRadius: "1rem",
                background: "transparent",
                color: theme.accentColor,
                border: `1px solid ${theme.accentColor}`,
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              Back
            </button>
          )}

          <button
            onClick={() => resetModal()}
            style={{
              padding: "0.75rem",
              borderRadius: "1rem",
              background: "transparent",
              color: theme.accentColor,
              border: `1px solid ${theme.accentColor}`,
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
