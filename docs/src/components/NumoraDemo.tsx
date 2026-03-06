import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FormatOn, ThousandStyle } from 'numora';
import { NumoraInput } from 'numora-react';
import { type CSSProperties, useEffect, useRef, useState } from 'react';

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
  videoLabel?: string;
}

const SLIDES: Slide[] = [
  {
    id: 'scientific',
    category: 'prevents',
    label: 'Scientific Notation',
    demoValue: '10000000000000000000000000000000000',
    description: 'Keeps large numbers in decimal - no 1e+21 surprises',
    video: '/videos/scientific-notation.mp4',
    videoLabel: 'scientific notation bug',
  },
  {
    id: 'cursor',
    category: 'prevents',
    label: 'Cursor Jumping',
    demoValue: '1234567.89',
    description: 'Cursor stays where you type - never jumps randomly.',
    video: '/videos/cursor-jump.mp4',
    videoLabel: 'cursor jump',
  },
  {
    id: 'paste',
    category: 'prevents',
    label: 'Paste Sanitization',
    demoValue: '',
    description: 'Dirty copy-paste values are cleaned automatically.',
    video: '/videos/paste.mp4',
    videoLabel: 'unhandled paste',
  },
  {
    id: 'thousands',
    category: 'features',
    label: 'Thousand Format',
    demoValue: '12345',
    description: 'Format on every keystroke or on blur - your choice',
    video: '/videos/format.mp4',
    videoLabel: 'format on change or on blur',
  },
  {
    id: 'compact',
    category: 'features',
    label: 'Compact Notation',
    demoValue: '1',
    description: 'Type 1k, 1.5m or 2b - compact notation expands automatically',
    video: '/videos/compact.mp4',
    videoLabel: 'compact notation',
  },
  {
    id: 'regional',
    category: 'features',
    label: 'Regional Grouping',
    demoValue: '12345678',
    description: 'Indian Lakh (12,34,567) and CJK Wan (1,2345,6789) groupings',
  },
  {
    id: 'locale',
    category: 'features',
    label: 'Locale Auto-Detection',
    demoValue: '1234567.89',
    description: 'Separators auto-resolved via Intl.NumberFormat',
  },

];

const inputClass =
  'w-full bg-transparent text-xl font-mono text-white placeholder-[#383c41] focus:outline-none text-right py-3 tracking-wide';

