// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { NumoraInput, getSeparatorsFromLocale } from '../src/index';

describe('SSR', () => {
  it('controlled value is formatted into the server HTML', () => {
    const html = renderToString(<NumoraInput value="1234.5" onChange={() => {}} />);
    expect(html).toContain('value="1,234.5"');
  });
  it('defaultValue is formatted into the server HTML', () => {
    expect(renderToString(<NumoraInput defaultValue="1234.5" />)).toContain('value="1,234.5"');
  });
  it('renders with no value', () => {
    expect(renderToString(<NumoraInput />)).toContain('value=""');
  });
  it('locale={true} on the server warns once in development; an explicit tag never does', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderToString(<NumoraInput locale="de-DE" defaultValue="1234.5" />);
    expect(warn).not.toHaveBeenCalled();
    renderToString(<NumoraInput locale defaultValue="1234.5" />);
    renderToString(<NumoraInput locale defaultValue="1234.5" />);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringMatching(/locale=\{true\} was rendered on the server/));
    warn.mockRestore();
  });
});

describe('re-exports', () => {
  it('getSeparatorsFromLocale comes from numora-react too', () => {
    expect(getSeparatorsFromLocale('de-DE')).toMatchObject({ thousandSeparator: '.', decimalSeparator: ',' });
  });
});
