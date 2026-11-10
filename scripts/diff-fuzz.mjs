// Differential fuzz: base build vs candidate build, on random inputs and options.
// Proves a refactor changed no behaviour. Build the starting commit, keep its
// packages/core/dist somewhere, build the candidate, then from packages/core (where
// `fast-check` resolves):
//
//   node ../../scripts/diff-fuzz.mjs <baseCoreDist> <newCoreDist> [runs=20000] [seed=42]
//
// Prints NO DIFFS (exit 0), or the functions that disagree with sample inputs (exit 1).
// Both paths must be absolute.
//
// Covers the pure pipeline functions on the package root and the DOM steps on
// `numora/internal` (applyBeforeInput, applyPaste, applyInputFallback, applyBlur,
// attachFocusStrip, formatForDisplay, handleOnKeyDownNumoraInput), driven by fake elements
// that record every write. Fails loudly if a function is missing from either build, so a
// renamed export can never turn into a silent "NO DIFFS".
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const require = createRequire(pathToFileURL(`${process.cwd()}/`));
const fc = require('fast-check');

const [baseDir, newDir, runsArg, seedArg] = process.argv.slice(2);
const runs = Number(runsArg ?? 20000);
const seed = Number(seedArg ?? 42);
const load = async (dir) => ({
  ...(await import(`${dir}/index.mjs`)),
  ...(await import(`${dir}/internal.mjs`)),
});
const A = await load(baseDir);
const B = await load(newDir);

// No real timers: the caret-rescue setTimeout would pile up across runs.
globalThis.setTimeout = () => 0;
console.error = () => {};

const chars = [
  '0',
  '1',
  '2',
  '5',
  '9',
  '.',
  ',',
  '-',
  '+',
  'e',
  'E',
  'k',
  'm',
  'b',
  ' ',
  '_',
  "'",
  '１',
  '．',
  '٣',
  '−',
  'x',
  ' ',
  '٫',
];
const str = fc.array(fc.constantFrom(...chars), { maxLength: 14 }).map((a) => a.join(''));
// Values a real field can hold: mostly digits with the occasional separator.
const fieldStr = fc
  .array(fc.constantFrom('0', '1', '2', '3', '7', '9', '9', '0', '.', ',', '-', ' ', "'"), {
    maxLength: 16,
  })
  .map((a) => a.join(''));
const opts = fc
  .record({
    formatOn: fc.constantFrom('blur', 'change'),
    thousandSeparator: fc.constantFrom(',', '.', ' ', "'", '_', ''),
    decimalSeparator: fc.constantFrom('.', ','),
    groupingStyle: fc.constantFrom('thousand', 'lakh', 'wan', 'none'),
    decimalMaxLength: fc.constantFrom(0, 2, 6, 18),
    decimalMinLength: fc.constantFrom(undefined, 0, 2),
    maxLength: fc.constantFrom(undefined, undefined, 1, 5, 12),
    enableCompactNotation: fc.boolean(),
    enableNegative: fc.boolean(),
    enableLeadingZeros: fc.boolean(),
    enableScientificNotation: fc.boolean(),
    autoAddLeadingZero: fc.boolean(),
    isAllowedMax: fc.constantFrom(undefined, undefined, 6),
  })
  .filter(
    (o) =>
      o.thousandSeparator !== o.decimalSeparator && (o.decimalMinLength ?? 0) <= o.decimalMaxLength
  )
  .map(({ isAllowedMax, ...o }) =>
    isAllowedMax ? { ...o, isAllowed: (raw) => raw.length <= isAllowedMax } : o
  );

const INPUT_TYPES = [
  'insertText',
  'insertText',
  'insertText',
  'insertFromPaste',
  'insertFromDrop',
  'insertReplacementText',
  'insertCompositionText',
  'deleteContentBackward',
  'deleteContentForward',
  'deleteByCut',
  'deleteByDrag',
  'deleteSoftLineBackward',
  'deleteHardLineBackward',
  'deleteSoftLineForward',
  'deleteHardLineForward',
  'deleteWordBackward',
  'deleteWordForward',
  'historyUndo',
  'historyRedo',
];

const makeEl = (value, s, e, flags = {}) => {
  const log = [];
  const listeners = {};
  const el = {
    value,
    selectionStart: s,
    selectionEnd: e,
    readOnly: !!flags.readOnly,
    disabled: !!flags.disabled,
    setRangeText(text, from, to, mode) {
      log.push(['setRangeText', text, from, to, mode]);
      this.value = this.value.slice(0, from) + text + this.value.slice(to);
    },
    setSelectionRange(a, b) {
      log.push(['setSelectionRange', a, b]);
      this.selectionStart = a;
      this.selectionEnd = b;
    },
    addEventListener(type, fn) {
      listeners[type] ??= [];
      listeners[type].push(fn);
    },
    removeEventListener(type, fn) {
      listeners[type] = (listeners[type] ?? []).filter((f) => f !== fn);
    },
  };
  return { el, log, listeners };
};

