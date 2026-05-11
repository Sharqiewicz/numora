import { createFileRoute } from '@tanstack/react-router';
import { motion, useReducedMotion } from 'motion/react';
import LightRays from '@/components/LightRays';

export const Route = createFileRoute('/presentation')({
  head: () => ({
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
    ],
  }),
  component: Presentation,
});

const WORDS = ['Are', 'you', 'struggling', 'with', 'numeric', 'inputs?'];

function Presentation() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-black">
      <LightRays
        raysColor="#a78bfa"
        lightSpread={1.4}
        rayLength={2.5}
        raysSpeed={0.6}
        pulsating
        fadeDistance={1.2}
        mouseInfluence={0.08}
      />

      <main className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
        <h1
          className="font-satoshi font-bold tracking-tight text-white leading-[1.1]"
          style={{ fontSize: 'clamp(2.8rem, 8vw, 7rem)' }}
          aria-label="Are you struggling with numeric inputs?"
        >
          {WORDS.map((word, i) => (
            <motion.span
              key={word + i}
              className="inline-block mr-[0.25em] last:mr-0"
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, y: 32, filter: 'blur(8px)' }
              }
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 0.65,
                ease: [0.215, 0.61, 0.355, 1],
                delay: shouldReduceMotion ? 0 : 0.15 + i * 0.1,
              }}
            >
              {word === 'numeric' || word === 'inputs?' ? (
                <span className="text-secondary drop-shadow-[0_0_40px_oklch(0.694_0.131_276.5_/_0.6)]">
                  {word}
                </span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </h1>

        <motion.div
          className="mt-5 h-[2px] w-48 mx-auto bg-gradient-to-r from-transparent via-secondary to-transparent"
          initial={shouldReduceMotion ? false : { scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{
            duration: 0.7,
            ease: [0.215, 0.61, 0.355, 1],
            delay: shouldReduceMotion ? 0 : 0.9,
          }}
          style={{ transformOrigin: 'center' }}
        />

        <motion.p
          className="mt-6 text-muted-foreground text-lg sm:text-xl max-w-md [text-wrap:balance] leading-relaxed"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            ease: [0.215, 0.61, 0.355, 1],
            delay: shouldReduceMotion ? 0 : 1.0,
          }}
        >
          <span className="font-numora text-foreground">numora</span> fixes them.
        </motion.p>
      </main>
    </div>
  );
}
