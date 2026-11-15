export function Hero() {
  return (
    <>
      <section className="not-prose mb-6">
        <h1 className="text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.02em]">
          How a numeric input works
        </h1>
      </section>
      <p className="mb-16">
        Numora is a plain text input with event listeners on it. When the user types or deletes,
        Numora steps in before the browser applies the edit. It works out the value the edit would
        produce, cleans it, formats it and writes it back with the cursor in the right place. Your
        code gets two strings: the raw value and the formatted value. The sections below go through
        that in order.
      </p>
    </>
  );
}