// Runs `f` against a fresh fake element and returns everything observable as one string.
const run = (f, value, s, e, flags) => {
  const ctx = makeEl(value, s, e, flags);
  let out;
  let prevented = false;
  try {
    out = f(ctx, () => {
      prevented = true;
    });
  } catch (err) {
    out = `THROW:${err.message}`;
  }
  return JSON.stringify({
    out,
    prevented,
    value: ctx.el.value,
    sel: [ctx.el.selectionStart, ctx.el.selectionEnd],
    log: ctx.log,
  });
};
const safe = (f) => {
  try {
    return JSON.stringify(f());
  } catch (e) {
    return `THROW:${e.message}`;
  }
};

const REQUIRED = [
  'sanitizeNumoraInput',
  'formatValueForDisplay',
  'displayToRawValue',
  'validateNumoraInputOptions',
  'applyBeforeInput',
  'applyPaste',
  'applyInputFallback',
  'applyBlur',
  'attachFocusStrip',
  'formatForDisplay',
  'handleOnKeyDownNumoraInput',
];
for (const name of REQUIRED) {
  for (const [label, M] of [
    ['base', A],
    ['candidate', B],
  ]) {
    if (typeof M[name] !== 'function') {
      console.log(
        `MISSING EXPORT: ${name} in ${label} build. Update the fuzz script before trusting it.`
      );
      process.exit(2);
    }
  }
}

// Pure utilities taking (value, decimalSeparator): compared only where both builds have them;
// one that disappears from the candidate is reported, not skipped.
const single = [
  'normalizeForeignFormat',
  'expandCompactNotation',
  'expandScientificNotation',
  'removeLeadingZeros',
  'normalizeDigits',
  'normalizeUnicodeMinus',
  'normalizeNegativeZero',
  'removeNonNumericCharacters',
  'removeExtraDecimalSeparators',
  'prependLeadingZero',
  'filterMobileKeyboardArtifacts',
  'removeThousandSeparators',
];
const removed = single.filter((f) => typeof A[f] === 'function' && typeof B[f] !== 'function');

const diffs = {};
const counts = {};
const note = (k, ex) => {
  counts[k] = (counts[k] ?? 0) + 1;
  diffs[k] ??= [];
  if (diffs[k].length < 4) diffs[k].push(ex);
};
const cmp = (k, a, b, ex) => {
  if (a !== b) note(k, { ...ex, a, b });
};

