import { getContext, setContext } from 'svelte';

type LogoutGuard = (continueLogout: () => Promise<void>) => boolean;

type AppShellContext = {
  isLoggingOut: () => boolean;
  registerLogoutGuard: (guard: LogoutGuard) => () => void;
  requestLogout: () => void;
};

const appShellContextKey = Symbol('eglise-app-shell');

export function provideAppShellContext(context: AppShellContext): void {
  setContext(appShellContextKey, context);
}

export function useAppShellContext(): AppShellContext {
  const context = getContext<AppShellContext>(appShellContextKey);

  if (!context) {
    throw new Error('The app shell context is unavailable.');
  }

  return context;
}
