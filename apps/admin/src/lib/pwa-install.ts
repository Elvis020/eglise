import { browser } from '$app/environment';
import { derived, get, writable } from 'svelte/store';

type InstallOutcome = 'accepted' | 'dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallOutcome }>;
};

const deferredPrompt = writable<BeforeInstallPromptEvent | null>(null);
const installed = writable(false);
const appleMobile = writable(false);

export const pwaInstall = derived(
  [deferredPrompt, installed, appleMobile],
  ([$deferredPrompt, $installed, $appleMobile]) => ({
    kind: $installed
      ? 'unavailable'
      : $deferredPrompt
        ? 'prompt'
        : $appleMobile
          ? 'ios'
          : 'unavailable',
    isInstalled: $installed
  })
);

let stopListening: (() => void) | undefined;

function isStandalone(): boolean {
  if (!browser) return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isAppleMobileDevice(): boolean {
  if (!browser) return false;

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

export function initialisePwaInstall(): void {
  if (!browser || stopListening) return;

  const displayMode = window.matchMedia('(display-mode: standalone)');
  const updateInstallState = () => installed.set(isStandalone());
  const captureInstallPrompt = (event: Event) => {
    event.preventDefault();
    deferredPrompt.set(event as BeforeInstallPromptEvent);
  };
  const completeInstallation = () => {
    installed.set(true);
    deferredPrompt.set(null);
  };

  appleMobile.set(isAppleMobileDevice());
  updateInstallState();
  window.addEventListener('beforeinstallprompt', captureInstallPrompt);
  window.addEventListener('appinstalled', completeInstallation);
  displayMode.addEventListener('change', updateInstallState);

  stopListening = () => {
    window.removeEventListener('beforeinstallprompt', captureInstallPrompt);
    window.removeEventListener('appinstalled', completeInstallation);
    displayMode.removeEventListener('change', updateInstallState);
    stopListening = undefined;
  };
}

export async function requestPwaInstall(): Promise<InstallOutcome | 'unavailable'> {
  const installPrompt = get(deferredPrompt);

  if (!installPrompt) return 'unavailable';

  deferredPrompt.set(null);
  await installPrompt.prompt();

  return (await installPrompt.userChoice).outcome;
}