fc.assert(
  fc.property(
    str,
    fieldStr,
    opts,
    fc.nat(20),
    fc.nat(20),
    str,
    fc.constantFrom(...INPUT_TYPES),
    fc.constantFrom('Backspace', 'Delete', 'a'),
    fc.boolean(),
    fc.boolean(),
    (v, fv, o, s0, e0, data, it, key, focused, ro) => {
      const show = { ...o, isAllowed: o.isAllowed ? 'len<=6' : undefined };
      for (const src of ['display', 'foreign', 'canonical']) {
        cmp(
          'sanitizeNumoraInput',
          safe(() => A.sanitizeNumoraInput(v, o, src)),
          safe(() => B.sanitizeNumoraInput(v, o, src)),
          { v, o: show, src }
        );
        cmp(
          'formatValueForDisplay',
          safe(() => A.formatValueForDisplay(v, o.decimalMaxLength, o, src)),
          safe(() => B.formatValueForDisplay(v, o.decimalMaxLength, o, src)),
          { v, o: show, src }
        );
        cmp(
          'formatForDisplay',
          safe(() => A.formatForDisplay(v, o, src)),
          safe(() => B.formatForDisplay(v, o, src)),
          { v, o: show, src }
        );
      }
      cmp(
        'displayToRawValue',
        safe(() => A.displayToRawValue(v, o)),
        safe(() => B.displayToRawValue(v, o)),
        { v, o: show }
      );
      for (const f of single) {
        if (typeof A[f] !== 'function' || typeof B[f] !== 'function') continue;
        cmp(
          f,
          safe(() => A[f](v, o.decimalSeparator)),
          safe(() => B[f](v, o.decimalSeparator)),
          { v, sep: o.decimalSeparator }
        );
      }

      // DOM steps run on both an arbitrary string and a plausible field value.
      for (const value of [v, fv]) {
        const s = Math.min(s0, value.length);
        const e = Math.min(Math.max(s, e0), value.length);
        const ex = { value, s, e, o: show };
        const before = (M) => (ctx, prevent) =>
          M.applyBeforeInput(
            {
              target: ctx.el,
              currentTarget: ctx.el,
              inputType: it,
              data,
              preventDefault: prevent,
              getTargetRanges: () => [],
            },
            o
          );
        cmp('applyBeforeInput', run(before(A), value, s, e), run(before(B), value, s, e), {
          ...ex,
          it,
          data,
        });

        const paste = (M) => (ctx, prevent) =>
          M.applyPaste(
            {
              target: ctx.el,
              currentTarget: ctx.el,
              clipboardData: { getData: () => data },
              preventDefault: prevent,
            },
            o
          );
        const flags = { readOnly: ro && s0 % 5 === 0 };
        cmp('applyPaste', run(paste(A), value, s, e, flags), run(paste(B), value, s, e, flags), {
          ...ex,
          data,
          flags,
        });

        const fallback = (M) => (ctx) => M.applyInputFallback(ctx.el, it, focused, fv, o);
        cmp('applyInputFallback', run(fallback(A), value, s, e), run(fallback(B), value, s, e), {
          ...ex,
          it,
          focused,
          previous: fv,
        });

        const blur = (M) => (ctx) => M.applyBlur(ctx.el, o);
        cmp('applyBlur', run(blur(A), value, s, e), run(blur(B), value, s, e), ex);

        const keydown = (M) => (ctx) =>
          M.handleOnKeyDownNumoraInput({ key, target: ctx.el, currentTarget: ctx.el }, o);
        cmp(
          'handleOnKeyDownNumoraInput',
          run(keydown(A), value, s, e),
          run(keydown(B), value, s, e),
          { ...ex, key }
        );

        // Focus strip: keyboard focus, then a mouse sequence (mousedown -> focus -> click -> blur).
        const strip = (M) => (ctx) => {
          let strips = 0;
          const detach = M.attachFocusStrip(
            ctx.el,
            () => o,
            () => strips++
          );
          const fire = (type, ev = {}) => {
            for (const fn of ctx.listeners[type] ?? []) fn({ type, target: ctx.el, ...ev });
          };
          const seq = focused
            ? [['focus']]
            : [['mousedown', { button: ro ? 2 : 0 }], ['focus'], ['click'], ['blur']];
          for (const [type, ev] of seq) fire(type, ev);
          detach();
          const left = Object.values(ctx.listeners).reduce((n, l) => n + l.length, 0);
          return { strips, left };
        };
        cmp('attachFocusStrip', run(strip(A), value, s, e), run(strip(B), value, s, e), {
          ...ex,
          focused,
          ro,
        });
      }
      return true;
    }
  ),
  { numRuns: runs, seed }
);

// Option validation: same accept/reject decision and same message.
fc.assert(
  fc.property(
    fc.record({
      decimalMaxLength: fc.constantFrom(undefined, 0, 2, -1, 1.5, '2'),
      decimalMinLength: fc.constantFrom(undefined, 0, 3, -1),
      formatOn: fc.constantFrom(undefined, 'blur', 'change', 'never'),
      thousandSeparator: fc.constantFrom(undefined, '', ',', '.', 'k', '1', ',,', '-', 5),
      groupingStyle: fc.constantFrom(undefined, 'thousand', 'lakh', 'wan', 'none', 'x'),
      decimalSeparator: fc.constantFrom(undefined, '.', ',', '', 'e', '9', '..'),
      enableNegative: fc.constantFrom(undefined, true, false, 'yes'),
      enableCompactNotation: fc.constantFrom(undefined, true, 1),
      maxLength: fc.constantFrom(undefined, 1, 10, 0, -2, 2.5),
      isAllowed: fc.constantFrom(undefined, 'fn'),
      onChange: fc.constantFrom(undefined, 7),
    }),
    (o) => {
      cmp(
        'validateNumoraInputOptions',
        safe(() => A.validateNumoraInputOptions(o)),
        safe(() => B.validateNumoraInputOptions(o)),
        { o }
      );
      return true;
    }
  ),
  { numRuns: Math.min(runs, 20000), seed }
);

const keys = Object.keys(diffs);
if (removed.length)
  console.log(`REMOVED FROM CANDIDATE (public API change): ${removed.join(', ')}`);
console.log(
  keys.length ? `DIFFS in: ${keys.map((k) => `${k} (${counts[k]})`).join(', ')}` : 'NO DIFFS'
);
for (const k of keys) console.log(k, JSON.stringify(diffs[k]).slice(0, 2000));
process.exit(keys.length ? 1 : 0);
