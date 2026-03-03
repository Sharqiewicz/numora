import { createFileRoute } from '@tanstack/react-router';
import LightRays from '@/components/LightRays';
import { Socials } from '@/components/socials';
import { SwapPlayground } from '@/components/SwapPlayground';

export const Route = createFileRoute('/swap')({
  component: SwapPage,
});

function SwapPage() {
  return (
    <div className="min-h-screen animated-gradient-bg relative overflow-x-hidden">
      <LightRays />
      <Socials className="bg-gray-900/60 border border-gray-900 rounded-full px-8 py-2 animate-fade-in delay-[1s] opacity-0 fixed z-90 bottom-2 left-1/2 -translate-x-1/2 sm:top-4 sm:right-8 sm:translate-x-0 sm:bottom-auto sm:left-auto z-[8]" />

      <main className="flex justify-center items-center flex-col z-[5] relative pt-24 pb-16">
        <SwapPlayground />
      </main>

      <footer className="mt-8 text-sm text-center pb-16">
        &copy; {new Date().getFullYear()} Numora. Built with{' '}
        <span className="text-secondary">❤</span> by{' '}
        <a
          href="https://x.com/sharqiewicz"
          target="_blank"
          rel="noopener noreferrer"
          className="font-numora text-secondary"
        >
          Kacper Szarkiewicz
        </a>
        .
      </footer>
    </div>
  );
}
