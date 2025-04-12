import { useState, useEffect } from 'react';
import { NumericInput } from 'numora-react';

export default function DefiSwap() {
  const [fromAmount, setFromAmount] = useState('0');
  const [toAmount, setToAmount] = useState('0');
  const [fromToken, setFromToken] = useState('ETH');
  const [toToken, setToToken] = useState('USDC');
  const [exchangeRate, setExchangeRate] = useState(1800);
  const [slippage, setSlippage] = useState('0.5');

  const tokens = {
    ETH: {
      name: 'Ethereum',
      symbol: 'ETH',
      logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      decimals: 18
    },
    USDC: {
      name: 'USD Coin',
      symbol: 'USDC',
      logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      decimals: 6
    },
    BTC: {
      name: 'Bitcoin',
      symbol: 'BTC',
      logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      decimals: 8
    },
    USDT: {
      name: 'Tether',
      symbol: 'USDT',
      logoUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      decimals: 6
    }
  };

  useEffect(() => {
    if (fromToken === 'ETH' && toToken === 'USDC') {
      setToAmount((Number(fromAmount || '0') * exchangeRate).toString());
    } else if (fromToken === 'USDC' && toToken === 'ETH') {
      setToAmount((Number(fromAmount || '0') / exchangeRate).toString());
    } else {
      setToAmount(fromAmount);
    }
  }, [fromAmount, fromToken, toToken, exchangeRate]);

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);

    const tempAmount = fromAmount;
    setFromAmount(toAmount);
    setToAmount(tempAmount);
  };


  const handleSwap = () => {
    // Nothing
  };

  return (
    <div className="swap-container">
      <div className="swap-card">
        <h2>Swap Tokens</h2>

        {/* From token section */}
        <div className="swap-section">
          <div className="token-select">
            <label>From</label>
            <select
              value={fromToken}
              onChange={(e) => {
                setFromAmount('0')
                setFromToken(e.target.value)
              }}
              className="token-dropdown"
            >
              {Object.keys(tokens).map(symbol => (
                <option key={symbol} value={symbol} disabled={symbol === toToken}>
                  {tokens[symbol as keyof typeof tokens].name} ({symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="amount-input">
            <label>Amount</label>
            <NumericInput
              maxDecimals={tokens[fromToken as keyof typeof tokens].decimals}
              onChange={(e: any) => setFromAmount(e.target.value)}
              value={fromAmount}
              placeholder="0.0"
              className="numeric-input"
            />
          </div>
        </div>

        <button className="swap-direction-button" onClick={handleSwapTokens}>
          ↑↓
        </button>

        <div className="swap-section">
          <div className="token-select">
            <label>To</label>
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value)}
              className="token-dropdown"
            >
              {Object.keys(tokens).map(symbol => (
                <option key={symbol} value={symbol} disabled={symbol === fromToken}>
                  {tokens[symbol as keyof typeof tokens].name} ({symbol})
                </option>
              ))}
            </select>
          </div>

          <div className="amount-input">
            <label>Amount</label>
            <NumericInput
              maxDecimals={tokens[toToken as keyof typeof tokens].decimals}
              value={toAmount}
              onChange={setToAmount}
              placeholder="0.0"
              disabled
              className="numeric-input"
            />
          </div>
        </div>

        <div className="slippage-section">
          <label>Slippage Tolerance (%)</label>
          <NumericInput
            maxDecimals={2}
            value={slippage}
            onChange={setSlippage}
            className="slippage-input"
          />
        </div>

        {/* Exchange rate info */}
        <div className="exchange-rate-info">
          <p>Exchange Rate: 1 {fromToken} ≈ {exchangeRate} {toToken}</p>
        </div>

        {/* Swap button */}
        <button
          className="swap-button"
          onClick={handleSwap}
          disabled={!parseFloat(fromAmount)}
        >
          Swap
        </button>
      </div>
    </div>
  );
}