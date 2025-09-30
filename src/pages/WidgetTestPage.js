import React, { useState, useEffect } from 'react';
import { PriceChartWidget } from '../components/token/TokenChart';
import { getTrendingTokens } from '../services/api';

const WidgetTestPage = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadTrendingTokens = async () => {
      try {
        setLoading(true);
        console.log('Loading trending tokens...');

        // Fetch trending tokens from API
        const trendingData = await getTrendingTokens('', 20);
        console.log('Trending tokens data:', trendingData);

        // Transform the trending tokens data
        const formattedTokens = trendingData.map((token, index) => ({
          id: `widget-${index}`,
          pairAddress: token.tokenAddress, // Use tokenAddress as pair address
          chainId: token.chainId,
          pairLabel: `${token.symbol}/USD`,
          exchangeName: 'DEX',
          exchangeLogo: '/images/exchanges/uniswap.svg',
          volume24hrUsd: token.totalVolume?.['24h'] || 0,
          liquidityUsd: token.liquidityUsd || 0,
          pair: [
            {
              pairTokenType: 'token0',
              symbol: token.symbol,
              name: token.name,
              address: token.tokenAddress
            },
            {
              pairTokenType: 'token1',
              symbol: 'USD',
              name: 'US Dollar',
              address: null
            }
          ],
          tokenName: token.name,
          tokenSymbol: token.symbol,
          priceChange24h: token.pricePercentChange?.['24h'],
          price: token.usdPrice,
          priceUsd: token.usdPrice,
          creationTime: token.createdAt ? token.createdAt * 1000 : null, // Convert to milliseconds
          exchange: {
            name: 'DEX',
            logo: '/images/exchanges/uniswap.svg'
          },
          txns: token.transactions?.['24h'],
          holders: token.holders,
          marketCap: token.marketCap
        }));

        setTokens(formattedTokens);
        setError(null);
        console.log(`Loaded ${formattedTokens.length} trending tokens`);
      } catch (err) {
        console.error('Error loading trending tokens:', err);
        setError('Failed to load trending tokens');
        // Use fallback data if loading fails
        setTokens(getFallbackTokens());
      } finally {
        setLoading(false);
      }
    };

    loadTrendingTokens();
  }, []);

  // Fallback tokens in case API fails
  const getFallbackTokens = () => {
    return [
      {
        id: 'widget-fallback-1',
        pairAddress: '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640',
        chainId: '0x1',
        pairLabel: 'USDC/WETH',
        exchangeName: 'Uniswap V3',
        exchangeLogo: '/images/exchanges/uniswap.svg',
        volume24hrUsd: 125000000,
        liquidityUsd: 450000000,
        pair: [
          { pairTokenType: 'token0', symbol: 'USDC', name: 'USD Coin' },
          { pairTokenType: 'token1', symbol: 'WETH', name: 'Wrapped Ether' }
        ]
      },
      {
        id: 'widget-fallback-2',
        pairAddress: '0x11b815efb8f581194ae79006d24e0d814b7697f6',
        chainId: '0x1',
        pairLabel: 'WETH/USDT',
        exchangeName: 'Uniswap V3',
        exchangeLogo: '/images/exchanges/uniswap.svg',
        volume24hrUsd: 95000000,
        liquidityUsd: 320000000,
        pair: [
          { pairTokenType: 'token0', symbol: 'WETH', name: 'Wrapped Ether' },
          { pairTokenType: 'token1', symbol: 'USDT', name: 'Tether USD' }
        ]
      }
    ];
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
  };

  if (loading) {
    return (
      <div className="p-6 bg-dex-bg-primary min-h-screen">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-dex-text-primary mb-6">
            Loading Trending Tokens...
          </h1>
          <div className="text-dex-text-secondary">
            Fetching trending token data from API...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-dex-bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-dex-text-primary mb-2">
            Trending Token Charts - {tokens.length} Tokens
          </h1>
          {error && (
            <div className="text-yellow-500 mb-2">
              Note: {error}. Showing sample data.
            </div>
          )}
          <p className="text-dex-text-secondary">
            Displaying {tokens.length} trending token charts (multi-chain)
          </p>
        </div>

        {/* 2-column grid with larger charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {tokens.map((token, index) => (
            <div
              key={token.id}
              className="bg-dex-bg-secondary rounded-lg p-4 h-[500px] flex flex-col"
            >
              {/* Token Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div>
                      <div className="text-lg font-semibold text-dex-text-primary">
                        {token.pairLabel}
                      </div>
                      {token.tokenName && (
                        <div className="text-sm text-dex-text-secondary">
                          {token.tokenName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {token.priceUsd !== undefined && (
                      <div className="text-sm text-dex-text-primary">
                        ${typeof token.priceUsd === 'number'
                          ? token.priceUsd < 0.000001
                            ? token.priceUsd.toExponential(2)
                            : token.priceUsd.toFixed(6)
                          : '0.000000'}
                      </div>
                    )}
                    {token.priceChange24h !== undefined && (
                      <div
                        className={`text-sm font-medium ${token.priceChange24h >= 0
                            ? 'text-green-500'
                            : 'text-red-500'
                          }`}
                      >
                        {token.priceChange24h >= 0 ? '+' : ''}
                        {token.priceChange24h.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Pool Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs text-dex-text-secondary">
                  <div>
                    <span className="text-dex-text-tertiary">Vol: </span>
                    <span className="text-dex-text-primary">
                      ${formatNumber(token.volume24hrUsd)}
                    </span>
                  </div>
                  <div>
                    <span className="text-dex-text-tertiary">Liq: </span>
                    <span className="text-dex-text-primary">
                      ${formatNumber(token.liquidityUsd)}
                    </span>
                  </div>
                  <div>
                    <span className="text-dex-text-tertiary">MC: </span>
                    <span className="text-dex-text-primary">
                      ${formatNumber(token.marketCap)}
                    </span>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="flex items-center text-xs text-dex-text-secondary space-x-3 mt-1">
                  <span>{token.exchangeName}</span>
                  {token.creationTime && (
                    <span>Created {formatTime(token.creationTime)}</span>
                  )}
                  {token.holders && (
                    <span>{token.holders} holders</span>
                  )}
                  {token.txns && (
                    <span>{token.txns} txns</span>
                  )}
                </div>

                {/* Pool Address */}
                {token.pairAddress && (
                  <div className="text-xs text-dex-text-tertiary mt-1 font-mono">
                    Pool: {token.pairAddress.slice(0, 6)}...{token.pairAddress.slice(-4)}
                  </div>
                )}
              </div>

              {/* Chart Container - Takes remaining space */}
              <div className="flex-1 min-h-0">
                <PriceChartWidget
                  pair={token}
                  timeFrame="1d"
                  widgetId={`widget-container-${index}`}
                />
              </div>
            </div>
          ))}
        </div>

        {tokens.length === 0 && !loading && (
          <div className="text-center text-dex-text-secondary mt-8">
            No trending tokens found
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetTestPage;