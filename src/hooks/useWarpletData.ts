import { useQuery } from "@tanstack/react-query";
import { getUserByFid } from "../lib/neynar";
import {
  getWalletProfitability,
  getWalletNetWorth,
  getWalletChains,
  getProfitabilitySummary,
  getNetWorth,
} from "../lib/moralis";
import { getWarpletNFT } from "../lib/alchemy";
import type {
  MoralisTokenProfitability,
  MoralisProfitabilitySummaryResponse,
} from "../types/moralis";

export interface WarpletMetrics {
  totalProfitLoss: number;
  biggestWin: {
    token: MoralisTokenProfitability;
    profitUsd: number;
  } | null;
  biggestLoss: {
    token: MoralisTokenProfitability;
    profitUsd: number;
  } | null;
  mostTradedToken: {
    token: MoralisTokenProfitability;
    tradeCount: number;
  } | null;
  winRate: number;
  totalTrades: number;
  totalTokenTransfers: number;
  totalNFTCollections: number;
  totalTradeVolume: number;
  totalBuys: number;
  totalSells: number;
  totalBoughtVolume: number;
  totalSoldVolume: number;
  firstTransactionDate: string | null;
  currentNetWorth: number;
  warpletNft: {
    image: {
      originalUrl: string;
      thumbnailUrl: string;
      pngUrl: string;
    };
    name: string;
    tokenId: string;
  } | null;
}

function calculateMetrics(
  tokens: MoralisTokenProfitability[],
  statsData?: { token_transfers: { total: string }; collections: string },
  summaryData?: MoralisProfitabilitySummaryResponse,
  chainsData?: {
    active_chains: Array<{
      first_transaction: { block_timestamp: string };
    }>;
  },
  netWorthData?: { total_networth_usd: string },
  warpletNft?: any
): WarpletMetrics {
  // Filter out tokens with no sells (no realized profit/loss)
  const tradedTokens = tokens.filter((t) => t.total_sells > 0);

  // Calculate total profit/loss
  const totalProfitLoss = tradedTokens.reduce((sum, token) => {
    return sum + Number.parseFloat(token.realized_profit_usd);
  }, 0);

  // Find biggest win (highest realized_profit_usd)
  let biggestWin: WarpletMetrics["biggestWin"] = null;
  let maxProfit = -Infinity;
  for (const token of tradedTokens) {
    const profit = Number.parseFloat(token.realized_profit_usd);
    if (profit > maxProfit) {
      maxProfit = profit;
      biggestWin = { token, profitUsd: profit };
    }
  }

  // Find biggest loss (lowest realized_profit_usd)
  let biggestLoss: WarpletMetrics["biggestLoss"] = null;
  let minProfit = Infinity;
  for (const token of tradedTokens) {
    const profit = Number.parseFloat(token.realized_profit_usd);
    if (profit < minProfit) {
      minProfit = profit;
      biggestLoss = { token, profitUsd: profit };
    }
  }

  // Find most traded token
  let mostTradedToken: WarpletMetrics["mostTradedToken"] = null;
  let maxTrades = 0;
  for (const token of tokens) {
    if (token.count_of_trades > maxTrades) {
      maxTrades = token.count_of_trades;
      mostTradedToken = { token, tradeCount: token.count_of_trades };
    }
  }

  // Calculate win rate
  const profitableTokens = tradedTokens.filter(
    (t) => Number.parseFloat(t.realized_profit_usd) > 0
  );
  const winRate =
    tradedTokens.length > 0
      ? (profitableTokens.length / tradedTokens.length) * 100
      : 0;

  // Calculate total trades
  const totalTrades = tokens.reduce(
    (sum, token) => sum + token.count_of_trades,
    0
  );

  return {
    totalProfitLoss,
    biggestWin,
    biggestLoss,
    mostTradedToken,
    winRate,
    totalTrades,
    totalTokenTransfers: statsData?.token_transfers?.total
      ? Number.parseInt(statsData.token_transfers.total)
      : 0,
    totalNFTCollections: statsData?.collections
      ? Number.parseInt(statsData.collections)
      : 0,
    totalTradeVolume: summaryData
      ? Number.parseFloat(summaryData.total_trade_volume)
      : 0,
    totalBuys: summaryData ? summaryData.total_buys : 0,
    totalSells: summaryData ? summaryData.total_sells : 0,
    totalBoughtVolume: summaryData
      ? Number.parseFloat(summaryData.total_bought_volume_usd)
      : 0,
    totalSoldVolume: summaryData
      ? Number.parseFloat(summaryData.total_sold_volume_usd)
      : 0,
    firstTransactionDate:
      chainsData?.active_chains?.[0]?.first_transaction?.block_timestamp ||
      null,
    currentNetWorth: netWorthData?.total_networth_usd
      ? Number.parseFloat(netWorthData.total_networth_usd)
      : 0,
    warpletNft: warpletNft || null,
  };
}

