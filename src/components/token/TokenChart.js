// components/token/TokenChart.js
import React, { useEffect, useRef, useMemo } from 'react';

export const PriceChartWidget = ({ pair, timeFrame, widgetId }) => {
  const containerRef = useRef(null);

  // Use provided widgetId or generate a unique one (memoized to prevent re-generation)
  const chartContainerId = useMemo(
    () => widgetId || `price-chart-widget-${Math.random().toString(36).substr(2, 9)}`,
    [widgetId]
  );

  // Map our timeframe to chart widget timeframe format
  const timeframeMap = {
    "5m": "5",
    "15m": "15",
    "1h": "60",
    "4h": "240",
    "1d": "1D",
  };

  useEffect(() => {
    if (!pair || !pair.pairAddress || typeof window === 'undefined') return;

    // Get the appropriate chain ID format for the chart widget
    const getChartChainId = () => {
      // For Solana pairs, use "solana" as the chain ID
      if (
        pair.chainId === "solana" ||
        pair.exchangeName?.toLowerCase().includes("solana")
      ) {
        return "solana";
      }

      // For EVM chains, use the hex format
      return pair.chainId || "0x1";
    };

    const loadWidget = () => {
      if (typeof window.createMyWidget === 'function') {
        // Get the correct chain ID format
        const chartChainId = getChartChainId();

        window.createMyWidget(chartContainerId, {
          autoSize: true,
          chainId: chartChainId,
          tokenAddress: pair.pairAddress,
          showHoldersChart: true,
          defaultInterval: timeframeMap[timeFrame] || '1D',
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'Etc/UTC',
          theme: 'moralis',
          locale: 'en',
          showCurrencyToggle: true,
          hideLeftToolbar: false,
          hideTopToolbar: false,
          hideBottomToolbar: false
        });

        console.log(
          `Chart initialized with containerId: ${chartContainerId}, chainId: ${chartChainId}, pairAddress: ${pair.pairAddress}`
        );
      } else {
        console.error('createMyWidget function is not defined. Waiting for script to load...');
        // Retry after a short delay
        setTimeout(loadWidget, 500);
      }
    };

    // Clear any existing chart before creating a new one
    const existingWidget = document.getElementById(chartContainerId);
    if (existingWidget) {
      while (existingWidget.firstChild) {
        existingWidget.removeChild(existingWidget.firstChild);
      }
    }

    // Check if script is already loaded
    const scriptLoaded = document.getElementById('moralis-chart-widget');

    if (!scriptLoaded) {
      const script = document.createElement('script');
      script.id = 'moralis-chart-widget';
      script.src = 'https://moralis.com/static/embed/chart.js';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => {
        // Give it a moment to initialize
        setTimeout(loadWidget, 100);
      };
      script.onerror = () => {
        console.error('Failed to load the chart widget script.');
      };
      document.body.appendChild(script);
    } else {
      // Script already loaded, try to create widget
      loadWidget();
    }

    // Cleanup function
    return () => {
      // If there's a cleanup method exposed by the widget, call it here
      if (typeof window.destroyMyWidget === "function") {
        window.destroyMyWidget(chartContainerId);
      }
    };
  }, [pair, timeFrame, chartContainerId]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div
        id={chartContainerId}
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

const TokenChart = ({ pair, timeFrame, onTimeFrameChange }) => {

  if (!pair) {
    return (
      <div className="h-full flex items-center justify-center text-dex-text-secondary">
        No chart data available
      </div>
    );
  }

  // Time frame options
  const timeFrames = [
    { id: "5m", label: "5m" },
    { id: "15m", label: "15m" },
    { id: "1h", label: "1h" },
    { id: "4h", label: "4h" },
    { id: "1d", label: "1d" },
  ];

  // Extract pair tokens
  const baseToken = pair.pair.find((t) => t.pairTokenType === "token0");
  const quoteToken = pair.pair.find((t) => t.pairTokenType === "token1");

  return (
    <div className="h-full flex flex-col">
      {/* Top bar with pair info and controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="flex items-center mr-4">
            <img
              src={
                pair.exchangeLogo || "/images/exchanges/default-exchange.svg"
              }
              alt={pair.exchangeName}
              className="w-6 h-6 mr-2 rounded-full"
              onError={(e) => {
                e.target.onError = null;
                e.target.src =
                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzM0Mzk0NyIvPjwvc3ZnPg==";
              }}
            />
            <span className="font-medium text-dex-text-primary">
              {pair.pairLabel}
            </span>
            <span className="ml-2 text-dex-text-secondary">
              on {pair.exchangeName}
            </span>
          </div>

          <div className="text-dex-text-secondary text-sm">
            <span className="mr-2">
              Volume: ${(pair.volume24hrUsd || 0).toLocaleString()}
            </span>
            <span>|</span>
            <span className="mx-2">
              Liquidity: ${(pair.liquidityUsd || 0).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center">
          <div className="inline-flex rounded-md mr-4"></div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 bg-dex-bg-secondary rounded-lg">
        <PriceChartWidget pair={pair} timeFrame={timeFrame} />
      </div>
    </div>
  );
};

export default TokenChart;