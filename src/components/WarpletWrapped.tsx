import { useState } from "react";
import type { WarpletMetrics } from "../hooks/useWarpletData";

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
  const theme = themes[currentTheme];

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
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem" }}>
            {theme.icon}
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
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              background: theme.secondaryBg,
              padding: "0.75rem",
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
              padding: "0.75rem",
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
              padding: "0.75rem",
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
              padding: "0.75rem",
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
              padding: "0.75rem",
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
              padding: "0.75rem",
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
              marginBottom: "0.75rem",
              padding: "0.75rem",
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
              marginBottom: "0.75rem",
              padding: "0.75rem",
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
            padding: "0.75rem",
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
    </div>
  );
}
