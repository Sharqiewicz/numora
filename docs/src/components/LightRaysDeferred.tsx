import { Suspense, lazy, useEffect, useState } from 'react';

const LightRays = lazy(() => import('@/components/LightRays'));

/**
 * Defers the decorative WebGL LightRays background until after first paint and
 * code-splits the `ogl` dependency into a separate chunk (via React.lazy) so it
 * stays off the route's critical rendering path. It renders nothing on the
 * server and on the first client frame — matching SSR output, so there's no
 * hydration mismatch — then mounts post-paint. Purely cosmetic, so the brief
 * delay has no UX cost while it keeps WebGL init and the ogl bundle from
 * blocking FCP/LCP on the homepage and /explore.
 */
export default function LightRaysDeferred() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);

  if (!show) return null;

  return (
    <Suspense fallback={null}>
      <LightRays />
    </Suspense>
  );
}
