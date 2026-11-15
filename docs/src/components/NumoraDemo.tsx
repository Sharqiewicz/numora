import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { NumoraInput } from 'numora-react';
import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

const SLIDE_DURATION = 4000;
const TYPING_DELAY = 80;
const CLEAR_DELAY = 300;

type Category = 'features' | 'prevents';

interface Slide {
  id: string;
  category: Category;
  label: string;
  demoValue: string;
  description: string;
  isPaste?: boolean;
  typingSequence?: string[];
  video?: string;
  /** Accessible name of the recording. */
  videoLabel?: string;
  /** Says whose input the recording shows, so the clip reads as a before or an after. */
  videoCaption?: string;
  /** Shown in the media box on slides without a recording. */
  samples?: { value: string; note: string }[];
}

const SLIDES: Slide[] = [
  {
    id: 'scientific',
    category: 'prevents',
    label: 'Scientific notation',
    demoValue: '10000000000000000000000000000000000',
    description: 'Keeps large numbers in decimal, so 1e+21 never shows up.',
    video: '/videos/scientific-notation.mp4',
    videoLabel: 'Screen recording of an input without Numora showing scientific notation',
    videoCaption: 'Without Numora',
  },
  {
    id: 'cursor',
    category: 'prevents',
    label: 'Cursor jumping',
    demoValue: '1234567.89',
    description: 'The cursor stays where you put it.',
    video: '/videos/cursor-jump.mp4',
    videoLabel: 'Screen recording of an input without Numora where the cursor jumps',
    videoCaption: 'Without Numora',
  },
  {
    id: 'paste',
    category: 'prevents',
    label: 'Paste sanitization',
    demoValue: '$1,234.56 USD',
    isPaste: true,
    description: 'Numora strips symbols and text from pasted values.',
    video: '/videos/paste.mp4',
    videoLabel: 'Screen recording of an input without Numora accepting an unsanitized paste',
    videoCaption: 'Without Numora',
  },
  {
    id: 'thousands',
    category: 'features',
    label: 'Thousand format',
    demoValue: '12345',
    description: 'Format on every keystroke or on blur.',
    video: '/videos/format.mp4',
    videoLabel: 'Screen recording of a Numora input formatting on change and on blur',
    videoCaption: 'With Numora',
  },
  {
    id: 'compact',
    category: 'features',
    label: 'Compact notation',
    demoValue: '1',
    typingSequence: ['1', '.', '5', 'm'],
    description: 'Type 1k, 1.5m or 2b and Numora expands it.',
    video: '/videos/compact.mp4',
    videoLabel: 'Screen recording of a Numora input expanding compact notation',
    videoCaption: 'With Numora',
  },
  {
    id: 'regional',
    category: 'features',
    label: 'Regional grouping',
    demoValue: '12345678',
    description: 'Lakh (Indian, 12,34,567) and Wan (East Asian, 1,2345,6789) groupings.',
    samples: [
      { value: '12,345,678', note: 'thousand' },
      { value: '1,23,45,678', note: 'lakh' },
      { value: '1234,5678', note: 'wan' },
    ],
  },
  {
    id: 'locale',
    category: 'features',
    label: 'Locale auto-detection',
    demoValue: '1234567.89',
    description: 'Numora reads the separators from Intl.NumberFormat.',
    video: '/videos/locale.mp4',
    videoLabel:
      'Screen recording of a Numora input switching between en-US, de-DE and de-CH separators',
    videoCaption: 'With Numora',
  },
  {
    id: 'torph',
    category: 'features',
    label: 'Animated digits',
    demoValue: '1234567.89',
    description: 'Pair Numora with Torph to animate each digit as you type.',
    video: '/videos/torph.mp4',
    videoLabel: 'Screen recording of a Numora input with Torph animating each digit as it is typed',
    videoCaption: 'With Numora and Torph',
  },
];

const CATEGORY_LABELS: Record<Category, string> = {
  features: 'Feature',
  prevents: 'Fixes',
};

const inputClass =
  'w-full bg-transparent text-xl font-mono text-white placeholder-surface-6 focus:outline-none text-right py-3 tracking-wide';

const ICON_HIDDEN = { opacity: 0, scale: 0.25, filter: 'blur(4px)' };
const ICON_SHOWN = { opacity: 1, scale: 1, filter: 'blur(0px)' };

