import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useState } from "react";
import WarpletWrapped from "./components/WarpletWrapped";
import { useWarpletData } from "./hooks/useWarpletData";

function App() {
  const [context, setContext] = useState<Awaited<typeof sdk.context> | null>(
    null
  );
  const [devFid, setDevFid] = useState<string>("");
  const [useDevMode, setUseDevMode] = useState(false);

  useEffect(() => {
    const init = async () => {
      const ctx = await sdk.context;
      setContext(ctx);
      sdk.actions.ready();
    };
    init();
  }, []);

  // Use dev FID if in dev mode, otherwise use context FID
  const fid =
    useDevMode && devFid
      ? Number.parseInt(devFid)
      : (context?.user?.fid ?? null);
  const { user, metrics, isLoading, error } = useWarpletData(fid);

  // Show dev mode input if no FID from context
  if (!fid && !useDevMode) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "400px",
            padding: "2rem",
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: "1.5rem",
            backdropFilter: "blur(10px)",
            border: "2px solid #fbbf24",
          }}
        >
          <h2 style={{ marginBottom: "1.5rem", color: "#fbbf24" }}>
            Warplet Wrapped
          </h2>
          <p style={{ opacity: 0.9, marginBottom: "2rem" }}>
            Enter a Farcaster FID to view their Warplet Wrapped
          </p>
          <input
            type="text"
            value={devFid}
            onChange={(e) => setDevFid(e.target.value)}
            placeholder="Enter FID"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "2px solid #fbbf24",
              background: "rgba(255, 255, 255, 0.1)",
              color: "white",
              fontSize: "1rem",
              marginBottom: "1rem",
              boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={() => setUseDevMode(true)}
            disabled={!devFid}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              border: "none",
              background: devFid ? "#fbbf24" : "#666",
              color: devFid ? "#022c22" : "white",
              fontSize: "1rem",
              cursor: devFid ? "pointer" : "not-allowed",
              fontWeight: "bold",
            }}
          >
            View Wrapped
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #022c22 0%, #166534 100%)",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Loading your Warplet Wrapped...
          </h2>
          <div style={{ marginTop: "1rem", opacity: 0.8 }}>
            Fetching your trading data
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "400px",
            padding: "2rem",
            background: "rgba(0, 0, 0, 0.2)",
            borderRadius: "1.5rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>Error loading data</h2>
          <div style={{ marginTop: "1rem", color: "#fca5a5", opacity: 0.9 }}>
            {(error as Error).message}
          </div>
          {useDevMode && (
            <button
              type="button"
              onClick={() => {
                setUseDevMode(false);
                setDevFid("");
              }}
              style={{
                marginTop: "1.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "2px solid #fbbf24",
                background: "transparent",
                color: "#fbbf24",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Try Another FID
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!metrics || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #472a91 0%, #855DCD 100%)",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: "400px",
            padding: "2rem",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "1.5rem",
            backdropFilter: "blur(10px)",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>No trading data found</h2>
          <div style={{ marginTop: "1rem", opacity: 0.8 }}>
            Make sure you have a verified wallet with trading history on Base
          </div>
          {useDevMode && (
            <button
              type="button"
              onClick={() => {
                setUseDevMode(false);
                setDevFid("");
              }}
              style={{
                marginTop: "1.5rem",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "2px solid white",
                background: "transparent",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Try Another FID
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <WarpletWrapped
      displayName={user.display_name || user.username}
      metrics={metrics}
    />
  );
}

export default App;
