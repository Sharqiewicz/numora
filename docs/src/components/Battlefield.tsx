import { Swap } from './Swap';

export function Battlefield() {
  return (
    <div className="pb-16 relative">
      <div className="text-center mb-12 max-w-3xl mx-auto px-4">
        <h2 className="text-4xl mb-4">
          Built for the <span className="text-secondary">Swap Interface</span>.
        </h2>
        <p>
          Handling numeric state in DeFi is deceptively hard. You need tosanitize "bad" keystrokes,
          handle scientific notation, calculate the caret position and respect user locale—all while
          keeping the underlying value pristine for the blockchain.
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <div
          className="hidden md:block absolute -left-48 top-20 w-40 text-right animate-bounce"
          style={{ animationDuration: '3s' }}
        >
          <div className="absolute -right-6 top-1/5 w-5 h-[1px] bg-secondary"></div>
          <div className="text-secondary font-bold text-sm mb-1">Real-time Formatting</div>
          <div className="text-xs">
            Auto-formats with commas as you type.
          </div>
        </div>


        <div
          className="hidden md:block absolute -left-48 top-60 w-40 text-right animate-bounce"
          style={{ animationDuration: '6s' }}
        >
          <div className="absolute -right-6 top-1/5 w-5 h-[1px] bg-secondary"></div>
          <div className="text-secondary font-bold text-sm mb-1">Compact/Scientific notation</div>
          <div className="text-xs">
            Try to type 1k, 1m, 1b... <br/>
            Or paste 1e-5, 1e+5.
          </div>
        </div>

        <div
          className="hidden md:block absolute -right-48 top-32 w-40 text-left animate-bounce"
          style={{ animationDuration: '4s' }}
        >
          <div className="absolute -left-6 top-1/5 w-5 h-[1px] bg-secondary"></div>
          <div className="text-secondary font-bold text-sm mb-1">Precision Control</div>
          <div className="text-xs">
            Prevents &gt;18 decimals automatically.
          </div>
        </div>


        <div
          className="hidden md:block absolute -right-52 bottom-20 w-40 text-left animate-bounce"
          style={{ animationDuration: '5s' }}
        >
          <div className="absolute -left-10 top-1/5 w-8 h-[1px] bg-secondary"></div>
          <div className="text-secondary font-bold text-sm mb-1">Sanitization</div>
          <div className="text-xs">
            Pastes are sanitized instantly.
          </div>
        </div>

          <Swap />
      </div>
    </div>
  );
}

