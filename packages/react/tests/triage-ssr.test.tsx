// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { NumoraInput } from '../src/index';

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
});
