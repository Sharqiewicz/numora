import { Button } from '@/components/ui/button'
import { createFileRoute, Link } from '@tanstack/react-router'
import CHEVRON_RIGHT from '@/assets/chevron-right.svg'

export const Route = createFileRoute('/docs/numora-react/')({
  component: GetStarted,
})

function GetStarted() {
  return (
    <div className="prose prose-invert max-w-none text-muted-foreground!">
      <h1>Get Started</h1>
      <p >
        <strong className="font-numora">numora</strong> is a powerful, <strong className="font-numora">framework-agnostic</strong>, tamper-proof numeric input library that provides safe number handling,
         sanitization, validation, formatting and more.
      </p>

      <h2>Why <strong className="font-numora">numora</strong>?</h2>

      <p >If you audit the codebases of the top 10 DeFi protocols—Uniswap, Aave, Curve, Balancer, and others—you will notice a pattern. They all all use the same blockchain-interface libraries (ethers.js, viem), the same frameworks (React), the same wallet-connection libraries etc.</p>
      <p >But when it comes to the most critical UI component in finance - the Numeric Input - every single one of them has built a custom implementation from scratch</p>
      <ul className="list-disc list-inside ">
        <li key="uniswap">Uniswap maintains ~200 lines of custom regex and locale logic.</li>
        <li key="aave">Aave wraps a formatting library with heavy custom validation.</li>
        <li key="curve">Curve relies on a complex chain of hooks to handle state.</li>
      </ul>

      <p><strong>There is no standard.</strong> Every new DeFi developer wastes days reinventing the wheel: writing the correct comma/dot separator logic with all edge cases, fighting with parseFloat precision loss, and patching bugs where mobile keyboards insert ghost characters. Or even worse - they write their own formatting logic from scratch.</p>
      <p>DeFi projects are likely to have bugs and extended implementation times if they do not have a standard.</p>

    <hr/>

      <p>That's where <strong className="font-numora">numora</strong> comes in. It is a standard for DeFi numeric inputs that provides a consistent and reliable way to handle numeric inputs in DeFi applications.</p>
      <p>We analyzed the input implementations of the biggest DeFi apps to understand exactly what features were necessary for a "perfect" financial input.</p>
      <ul className="list-disc list-inside mb-6">
        <li><strong>Full Event Lifecycle Control:</strong> Sanitization isn't just checking the current value—it means intercepting and cleaning data across all input vectors, whether the user is typing character-by-character (<code>onChange</code>), dumping data from the clipboard (<code>onPaste</code>), or leaving the field (<code>onBlur</code>).</li>
        <li><strong>Preventing Scientific Notation:</strong> Native JavaScript converts numbers smaller than <code>1e-6</code> (0.000001) into scientific notation (e.g., <code>5e-7</code>). A DeFi input must <em>never</em> do this. <strong className="font-numora">numora</strong> preserves the full expanded string for every value, no matter how small.</li>
        <li><strong>Caret Position Management:</strong> When live-formatting is enabled (e.g. inserting thousands separators as you type), the input must manually calculate and restore the cursor position. Without this, the cursor erratically jumps to the end of the line after every keystroke.</li>
        <li><strong>Strict Decimal Validation:</strong> Enforcing token-specific limits (e.g., max 6 decimals for USDC) while handling both comma (<code>,</code>) and dot (<code>.</code>) separators correctly based on the user's locale.</li>
        <li><strong>Smart Paste Sanitization:</strong> The ability to paste messy data directly from block explorers (e.g., <code>$212,210,148.59</code> or <code>68,029.2830 ETH</code>) and have it instantly cleaned to a valid number.</li>
        <li><strong>Power User Shortcuts:</strong> Parsing compact inputs like "1k" (1,000) or automatically expanding scientific inputs like "1e-9" into readable decimal strings.</li>

      </ul>

     <p>and more...</p>

      <hr/>

      <h2>Next Steps</h2>
      <p>
        Check out the <a href="/docs/numora/installation">Installation</a> guide for detailed setup
        instructions for your framework, or explore the{' '}
        <a href="/docs/numora/features/sanitization">Features</a> to learn about all the capabilities
        Numora offers.
      </p>
      <div className="flex justify-between items-center gap-2 my-8">
        <Link to="/docs/numora-react/installation"><Button variant="default">Installation <img src={CHEVRON_RIGHT} alt="Chevron Right" className="w-4 h-4" /></Button></Link>
      </div>
    </div>
  )
}