export function NumoraDemo({ style }: { style?: CSSProperties } = {}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const slide = SLIDES[activeSlide];

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying) return;
    if (slide.video && videoDuration === null) return; // wait for video metadata

    const duration = slide.video ? videoDuration! : SLIDE_DURATION;

    timerRef.current = setTimeout(() => {
      setVideoDuration(null);
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeSlide, isPlaying, videoDuration]);

  // Typing animation
  useEffect(() => {
    if (!inputRef.current) return;

    if (typingRef.current) clearInterval(typingRef.current);

    const input = inputRef.current;
    const currentSlide = SLIDES[activeSlide];

    // Use the native setter to bypass React's internal value tracking so the
    // controlled NumoraInput's onChange handler actually fires on synthetic events.
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    const setInputValue = (value: string) => {
      nativeSetter?.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    };

    let clearTimer: ReturnType<typeof setTimeout>;
    let pasteTimer: ReturnType<typeof setTimeout>;

    clearTimer = setTimeout(() => {
      if (!input) return;
      setInputValue('');

      if (currentSlide.isPaste) {
        pasteTimer = setTimeout(() => {
          setInputValue(currentSlide.demoValue);
        }, 200);
      } else {
        const sequence = currentSlide.typingSequence ?? currentSlide.demoValue.split('');
        let rawValue = '';
        let i = 0;
        typingRef.current = setInterval(() => {
          const char = sequence[i];
          rawValue = char === '\b' ? rawValue.slice(0, -1) : rawValue + char;
          setInputValue(rawValue);
          i++;
          if (i >= sequence.length) {
            if (typingRef.current) clearInterval(typingRef.current);
          }
        }, TYPING_DELAY);
      }
    }, CLEAR_DELAY);

    return () => {
      clearTimeout(clearTimer);
      clearTimeout(pasteTimer);
      if (typingRef.current) clearInterval(typingRef.current);
    };
  }, [activeSlide]);

  const handleSlideClick = (index: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVideoDuration(null);
    setActiveSlide(index);
    setIsPlaying(true);
  };

  const hasVideo = !!slide.video;

  return (
    <div className="pt-4 pb-8 w-full max-w-lg mx-auto animate-fade-in opacity-0" style={style}>
      <div className="space-y-3">

        <div className="rounded-2xl border border-[#23272b] bg-[#181a1b] overflow-hidden px-4 py-0">
          <NumoraInput
            ref={inputRef}
            locale={slide.id === "locale" ? true : undefined}
            thousandSeparator={slide.id === "locale" ? undefined : ","}
            thousandStyle={slide.id === 'regional' ? ThousandStyle.Lakh : ThousandStyle.Thousand}
            formatOn={FormatOn.Change}
            maxDecimals={2}
            enableCompactNotation
            placeholder="0.00"
            className={inputClass}
          />
        </div>

        {(() => {
          const progressDuration = slide.video ? videoDuration : SLIDE_DURATION;
          return (
            <div className="relative h-px bg-[#23272b] overflow-hidden rounded-full">
              <div
                key={`${activeSlide}-${isPlaying}-${progressDuration}`}
                className={`h-px bg-secondary/60 ${isPlaying && progressDuration !== null ? '' : 'hidden'}`}
                style={{
                  width: '0',
                  animation:
                    isPlaying && progressDuration !== null
                      ? `expand ${progressDuration}ms linear forwards`
                      : 'none',
                }}
              />
            </div>
          );
        })()}

        <div
          className={`transition-opacity transition-[max-height] duration-300 overflow-hidden ${
            hasVideo ? 'opacity-100 h-52 sm:h-72 rounded-lg' : 'opacity-0 max-h-0'
          }`}
        >
          {slide.video ? (
            <video
              key={slide.id}
              autoPlay
              loop
              muted
              playsInline
              onLoadedMetadata={(e) => setVideoDuration(Math.round(e.currentTarget.duration * 1000))}
              className="w-full sm:w-auto mx-auto sm:h-full"
            >
              <source src={slide.video} type="video/mp4" />
            </video>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#23272b] bg-[#181a1b] px-4 py-6 text-center">
              <span className="text-xs text-muted-foreground/40">{slide.videoLabel}</span>
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          {SLIDES.map((s, index) => {
            const isActive = index === activeSlide;
            return (
              <motion.button
                key={s.id}
                layout
                transition={{ layout: { duration: 0.22, ease: [0.215, 0.61, 0.355, 1] } }}
                onClick={() => handleSlideClick(index)}
                className={`relative w-full text-left rounded-xl px-3 py-2.5 cursor-pointer ${
                  !isActive ? 'hover:bg-[#1e2124]' : ''
                }`}
              >
                {/* Sliding active background */}
                {isActive && (
                  <motion.div
                    layoutId="slide-active-bg"
                    className="absolute inset-0 rounded-xl bg-[#23272b] z-[3]"
                    transition={{ duration: 0.22, ease: [0.215, 0.61, 0.355, 1] }}
                  />
                )}

                <div className="relative flex items-center gap-2 z-[5]">
                  <span className="relative w-3 h-3.5 shrink-0 flex items-center justify-center">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={isActive ? 'active' : 'inactive'}
                        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.15, ease: [0.215, 0.61, 0.355, 1] }}
                        className={`absolute text-xs leading-none ${
                          isActive ? 'text-secondary' : 'text-muted-foreground/30'
                        }`}
                      >
                        {isActive ? '▶' : '○'}
                      </motion.span>
                    </AnimatePresence>
                  </span>

                  <p
                    className={`text-sm  z-[5] flex-1 ${isActive ? 'text-white' : 'text-muted-foreground/60'}`}
                  >
                    {s.label}
                  </p>
                  <div
                    className={`text-xs px-1.5 py-0.5  z-[5] rounded-full ${
                      s.category === 'prevents'
                        ? 'text-yellow-400/70 bg-yellow-400/10'
                        : 'text-secondary/70 bg-secondary/10'
                    }`}
                  >
                    {s.category}
                  </div>
                </div>


                <AnimatePresence mode="popLayout" initial={false}>
                  {isActive && (
                    <motion.p
                      key="description"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? {} : { opacity: 0, y: -4 }}
                      transition={{ duration: 0.18, ease: [0.215, 0.61, 0.355, 1] }}
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

        <div className="flex items-center justify-center gap-3 pt-1">
          <div className="flex items-center gap-1.5">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => handleSlideClick(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`rounded-full transition-all cursor-pointer ${
                  index === activeSlide
                    ? 'w-2 h-2 bg-secondary/80'
                    : 'w-1.5 h-1.5 bg-[#23272b] hover:bg-[#383c41]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setIsPlaying((prev) => !prev)}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-8 h-8 rounded-full border border-[#2d3136] bg-[#1e2124] flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground/90 hover:border-[#383c41] hover:bg-[#23272b] transition-colors cursor-pointer"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isPlaying ? 'pause' : 'play'}
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.15, ease: [0.215, 0.61, 0.355, 1] }}
                className="leading-none select-none flex items-center justify-center"
              >
                {isPlaying ? (

                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                    <rect x="1" y="1" width="3" height="8" rx="0.5" />
                    <rect x="6" y="1" width="3" height="8" rx="0.5" />
                  </svg>
                ) : ( <div className="ml-0.5">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                    <path d="M2 1.5 L9 5 L2 8.5 Z" />
                  </svg>
                  </div>
                )}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>
    </div>
  );
}
