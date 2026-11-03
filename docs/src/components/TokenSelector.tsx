import { useCallback, useId, useRef } from 'react';
import { useDismiss } from '@/hooks/use-dismiss';
import { TOKENS, type TokenInfo } from '@/lib/constants/tokens';

interface TokenSelectorProps {
  label: string;
  selectedToken: TokenInfo;
  onSelect: (token: TokenInfo) => void;
  /** Token picked on the other side of the pair - hidden from this list. */
  disabledToken?: TokenInfo;
  isOpen?: boolean;
  onToggle: (next: boolean) => void;
}

export function TokenSelector({
  label,
  selectedToken,
  onSelect,
  disabledToken,
  isOpen = false,
  onToggle,
}: TokenSelectorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const close = useCallback(() => onToggle(false), [onToggle]);
  useDismiss(rootRef, isOpen, close);

  function handleTokenSelect(token: TokenInfo) {
    onSelect(token);
    onToggle(false);
    triggerRef.current?.focus();
  }

  const options = TOKENS.filter(
    (t) => t.symbol !== selectedToken.symbol && t.symbol !== disabledToken?.symbol
  );

  return (
    <div ref={rootRef} className="relative w-full min-w-[110px]">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Select ${label.toLowerCase()} token (${selectedToken.symbol} selected)`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={listId}
        className={`flex w-full items-center rounded-lg p-2 cursor-pointer relative z-40 bg-black hover:bg-surface-3 border border-surface-3 hover:border-surface-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand text-white transition-[background-color,border-color,scale] duration-150 ease-out active:scale-[0.96] ${
          isOpen ? 'border-b-transparent! rounded-bl-none rounded-br-none' : ''
        }`}
        onClick={() => onToggle(!isOpen)}
      >
        <img
          src={selectedToken.logoImg}
          alt=""
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full mr-3 outline outline-1 -outline-offset-1 outline-black/10"
        />
        <span className="font-semibold sm:text-base text-sm text-foreground mr-1">
          {selectedToken.symbol}
        </span>
        <svg
          width="20"
          height="20"
          fill="none"
          aria-hidden="true"
          className={`ml-auto text-muted-icon transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path d="M7 8l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      <ul
        id={listId}
        inert={!isOpen}
        className={`w-full !mt-0 no-scrollbar absolute left-0 right-0 top-full origin-top rounded-xl rounded-tl-none rounded-tr-none shadow-lg overflow-hidden z-100 transition-[opacity,scale,max-height] duration-200 ease-out border-t-0 bg-surface-1 border border-brand ${
          isOpen ? 'max-h-64 scale-100 opacity-100' : 'max-h-0 scale-95 opacity-0'
        }`}
      >
        {options.map((token) => (
          <li key={token.symbol}>
            <button
              type="button"
              className="w-full !mt-0 flex items-center px-3 py-2.5 cursor-pointer transition-[background-color,scale] duration-150 ease-out hover:bg-surface-3 focus-visible:bg-surface-3 focus-visible:outline-none active:scale-[0.96]"
              onClick={() => handleTokenSelect(token)}
            >
              <img
                src={token.logoImg}
                alt=""
                className="w-5 h-5 rounded-full mr-2 outline outline-1 -outline-offset-1 outline-black/10"
              />
              <span className="font-semibold text-sm sm:text-base text-foreground mr-1">
                {token.symbol}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
