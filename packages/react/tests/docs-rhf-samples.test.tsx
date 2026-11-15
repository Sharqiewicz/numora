import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentType } from 'react';
import { useForm } from 'react-hook-form';
import ts from 'typescript';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { NumoraInput } from '../src/index';
import { typeText } from './locale-matrix';

/**
 * Runs the code samples of the React Hook Form docs page, read from the page source itself.
 * When a test here fails, a sample on the page no longer works (or no longer compiles): fix
 * the sample, or the library if the sample is right. A sample added to the page fails the
 * count below until it gets a test.
 */

const PAGE = resolve(
  __dirname,
  '../../../docs/src/routes/docs/numora-react/integrations/react-hook-form.tsx'
);
// Generated modules, one per sample. Git-ignored; rewritten only when a sample changes.
const OUT = resolve(__dirname, '.docs-samples');

/** Every `{`...`}` code sample in the page, with the template-literal escapes resolved. */
function readSamples(): string[] {
  const source = readFileSync(PAGE, 'utf8');
  return [...source.matchAll(/\{`((?:\\[\s\S]|[^`\\])*)`\}/g)].map((m) =>
    // The samples escape `, ${ and \ for the surrounding template literal.
    m[1].replace(/\\([\s\S])/g, '$1')
  );
}

const samples = readSamples();
const pick = (marker: string) => {
  const found = samples.filter((s) => s.includes(marker));
  if (found.length !== 1) throw new Error(`expected one docs sample with "${marker}", found ${found.length}`);
  return found[0];
};
// The samples import the published package; here they run against the source.
const local = (code: string) => code.replaceAll("'numora-react'", "'../../src/index'");

const FILES: Record<string, string> = {
  'basic.tsx': `${local(pick('function Form()'))}\nexport { Form }\n`,
  'swap.tsx': `${local(pick('function SwapForm()'))}\nexport { SwapForm, halve }\n`,
  'wrapper.tsx': `${local(pick('function AmountField'))}\nexport { AmountField }\n`,
  // The validation sample is a bare <Controller>: it needs a form around it.
  'validation.tsx': `import { useForm, Controller } from 'react-hook-form'
import { NumoraInput } from '../../src/index'
export function ValidationForm() {
  const { control, handleSubmit } = useForm({ defaultValues: { amount: '' } })
  return (
    <form onSubmit={handleSubmit(() => {})}>
${pick("validate: (value)")}
      <button type="submit">Submit</button>
    </form>
  )
}
`,
};

type Loaded = {
  Form: ComponentType;
  SwapForm: ComponentType;
  halve: (amount: string, decimals?: number) => string;
  // biome-ignore lint/suspicious/noExplicitAny: the sample's generic props are checked by the typecheck test below.
  AmountField: ComponentType<any>;
  ValidationForm: ComponentType;
};
const m = {} as Loaded;

beforeAll(async () => {
  mkdirSync(OUT, { recursive: true });
  for (const [name, code] of Object.entries(FILES)) {
    const file = resolve(OUT, name);
    let current = '';
    try {
      current = readFileSync(file, 'utf8');
    } catch {}
    if (current !== code) writeFileSync(file, code);
    Object.assign(m, await import(/* @vite-ignore */ file));
  }
});

afterEach(() => {
  vi.restoreAllMocks();
});

const box = () => screen.getByRole('textbox') as HTMLInputElement;
const click = async (name: string) => {
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name }));
  });
};

