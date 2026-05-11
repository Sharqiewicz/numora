import { createFileRoute } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';
import LightRays from '@/components/LightRays';

export const Route = createFileRoute('/presentation-2')({
  head: () => ({
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: Presentation2,
});

const ease = [0.215, 0.61, 0.355, 1] as const;

function Presentation2() {
  const reduced = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 28, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.7, ease, delay: reduced ? 0 : delay },
  });

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center bg-black">
      <LightRays
        raysColor="#a78bfa"
        lightSpread={1.2}
        rayLength={3}
        raysSpeed={0.5}
        pulsating
        fadeDistance={1.4}
        mouseInfluence={0.06}
        followMouse
      />

      <main className="relative z-10 flex flex-col items-center text-center px-6 gap-0">


        {/* Brand name */}
        <motion.h1
          {...fadeUp(0.0)}
          className="font-numora text-white leading-none select-none"
          style={{ fontSize: '80px', order: -1 }}
          aria-label="Numora is the new Numeric Input Standard"
        >
          <span className="drop-shadow-[0_0_60px_oklch(0.694_0.131_276.5_/_0.55)]">
            numora.
          </span>
        </motion.h1>

        {/* "Numeric Input Standard." */}
        <motion.p
          {...fadeUp(0.25)}
          className="font-satoshi font-semibold text-white leading-tight mt-4"
          style={{ fontSize: 'clamp(0.9rem, 2.5vw, 2rem)' }}
        >
          the{' '}
          <span className="text-secondary drop-shadow-[0_0_30px_oklch(0.694_0.131_276.5_/_0.5)]">
            numeric input
          </span>{' '}
          standard.
        </motion.p>

        {/* Divider */}
        <motion.div
          className="mt-8 h-px w-32 bg-gradient-to-r from-transparent via-secondary/50 to-transparent"
          initial={reduced ? false : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.65, ease, delay: reduced ? 0 : 0.5 }}
          style={{ transformOrigin: 'center' }}
        />

        {/* URL */}
        <motion.p
          {...fadeUp(0.6)}
          className="mt-6 font-satoshi tracking-widest text-muted-foreground text-2xl sm:text-4xl uppercase select-none"
        >
          numeric-input.com
        </motion.p>
      </main>
    </div>
  );
}
