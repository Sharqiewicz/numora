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
    return Array.from(new TextEncoder().encode(str))
      .map((byte) => byte.toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');
  };

  return (
    <ProblemSection
      id="mobile-keyboard"
      problemNumber={4}
      title="Mobile keyboard gremlins"
      subtitle="Invisible characters that break validation"
      description={
        <p>
          Mobile keyboards can insert non-breaking spaces (U+00A0), zero-width characters and other
          invisible Unicode. Validation and math then fail with no visible cause.
        </p>
      }
    >
      <div className="mb-8 p-4 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-center gap-2 mb-3 text-secondary">
          <Smartphone className="w-5 h-5" />
          <span className="font-medium">The hidden character problem</span>
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
            <p className="text-xs text-muted-foreground mb-1">What's actually there (UTF-8 bytes, hex):</p>
            <code className="block p-2 rounded bg-background font-mono text-signal-amber">
              31 C2 A0 32 33 34
            </code>
            <p className="text-xs text-muted-foreground mt-1">(C2 A0 = UTF-8 non-breaking space)</p>
          </div>
        </div>
      </div>

      <InputComparison
        leftLabel="Native input"
        rightLabel="Numora"
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
              placeholder="1 234"
            />
            {nativeValue && (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">UTF-8 bytes (hex):</p>
                  <code className="font-mono text-signal-amber text-xs break-all">
                    {showHexView(nativeValue)}
                  </code>
                </div>
                <div className="p-3 rounded-lg bg-signal-red/10 border border-signal-red/30">
                  <p className="text-xs text-signal-red">
                    parseFloat("{nativeValue}") = {String(parseFloat(nativeValue))}
                    <br />
                    Parsing stops at the hidden character.
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
              placeholder="1 234"
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-lg font-mono focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
            />
            {numoraValue && (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-muted/30 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">UTF-8 bytes (hex):</p>
                  <code className="font-mono text-signal-green text-xs break-all">
                    {showHexView(numoraValue)}
                  </code>
                </div>
                <div className="p-3 rounded-lg bg-signal-green/10 border border-signal-green/30">
                  <p className="text-xs text-signal-green">
                    Numora cleaned it to: {numoraValue}
                    <br />
                    It removed every hidden character.
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
