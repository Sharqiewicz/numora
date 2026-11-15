import { Pause, Play } from 'lucide-react';
import { useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

// A screen recording of the caret jump in a shipped app, cropped to the amount field. It is proof,
// not explanation (CursorLanes explains). Nothing is downloaded until it scrolls into view.

const SRC = '/videos/cursor-jump-input.mp4';
const POSTER = '/videos/cursor-jump-input.jpg';
/** The crop's pixel size, so the box is reserved before the file arrives. */
const SIZE = { width: 944, height: 236 };

export function CursorJumpRecording() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion() ?? false;
  const inView = useInView(videoRef, { amount: 0.6 });
  const [playing, setPlaying] = useState(false);
  // A reader who pressed pause keeps it paused when the clip scrolls back in.
  const userPaused = useRef(false);

  const play = () => {
    videoRef.current?.play().catch(() => {});
  };
  const pause = () => videoRef.current?.pause();

  // Plays while on screen, stops off screen. Under reduced motion the reader presses play.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !reduced && !userPaused.current) video.play().catch(() => {});
    else video.pause();
  }, [inView, reduced]);

  const toggle = () => {
    userPaused.current = playing;
    if (playing) pause();
    else play();
  };

  return (
    <figure className="not-prose my-8">
      <div className="overflow-hidden rounded-xl border border-border bg-black">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={POSTER}
          width={SIZE.width}
          height={SIZE.height}
          aria-label="Screen recording of an amount field without Numora. The caret jumps to the end after each deletion."
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="block h-auto w-full"
        >
          <source src={SRC} type="video/mp4" />
        </video>
      </div>
      <div className="mt-3 flex items-start gap-3">
        <figcaption className="min-w-0 flex-1 text-caption leading-relaxed text-pretty text-muted-foreground">
          The caret is put inside the number and one digit is deleted. Each time, the caret lands at
          the end.
        </figcaption>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause recording' : 'Play recording'}
          // 32px button, 44px hit area. Same control as the figures' pause button.
          className="relative inline-flex size-8 flex-none cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,scale] duration-150 ease-out-expo before:absolute before:-inset-1.5 hover:bg-surface-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] motion-reduce:transition-none"
        >
          {playing ? (
            <Pause className="size-4" aria-hidden />
          ) : (
            <Play className="size-4" aria-hidden />
          )}
        </button>
      </div>
    </figure>
  );
}