export function useWarpletData(fid: number | null) {
  // Fetch user data from Neynar
  const {
    data: userData,
    isLoading: isLoadingUser,
    error: userError,
  } = useQuery({
    queryKey: ["neynar-user", fid],
    queryFn: async () => {
      if (!fid) throw new Error("No FID provided");
      return getUserByFid(fid);
    },
    enabled: !!fid,
  });

  const walletAddress =
    userData?.users[0]?.verified_addresses?.primary?.eth_address ||
    userData?.users[0]?.custody_address;

  // Fetch profitability data from Moralis
  const {
    data: profitabilityData,
    isLoading: isLoadingProfitability,
    error: profitabilityError,
  } = useQuery({
    queryKey: ["moralis-profitability", walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address found");
      return getWalletProfitability(walletAddress);
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // Fetch stats data from Moralis (includes token_transfers and collections)
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ["moralis-stats", walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address found");
      const data = await getWalletNetWorth(walletAddress);
      return data;
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // Fetch chains data from Moralis (includes first transaction date)
  const {
    data: chainsData,
    isLoading: isLoadingChains,
    error: chainsError,
  } = useQuery({
    queryKey: ["moralis-chains", walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address found");
      const data = await getWalletChains(walletAddress);
      return data;
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // Fetch profitability summary from Moralis
  const {
    data: summaryData,
    isLoading: isLoadingSummary,
    error: summaryError,
  } = useQuery({
    queryKey: ["moralis-summary", walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address found");
      return getProfitabilitySummary(walletAddress);
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // Fetch net worth from Moralis
  const {
    data: netWorthData,
    isLoading: isLoadingNetWorth,
    error: netWorthError,
  } = useQuery({
    queryKey: ["moralis-networth", walletAddress],
    queryFn: async () => {
      if (!walletAddress) throw new Error("No wallet address found");
      const data = await getNetWorth(walletAddress);
      return data;
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  // Fetch Warplet NFT
  const { data: warpletNft, isLoading: isLoadingNft } = useQuery({
    queryKey: ["alchemy-warplet-nft", walletAddress],
    queryFn: async () => {
      if (!walletAddress) return null;
      return getWarpletNFT(walletAddress);
    },
    enabled: !!walletAddress,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const metrics = profitabilityData
    ? calculateMetrics(
        profitabilityData.result,
        statsData,
        summaryData,
        chainsData,
        netWorthData,
        warpletNft
      )
    : null;

  return {
    user: userData?.users[0],
    walletAddress,
    metrics,
    isLoading:
      isLoadingUser ||
      isLoadingProfitability ||
      isLoadingStats ||
      isLoadingChains ||
      isLoadingSummary ||
      isLoadingNetWorth ||
      isLoadingNft,
    error:
      userError ||
      profitabilityError ||
      statsError ||
      chainsError ||
      summaryError ||
      netWorthError,
  };
}
