export function Hero() {
  return (
    <>
      {/* <p
        className="
          animate-fade-in-out text-center opacity-0 absolute top-14 sm:top-1/12
          left-1/2 -translate-x-1/2 text-lg text-muted-foreground
          tracking-wide
        "
      >
        Stop reinventing the wheel.
      </p>

      <p
        className="
          animate-fade-in-out delay-[1.2s] text-center opacity-0 absolute top-14 sm:top-1/12
          left-1/2 -translate-x-1/2 text-lg text-muted-foreground
          tracking-wide
        "
      >
        just use...
      </p> */}
      <div
        className="
          absolute top-14 sm:top-1/12 left-1/2 -translate-x-1/2
          animate-fade-in opacity-0
        "
      >
        <h1
          className="
            font-numora text-5xl text-white
            drop-shadow-[0_0_30px_rgba(167,139,250,0.4)]
          "
        >
          numora.
        </h1>
        <div
          className="
            h-[2px] w-0 mx-auto mt-1
            bg-gradient-to-r from-transparent via-secondary to-transparent
            animate-[expand_0.6s_ease-out_3s_forwards]
          "
        />
      </div>
      <p
        className="
          text-center animate-fade-in opacity-0
          text-muted-foreground max-w-lg leading-relaxed
        "
      >
        Numeric inputs are broken. <strong className="font-numora text-foreground">numora</strong> fixes them.
      </p>
    </>
  );
}

export function ScrollIndicator({ target = '#tamper-proof-section' }: { target?: string } = {}) {
  return (
    <div
      className="
        absolute bottom-8 left-1/2 -translate-x-1/2
        delay-[4s] animate-fade-in opacity-0
      "
    >
      <a
        href={target}
        className="
          flex flex-col items-center gap-2
          text-muted-foreground hover:text-foreground
          transition-colors duration-300
          group
        "
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <svg
          className="
            w-5 h-5
            animate-[bounce_1.5s_ease-in-out_infinite]
            group-hover:text-secondary
            transition-colors duration-300
          "
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </a>
    </div>
  );
}
