import type { ReactNode } from 'react';

// Presents the app as a centered mobile column on a neutral backdrop — the way
// the product actually runs — rather than stretching across a desktop page.
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg md:bg-app">
      <div className="relative flex min-h-dvh min-w-0 w-full flex-col bg-app">
        {children}
      </div>
    </div>
  );
}
