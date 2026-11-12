import type { CSSProperties } from 'react';
import github from '@/assets/github.svg';
import x from '@/assets/x.svg';
import { cn } from '@/lib/utils';

const linkClass =
  "relative rounded-md outline-hidden ring-ring after:absolute after:-inset-2.5 after:content-[''] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const imgClass =
  'block h-6 w-6 cursor-pointer transition-transform duration-150 ease-out-expo active:scale-[0.96] [@media(hover:hover)]:hover:scale-105';

export function Socials({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={cn('flex gap-6', className)} style={style}>
      <a
        href="https://x.com/sharqiewicz"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Numora on X"
        className={linkClass}
      >
        <img src={x} alt="" className={imgClass} />
      </a>
      <a
        href="https://github.com/sharqiewicz/numora"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Numora on GitHub"
        className={linkClass}
      >
        <img src={github} alt="" className={imgClass} />
      </a>
    </div>
  );
}