describe('React Hook Form docs page: code samples', () => {
  it('has the four samples tested here and no others', () => {
    expect(samples).toHaveLength(4);
  });

  it('every sample compiles under strict TypeScript', () => {
    const program = ts.createProgram(
      Object.keys(FILES).map((name) => resolve(OUT, name)),
      {
        noEmit: true,
        strict: true,
        skipLibCheck: true,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
        types: [],
      }
    );
    const errors = ts
      .getPreEmitDiagnostics(program)
      .map((d) => `${d.file?.fileName}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
    expect(errors).toEqual([]);
  }, 60_000);

  describe('Controller pattern (basic form)', () => {
    it('stores the raw value, forwards name, and submits it', async () => {
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});
      render(<m.Form />);
      const el = box();
      expect(el.name).toBe('amount');
      act(() => el.focus());
      typeText(el, '1234.567');
      // decimalMaxLength={2}
      expect(el.value).toBe('1,234.56');
      await click('Submit');
      expect(log).toHaveBeenLastCalledWith({ amount: '1234.56' });
    });

    it('setValue() updates the input', async () => {
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});
      render(<m.Form />);
      await click('Set to 1000');
      expect(box().value).toBe('1,000');
      await click('Submit');
      expect(log).toHaveBeenLastCalledWith({ amount: '1000' });
    });
  });

  describe('Validation errors', () => {
    it('required: shows the message and focuses the field', async () => {
      render(<m.ValidationForm />);
      await click('Submit');
      expect(screen.getByText('Amount is required')).toBeTruthy();
      expect(document.activeElement).toBe(box());
    });

    it.each(['0', '0.5', '0.99'])('validate rejects %s', async (typed) => {
      render(<m.ValidationForm />);
      act(() => box().focus());
      typeText(box(), typed);
      await click('Submit');
      expect(screen.getByText('Must be at least 1')).toBeTruthy();
    });

    it.each(['1', '12.5', '1000000'])('validate accepts %s', async (typed) => {
      render(<m.ValidationForm />);
      act(() => box().focus());
      typeText(box(), typed);
      await click('Submit');
      expect(screen.queryByText(/Must be at least 1|Amount is required/)).toBeNull();
    });

    it('the error clears once the value is valid', async () => {
      render(<m.ValidationForm />);
      await click('Submit');
      await act(async () => {
        typeText(box(), '5');
      });
      expect(screen.queryByText('Amount is required')).toBeNull();
    });
  });

  describe('Reusable field (useController wrapper)', () => {
    type Values = { amount: string };
    function mount(extra: Record<string, unknown> = {}, amount = '', onSubmit = (_: Values) => {}) {
      let form!: ReturnType<typeof useForm<Values>>;
      function Host() {
        form = useForm<Values>({ defaultValues: { amount } });
        return (
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* The usage line under the sample. */}
            <m.AmountField
              name="amount"
              control={form.control}
              rules={{ required: 'Amount is required' }}
              locale="de-DE"
              {...extra}
            />
            <button type="submit">Submit</button>
          </form>
        );
      }
      render(<Host />);
      return () => form;
    }

    it('the usage line under the sample is the one tested here', () => {
      expect(pick('function AmountField')).toContain(
        `// <AmountField name="amount" control={control} rules={{ required: 'Amount is required' }} locale="de-DE" />`
      );
    });

    it('passes NumoraInput props through and stores the raw value', async () => {
      const form = mount();
      const el = box();
      act(() => el.focus());
      await act(async () => {
        typeText(el, '1234,5');
      });
      expect(el.value).toBe('1.234,5');
      expect(form().getValues('amount')).toBe('1234.5');
      act(() => form().setValue('amount', '9876543.21'));
      expect(el.value).toBe('9.876.543,21');
    });

    it('disabled reaches React Hook Form: the field is disabled and left out of the data', async () => {
      const onSubmit = vi.fn();
      mount({ disabled: true }, '5', onSubmit);
      expect(box().disabled).toBe(true);
      await click('Submit');
      expect(onSubmit.mock.calls[0][0]).toEqual({ amount: undefined });
    });

    // The props type takes no controller prop the wrapper does not hand to useController:
    // one that fell through to NumoraInput would land on the <input>.
    it('takes only the controller props it forwards', () => {
      const sample = pick('function AmountField');
      expect(sample).toContain("'name' | 'control' | 'rules' | 'disabled'");
      expect(sample).toContain('useController({ name, control, rules, disabled })');
    });

    it('shows the error with role="alert" and aria-invalid, and clears both', async () => {
      mount();
      const el = box();
      expect(el.getAttribute('aria-invalid')).toBe('false');
      await click('Submit');
      expect(screen.getByRole('alert').textContent).toBe('Amount is required');
      expect(el.getAttribute('aria-invalid')).toBe('true');
      expect(document.activeElement).toBe(el);
      await act(async () => {
        typeText(el, '7');
      });
      expect(screen.queryByRole('alert')).toBeNull();
      expect(el.getAttribute('aria-invalid')).toBe('false');
    });
  });

  describe('Complete example (Max / Half)', () => {
    it('required error, Max, Half and submit', async () => {
      const log = vi.spyOn(console, 'log').mockImplementation(() => {});
      render(<m.SwapForm />);
      const el = box();
      expect(el.name).toBe('amount');
      expect(el.placeholder).toBe('0.0');
      await click('Submit');
      expect(screen.getByText('Amount is required')).toBeTruthy();
      expect(log).not.toHaveBeenCalled();
      await click('Max');
      expect(el.value).toBe('1,000,000');
      await click('Half');
      expect(el.value).toBe('500,000');
      await click('Submit');
      expect(log).toHaveBeenLastCalledWith({ amount: '500000' });
    });

    it('Half works on a typed amount, down to the sixth decimal', async () => {
      render(<m.SwapForm />);
      const el = box();
      act(() => el.focus());
      typeText(el, '0.000003');
      await click('Half');
      expect(el.value).toBe('0.000001');
      await click('Half');
      expect(el.value).toBe('0');
    });

    it('Half on an empty field gives 0', async () => {
      render(<m.SwapForm />);
      await click('Half');
      expect(box().value).toBe('0');
    });

    it.each([
      ['3', '1.5'],
      ['1000000', '500000'],
      ['100', '50'],
      ['0.000001', '0'],
      ['0.000003', '0.000001'],
      ['', '0'],
      ['0', '0'],
      ['1.', '0.5'],
      ['.5', '0.25'],
      // Beyond Number.MAX_SAFE_INTEGER: the reason the sample uses bigint.
      ['123456789012345678901234567890.5', '61728394506172839450617283945.25'],
    ])('halve(%j) is %j', (amount, half) => {
      expect(m.halve(amount)).toBe(half);
    });
  });
});