export function NumoraDemo({ style }: { style?: CSSProperties } = {}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [failedVideoId, setFailedVideoId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  // Time spent on a slide that has no recording to act as its clock.
  const elapsedRef = useRef(0);
  const cancelTypingRef = useRef<(() => void) | null>(null);
  // Once the reader has played, paused or typed, their choice outranks the motion preference.
  const userChoseRef = useRef(false);
  const shouldReduceMotion = useReducedMotion();
  const reduceMotionRef = useRef(shouldReduceMotion);
  reduceMotionRef.current = shouldReduceMotion;

  const slide = SLIDES[activeSlide];
  // The recording is the clock on its slide: progress reads its currentTime and the
  // slide advances when it ends. Slides without one (or whose file failed) run a timer.
  const usesVideoClock = !!slide.video && failedVideoId !== slide.id;

  const advance = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  // Reduced motion: start paused, on the first slide's poster.
  useEffect(() => {
    if (shouldReduceMotion && !userChoseRef.current) setIsPlaying(false);
  }, [shouldReduceMotion]);

  // New slide: progress starts from zero.
  // biome-ignore lint/correctness/useExhaustiveDependencies: resets on every slide change
  useEffect(() => {
    elapsedRef.current = 0;
    if (barRef.current) barRef.current.style.transform = 'scaleX(0)';
  }, [activeSlide]);

  // Play and pause reach the recording itself.
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new slide mounts a new <video>
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const autoplayBlocked = shouldReduceMotion && !userChoseRef.current;
    if (isPlaying && !autoplayBlocked) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, activeSlide, usesVideoClock, shouldReduceMotion]);

  // Progress bar and auto-advance. Pausing stops the loop and leaves the bar where it is.
  // biome-ignore lint/correctness/useExhaustiveDependencies: restarts for each slide
  useEffect(() => {
    if (!isPlaying) return;

    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      // A backgrounded tab stops rAF; don't count the time away as time on the slide.
      const dt = Math.min(now - last, 100);
      last = now;

      let progress = 0;
      if (usesVideoClock) {
        const video = videoRef.current;
        if (video && video.duration > 0) progress = video.currentTime / video.duration;
      } else {
        elapsedRef.current += dt;
        progress = elapsedRef.current / SLIDE_DURATION;
        if (progress >= 1) {
          advance();
          return;
        }
      }

      if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(progress, 1)})`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, activeSlide, usesVideoClock, advance]);

  // Typing animation
  useEffect(() => {
    if (!inputRef.current) return;

    const input = inputRef.current;
    const currentSlide = SLIDES[activeSlide];

    // Use the native setter to bypass React's internal value tracking so the
    // uncontrolled NumoraInput's onChange handler fires on synthetic events.
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    // Simulate a single character typed by the user. Dispatches the real
    // beforeinput → (input) sequence so Numora's formatting code path is exercised.
    const preserveScroll = (fn: () => void) => {
      const { scrollX, scrollY } = window;
      fn();
      window.scrollTo(scrollX, scrollY);
    };

    const simulateChar = (char: string) => {
      preserveScroll(() => {
        // Ensure cursor is at the end before each simulated keypress.
        input.setSelectionRange(input.value.length, input.value.length);

        const beforeInput = new InputEvent('beforeinput', {
          bubbles: true,
          cancelable: true,
          inputType: 'insertText',
          data: char,
        });
        input.dispatchEvent(beforeInput);
        if (!beforeInput.defaultPrevented) {
          nativeSetter?.call(input, input.value + char);
          input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
        }
      });
    };

    // Clear the input programmatically (not via beforeinput - just reset).
    const clearInput = () => {
      nativeSetter?.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };

    let pasteTimer: ReturnType<typeof setTimeout> | undefined;
    let typingTimer: ReturnType<typeof setInterval> | undefined;

    const clearTimer = setTimeout(() => {
      clearInput();

      if (currentSlide.isPaste) {
        pasteTimer = setTimeout(() => {
          // Paste path: set value directly (paste handler is separate).
          nativeSetter?.call(input, currentSlide.demoValue);
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }, 200);
        return;
      }

      const sequence = currentSlide.typingSequence ?? currentSlide.demoValue.split('');

      // Reduced motion: show the result without the keystroke-by-keystroke animation.
      if (reduceMotionRef.current) {
        for (const char of sequence) simulateChar(char);
        return;
      }

      let i = 0;
      typingTimer = setInterval(() => {
        simulateChar(sequence[i]);
        i++;
        if (i >= sequence.length) clearInterval(typingTimer);
      }, TYPING_DELAY);
    }, CLEAR_DELAY);

    const cancel = () => {
      clearTimeout(clearTimer);
      clearTimeout(pasteTimer);
      clearInterval(typingTimer);
    };
    cancelTypingRef.current = cancel;

    return cancel;
  }, [activeSlide]);

  // Picking a slide shows it. It doesn't restart autoplay for a reader who paused.
  const handleSlideClick = (index: number) => {
    setActiveSlide(index);
  };

  const handleTogglePlay = () => {
    userChoseRef.current = true;
    setIsPlaying((prev) => !prev);
  };

  // The reader is using the input: stop typing over them and stop changing slides.
  const handleReaderInput = () => {
    userChoseRef.current = true;
    cancelTypingRef.current?.();
    setIsPlaying(false);
  };

  return (
    <div className="pt-4 pb-8 w-full max-w-lg mx-auto animate-fade-in opacity-0" style={style}>
      <div className="space-y-3">
        <div className="rounded-2xl border border-surface-3 bg-surface-1 overflow-hidden px-4 py-0 transition-[border-color] duration-150 ease-out has-[input:focus-visible]:border-secondary">
          <NumoraInput
            ref={inputRef}
            locale={slide.id === 'locale' ? true : undefined}
            thousandSeparator={slide.id === 'locale' ? undefined : ','}
            groupingStyle={slide.id === 'regional' ? 'lakh' : 'thousand'}
            formatOn="change"
            decimalMaxLength={2}
            allowCompactNotation
            placeholder="0.00"
            aria-label="Numora demo input"
            onPointerDown={handleReaderInput}
            onKeyDown={handleReaderInput}
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-surface-3">
            <div
              ref={barRef}
              className="h-full origin-left bg-secondary/60"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>

          <button
            type="button"
            onClick={handleTogglePlay}
            aria-label={isPlaying ? 'Pause demo' : 'Play demo'}
            className="relative size-8 shrink-0 rounded-full border border-surface-4 bg-surface-2 flex items-center justify-center text-muted-foreground/70 hover:text-muted-foreground hover:border-surface-6 hover:bg-surface-3 transition-[color,background-color,border-color,scale] duration-150 ease-out active:scale-[0.96] cursor-pointer after:absolute after:top-1/2 after:left-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={isPlaying ? 'pause' : 'play'}
                initial={shouldReduceMotion ? { opacity: 0 } : ICON_HIDDEN}
                animate={ICON_SHOWN}
                exit={shouldReduceMotion ? { opacity: 0 } : ICON_HIDDEN}
                transition={{ type: 'spring', duration: 0.2, bounce: 0 }}
                className="leading-none select-none flex items-center justify-center"
              >
                {isPlaying ? (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <rect x="1" y="1" width="3" height="8" rx="0.5" />
                    <rect x="6" y="1" width="3" height="8" rx="0.5" />
                  </svg>
                ) : (
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="currentColor"
                    aria-hidden="true"
                    className="ml-0.5"
                  >
                    <path d="M2 1.5 L9 5 L2 8.5 Z" />
                  </svg>
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        {/* The media box keeps one size on every slide, so nothing below it moves. */}
        <div className="relative aspect-video overflow-hidden rounded-2xl border border-surface-3 bg-surface-1">
          {usesVideoClock && slide.video ? (
            <video
              key={slide.id}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              poster={slide.video.replace(/\.mp4$/, '.jpg')}
              aria-label={slide.videoLabel}
              onEnded={advance}
              onError={() => setFailedVideoId(slide.id)}
              className="size-full object-cover"
            >
              <source src={slide.video} type="video/mp4" />
            </video>
          ) : (
            slide.samples && (
              <dl className="flex size-full flex-col items-center justify-center gap-2 sm:gap-3">
                {slide.samples.map((sample) => (
                  <div key={sample.note} className="flex w-56 items-baseline justify-between gap-4">
                    <dt className="text-xs text-muted-foreground">{sample.note}</dt>
                    <dd className="font-mono text-base tabular-nums text-white sm:text-lg">
                      {sample.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )
          )}

          {usesVideoClock && slide.videoCaption && (
            <span
              className={`absolute left-2 top-2 rounded-full bg-surface-1/90 px-2 py-0.5 text-xs ${
                slide.category === 'prevents' ? 'text-signal-amber' : 'text-secondary'
              }`}
            >
              {slide.videoCaption}
            </span>
          )}
        </div>

        <div className="space-y-0.5">
          {SLIDES.map((s, index) => {
            const isActive = index === activeSlide;
            return (
              <motion.button
                key={s.id}
                type="button"
                layout
                whileTap={{ scale: 0.96 }}
                transition={{ layout: { type: 'spring', duration: 0.3, bounce: 0 } }}
                onClick={() => handleSlideClick(index)}
                aria-current={isActive ? 'true' : undefined}
                className={`relative w-full text-left rounded-lg px-3 py-2.5 cursor-pointer ${
                  !isActive ? 'hover:bg-surface-2' : ''
                }`}
              >
                {/* Sliding active background */}
                {isActive && (
                  <motion.div
                    layoutId="slide-active-bg"
                    className="absolute inset-0 rounded-lg bg-surface-3 z-[3]"
                    transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                  />
                )}

                <div className="relative flex items-center gap-2 z-[5]">
                  <span
                    aria-hidden="true"
                    className="w-3 h-3.5 shrink-0 flex items-center justify-center"
                  >
                    <span
                      className={`size-1.5 rounded-full transition-[background-color] duration-150 ease-out ${
                        isActive ? 'bg-secondary' : 'bg-muted-foreground/30'
                      }`}
                    />
                  </span>

                  <p
                    className={`text-sm  z-[5] flex-1 ${isActive ? 'text-white' : 'text-muted-foreground/60'}`}
                  >
                    {s.label}
                  </p>
                  <div
                    className={`text-xs px-1.5 py-0.5  z-[5] rounded-full ${
                      s.category === 'prevents'
                        ? 'text-signal-amber/70 bg-signal-amber/10'
                        : 'text-secondary/70 bg-secondary/10'
                    }`}
                  >
                    {CATEGORY_LABELS[s.category]}
                  </div>
                </div>

                <AnimatePresence mode="popLayout" initial={false}>
                  {isActive && (
                    <motion.p
                      key="description"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                      transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                      className="relative text-xs text-muted-foreground/60 mt-1 pl-5 z-[5]"
                    >
                      {s.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
