import { useState } from 'react';
import { NumoraInput } from 'numora-react';
import { ProblemSection } from '../ProblemSection';
import { InputComparison } from '../InputComparison';
import { PasteButton } from '../PasteButton';
import { BrokenInput } from '../BrokenInput';
import { Smartphone } from 'lucide-react';

const MOBILE_PASTE_VALUE = '1\u00A0234';

export function MobileKeyboardDemo() {
  const [nativeValue, setNativeValue] = useState('');
  const [numoraValue, setNumoraValue] = useState('');

  const handleNativePaste = (value: string) => {
    setNativeValue(value);
  };

  const handleNumoraPaste = (value: string) => {
    setNumoraValue(value);
  };

  const showHexView = (str: string) => {
    return str
      .split('')
      .map((char) => char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');
  };

  return (
    <ProblemSection
      id="mobile-keyboard"
      problemNumber={4}
      title="Mobile Keyboard Gremlins"
      subtitle="Hidden characters that break your validation"
      description={
        <p>
          Mobile keyboards often insert non-breaking spaces (U+00A0), zero-width characters,
          or other invisible Unicode. These break validation and calculations silently.
        </p>
      }
    >
      <div className="mb-8 p-4 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-2 mb-3 text-secondary">
          <Smartphone className="w-5 h-5" />
          <span className="font-medium">The Hidden Character Problem</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          When copying "1 234" from a mobile app, you might get:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">What you see:</p>
            <code className="block p-2 rounded bg-background font-mono">1 234</code>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">What's actually there (hex):</p>
            <code className="block p-2 rounded bg-background font-mono text-orange-400">
              31 C2 A0 32 33 34
            </code>
            <p className="text-xs text-muted-foreground mt-1">
              (C2 A0 = UTF-8 non-breaking space)
            </p>
          </div>
        </div>
      </div>

      <InputComparison
        leftLabel="Native Input"
        rightLabel="Numora Input"
        leftInput={
          <div className="space-y-4">
            <PasteButton
              label="Simulate mobile paste"
              value={MOBILE_PASTE_VALUE}
              onPaste={handleNativePaste}
              className="w-full justify-center"
            />
            <BrokenInput
              mode="native-text"
              value={nativeValue}
              onChange={setNativeValue}
              placeholder="Paste mobile number..."
            />
            {nativeValue && (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Hex view:</p>
                  <code className="font-mono text-orange-400 text-xs break-all">
                    {showHexView(nativeValue)}
                  </code>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-xs text-red-400">
                    parseFloat("{nativeValue}") = {parseFloat(nativeValue) || 'NaN'}
                    <br />
                    The hidden character breaks parsing!
                  </p>
                </div>
              </div>
            )}
          </div>
        }
        rightInput={
          <div className="space-y-4">
            <PasteButton
              label="Simulate mobile paste"
              value={MOBILE_PASTE_VALUE}
              onPaste={handleNumoraPaste}
              className="w-full justify-center"
            />
            <NumoraInput
              value={numoraValue}
              onChange={(e) => setNumoraValue(e.target.value)}
              placeholder="Paste mobile number..."
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
            />
            {numoraValue && (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Hex view:</p>
                  <code className="font-mono text-green-400 text-xs break-all">
                    {showHexView(numoraValue)}
                  </code>
                </div>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-xs text-green-400">
                    Automatically cleaned to: {numoraValue}
                    <br />
                    All hidden characters removed!
                  </p>
                </div>
              </div>
            )}
          </div>
        }
      />
    </ProblemSection>
  );
}