describe('React Hook Form docs page: claims in prose', () => {
  type Values = { amount: string };

  // "Tip": e.target.value is the raw value, e.target.formattedValue the display value.
  it('onChange carries the raw value and the display value', () => {
    const seen: [string, string][] = [];
    render(
      <NumoraInput
        locale="de-DE"
        onChange={(e) => seen.push([e.target.value, e.target.formattedValue])}
      />
    );
    act(() => box().focus());
    typeText(box(), '1000,50');
    expect(seen.at(-1)).toEqual(['1000.50', '1.000,50']);
  });

  // "Validation errors": min / max convert the value to a JavaScript number.
  it('the `min` rule compares as a float, so it cannot tell two long amounts apart', async () => {
    let form!: ReturnType<typeof useForm<Values>>;
    function Host() {
      form = useForm<Values>({ defaultValues: { amount: '' } });
      form.register('amount', { min: '9007199254740993' });
      return null;
    }
    render(<Host />);
    // One below the minimum, yet valid: both are the same float.
    act(() => form.setValue('amount', '9007199254740992'));
    let valid = false;
    await act(async () => {
      valid = await form.trigger('amount');
    });
    expect(valid).toBe(true);
  });

  // "Why not register?": the form stores the display value, and setValue() writes straight
  // into the input, where the next edit misreads it.
  it('register() stores the display value and setValue() bypasses Numora', () => {
    let form!: ReturnType<typeof useForm<Values>>;
    function Host() {
      form = useForm<Values>({ defaultValues: { amount: '' } });
      // biome-ignore lint/suspicious/noExplicitAny: the misuse the page warns about.
      return <NumoraInput locale="de-DE" {...(form.register('amount') as any)} />;
    }
    render(<Host />);
    const el = box();
    act(() => el.focus());
    typeText(el, '1234,5');
    expect(form.getValues('amount')).toBe('1.234,5');
    act(() => form.setValue('amount', '1234.5'));
    expect(el.value).toBe('1234.5');
    typeText(el, '6');
    // 1234.5 became 123456.
    expect(el.value).toBe('123.456');
  });
});
