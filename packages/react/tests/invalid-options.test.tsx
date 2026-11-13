import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NumoraInput } from '../src/index';

const field = () => screen.getByTestId('i') as HTMLInputElement;

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('invalid options (ADR 0014)', () => {
  it('development: throws during render', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<NumoraInput data-testid="i" thousandSeparator="!!" />)).toThrow(
      /thousandSeparator/
    );
  });

  it('development: throws when a mounted field gets invalid options', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(<NumoraInput data-testid="i" defaultValue="1234567" />);
    expect(() =>
      rerender(<NumoraInput data-testid="i" defaultValue="1234567" thousandSeparator="!!" />)
    ).toThrow(/thousandSeparator/);
  });

  it('production: a first render with invalid options logs and uses the defaults', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<NumoraInput data-testid="i" defaultValue="1234567.5" thousandSeparator="!!" />);
    expect(field().value).toBe('1,234,567.5');
    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0][0])).toMatch(/thousandSeparator/);
  });

  it('production: a mounted field keeps its last valid options', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(<NumoraInput data-testid="i" defaultValue="1234567.5" locale="de-DE" />);
    expect(field().value).toBe('1.234.567,5');
    rerender(
      <NumoraInput data-testid="i" defaultValue="1234567.5" locale="de-DE" decimalMaxLength={2} decimalMinLength={5} />
    );
    expect(field().value).toBe('1.234.567,5');
    expect(error).toHaveBeenCalledTimes(1);
    expect(String(error.mock.calls[0][0])).toMatch(/decimalMinLength/);
  });

  it('production: valid options after an invalid render apply again', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { rerender } = render(<NumoraInput data-testid="i" defaultValue="1234567.5" />);
    rerender(<NumoraInput data-testid="i" defaultValue="1234567.5" thousandSeparator="!!" />);
    expect(field().value).toBe('1,234,567.5');
    rerender(<NumoraInput data-testid="i" defaultValue="1234567.5" locale="de-DE" />);
    expect(field().value).toBe('1.234.567,5');
  });
});
