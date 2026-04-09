import { TOKENS, type TokenInfo } from '@/lib/constants/tokens';

interface TokenSelectorProps {
  label: string;
  selectedToken: TokenInfo;
  onSelect: (token: TokenInfo) => void;
  disabledToken?: TokenInfo;
  isOpen?: boolean;
  onToggle: (next: boolean) => void;
}

export function TokenSelector({
  selectedToken,
  onSelect,
  disabledToken,
  isOpen = false,
  onToggle,
}: TokenSelectorProps) {
  function handleTokenSelect(token: TokenInfo) {
    onSelect(token);
    onToggle(false);
  }

  function handleKeyDown(e: React.KeyboardEvent, token: TokenInfo) {
    if (e.key === 'Enter' || e.key === ' ') {
      handleTokenSelect(token);
    }
  }

  return (
    <div className="relative w-full min-w-[110px]">
      <button
        type="button"
        className={`flex w-full items-center rounded-lg p-1.5 cursor-pointer focus:outline-none relative z-40 bg-black hover:bg-surface-3 border border-surface-3 hover:border-surface-5 focus:border-brand focus:shadow-[0_0_0_3px_oklch(0.460_0.277_278_/_0.1)] text-white ${
          isOpen ? 'border-b-0 rounded-bl-none rounded-br-none' : ''
        }`}
        onClick={() => onToggle(!isOpen)}
      >
        <img
          src={selectedToken.logoImg}
          alt={selectedToken.symbol}
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full mr-3"
        />
        <p className="font-semibold sm:text-base text-sm text-white mr-1 text-gray-900">
          {selectedToken.symbol}
        </p>
        <svg
          width="20"
          height="20"
          fill="none"
          className={`ml-auto text-muted-icon transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path
            d="M7 8l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <ul
        className={`w-full !mt-0 no-scrollbar absolute left-0 right-0 top-full w-full rounded-xl rounded-tl-none rounded-tr-none shadow-lg overflow-hidden z-100 transition-all duration-300 ease-out border-t-0 bg-surface-1 border border-brand ${
          isOpen
            ? 'max-h-64 opacity-100 translate-y-0'
            : 'max-h-0 opacity-0 transform translate-y-0'
        }`}
      >
        {TOKENS.filter((t) => t.symbol !== selectedToken.symbol).map((token) => (
          <li key={token.symbol}>
            <button
            className={`w-full !mt-0 flex items-center px-3 py-2 cursor-pointer transition-colors duration-200 hover:bg-surface-3 ${
              disabledToken && token.symbol === disabledToken.symbol
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}

          disabled={disabledToken && token.symbol === disabledToken.symbol}
            onClick={() => handleTokenSelect(token)}
            onKeyDown={(e) => handleKeyDown(e, token)}
            role="button"
            tabIndex={0}
          >
            <img
              src={token.logoImg}
              alt={token.symbol}
              className="w-5 h-5 rounded-full mr-2"
            />
            <span className="font-semibold text-sm sm:text-base text-white mr-1 text-gray-900">
              {token.symbol}
            </span>
          </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

