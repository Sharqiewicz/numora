import { InputGallery } from '../InputGallery'

export function UserInputSection() {
  return (
    <section className="space-y-4">
      <h2>What users actually type</h2>
      <p>
        The usual fix is <code>&lt;input type="text"&gt;</code> plus a regex like{' '}
        <code>value.replace(/[^0-9.]/g, '')</code>. It catches the obvious noise
        (letters, currency symbols) and silently corrupts everything else:
      </p>
      <InputGallery />
      <p>
        A character-class regex can't tell that <code>1.5e-7</code> is a number, that{' '}
        <code>1k</code> means <code>1000</code>, or that German <code>1.234,56</code> is
        a hundred times larger than <code>1.23456</code>. Numora's seven-step pipeline
        handles every row above - that's what's next.
      </p>
    </section>
  )
}
