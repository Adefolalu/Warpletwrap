import type {
  MoralisProfitabilityResponse,
  MoralisWalletStatsResponse,
  MoralisWalletChainsResponse,
  MoralisWalletNetWorthResponse,
  MoralisProfitabilitySummaryResponse,
  MoralisNetWorthResponse,
} from "../types/moralis";

const MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API_KEY;
const MORALIS_BASE_URL = "https://deep-index.moralis.io/api/v2.2";

if (!MORALIS_API_KEY) {
  console.warn("VITE_MORALIS_API_KEY is not set");
}

export async function getWalletProfitability(
  address: string,
  chain = "base"
): Promise<MoralisProfitabilityResponse> {
  const response = await fetch(
    `${MORALIS_BASE_URL}/wallets/${address}/profitability?chain=${chain}`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getWalletStats(
  address: string,
  chain = "base"
): Promise<MoralisWalletStatsResponse> {
  const response = await fetch(
    `${MORALIS_BASE_URL}/wallets/${address}/stats?chain=${chain}`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getWalletChains(
  address: string,
  chains = ["base"]
): Promise<MoralisWalletChainsResponse> {
  const chainParams = chains.map((c, i) => `chains%5B${i}%5D=${c}`).join("&");
  const response = await fetch(
    `${MORALIS_BASE_URL}/wallets/${address}/chains?${chainParams}`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getWalletNetWorth(
  address: string,
  chain = "base"
): Promise<MoralisWalletNetWorthResponse> {
  const response = await fetch(
    `${MORALIS_BASE_URL}/wallets/${address}/stats?chain=${chain}`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getProfitabilitySummary(
  address: string,
  chain = "base"
): Promise<MoralisProfitabilitySummaryResponse> {
  const response = await fetch(
    `${MORALIS_BASE_URL}/wallets/${address}/profitability/summary?chain=${chain}`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getNetWorth(
  address: string,
  chains = ["base"]
): Promise<MoralisNetWorthResponse> {
  const chainParams = chains.map((c, i) => `chains%5B${i}%5D=${c}`).join("&");
  const queryParams =
    "exclude_spam=true&exclude_unverified_contracts=true&max_token_inactivity=1&min_pair_side_liquidity_usd=1000";
  const response = await fetch(
    `${MORALIS_BASE_URL}/wallets/${address}/net-worth?${chainParams}&${queryParams}`,
    {
      headers: {
        accept: "application/json",
        "X-API-Key": MORALIS_API_KEY || "",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.statusText}`);
  }

  return response.json();
}
