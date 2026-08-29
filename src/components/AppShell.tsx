import type { ReactNode } from 'react';

// Presents the app as a centered mobile column on a neutral backdrop — the way
// the product actually runs — rather than stretching across a desktop page.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center bg-bg">
      <div className="relative flex min-h-dvh w-full max-w-[460px] flex-col bg-app sm:border-x sm:border-line">
        {children}
      </div>
    </div>
  );
}
