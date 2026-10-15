import type { Page } from '@playwright/test';

/**
 * Install a minimal React DevTools hook that counts, per component name, the
 * renders in each commit — and, separately, the mounts.
 *
 * A function component rendered in a commit when its fiber both is new since
 * the previous commit and carries the PerformedWork flag. Either test alone is
 * wrong: a subtree React skips entirely keeps its old fibers, flags and all, and
 * a fiber cloned only to bail out is new but has its flags reset. A fiber with
 * no alternate has never been committed before: that render is a mount.
 *
 * Read from the page as `window.__renders`, `window.__mounts` (both name →
 * count, reset by assigning `{}`) and `window.__lastRenderAt` (name → time).
 */
export async function installRenderCounter(page: Page) {
  await page.addInitScript(() => {
    const PERFORMED_WORK = 1;
    const w = window as any;
    w.__renders = {} as Record<string, number>;
    w.__mounts = {} as Record<string, number>;
    w.__lastRenderAt = {} as Record<string, number>;
    let prevSeen = new Set<object>();
    const nameOf = (type: any): string | undefined => {
      if (typeof type === 'function') return type.displayName || type.name;
      // memo / forwardRef wrappers: Mantine names its components on the wrapper
      // ("@mantine/core/Radio") and leaves the inner render function anonymous.
      if (type && typeof type === 'object') return type.displayName || nameOf(type.type ?? type.render);
      return undefined;
    };
    w.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      supportsFiber: true,
      renderers: new Map(),
      inject: () => 1,
      checkDCE: () => {},
      onScheduleFiberRoot: () => {},
      onCommitFiberUnmount: () => {},
      onPostCommitFiberRoot: () => {},
      setStrictMode: () => {},
      onCommitFiberRoot: (_id: number, root: any) => {
        const seen = new Set<object>();
        const stack = [root.current];
        while (stack.length) {
          const fiber = stack.pop();
          if (!fiber) continue;
          seen.add(fiber);
          const name = nameOf(fiber.type);
          if (name && !prevSeen.has(fiber) && (fiber.flags & PERFORMED_WORK)) {
            w.__renders[name] = (w.__renders[name] ?? 0) + 1;
            w.__lastRenderAt[name] = performance.now();
            if (!fiber.alternate) w.__mounts[name] = (w.__mounts[name] ?? 0) + 1;
          }
          if (fiber.sibling) stack.push(fiber.sibling);
          if (fiber.child) stack.push(fiber.child);
        }
        prevSeen = seen;
      },
    };
  });
}

/** Resolve once no component has rendered for `quietMs`. */
export async function waitForReactQuiet(page: Page, quietMs = 1500) {
  await page.waitForFunction((quiet) => {
    const times = Object.values((window as any).__lastRenderAt as Record<string, number>);
    const last = times.length ? Math.max(...times) : 0;
    return performance.now() - last > quiet;
  }, quietMs, { timeout: 30000, polling: 250 });
}

/**
 * Resolve once start-up is over: the anonymous session exists, and the work it
 * sets off — the document load, the chat's guest state — has rendered and gone
 * quiet. Nothing on screen says so on its own: the guest note paints before
 * auth answers, so seeing it proves nothing about what is still to come.
 */
export async function waitForStartup(page: Page) {
  await page.waitForFunction(() => {
    const auth = (window as any).__test?.firebaseAuth;
    return !!auth?.getAuth().currentUser;
  }, undefined, { timeout: 30000, polling: 100 });
  await waitForReactQuiet(page);
}
