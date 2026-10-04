import { browser } from '$app/environment';
import { get, writable } from 'svelte/store';

export type PrototypeAdministrator = {
  email: string;
  name: string;
};

export type PrototypeSession = {
  administrator: PrototypeAdministrator | null;
  churchName: string;
  signedIn: boolean;
};

type PersistedPrototypeSession = {
  administrator: PrototypeAdministrator | null;
  churchName: string;
  signedIn: boolean;
  version: 1;
};

const storageKey = 'eglise-prototype-session-v1';

const defaultSession: PrototypeSession = {
  administrator: null,
  churchName: 'Eglise',
  signedIn: false
};

export const prototypeSession = writable<PrototypeSession>(defaultSession);

let initialised = false;

function normaliseName(name: string) {
  return name.trim().replace(/\s+/g, ' ');
}

function fallbackName(email: string) {
  const localPart = email.trim().split('@')[0] ?? '';
  const words = localPart.split(/[._-]+/).filter(Boolean);

  if (words.length === 0) {
    return 'Church administrator';
  }

  return words
    .map((word) => `${word.slice(0, 1).toLocaleUpperCase()}${word.slice(1).toLocaleLowerCase()}`)
    .join(' ');
}

function parsePersistedSession(value: string | null): PrototypeSession | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<PersistedPrototypeSession>;

    if (parsed.version !== 1 || typeof parsed.churchName !== 'string') {
      return null;
    }

    const churchName = normaliseName(parsed.churchName);
    const administrator = parsed.administrator;

    if (
      administrator !== null &&
      (typeof administrator !== 'object' ||
        typeof administrator.name !== 'string' ||
        typeof administrator.email !== 'string')
    ) {
      return null;
    }

    return {
      administrator:
        administrator === null
          ? null
          : {
              email: administrator.email.trim(),
              name: normaliseName(administrator.name)
            },
      churchName: churchName || defaultSession.churchName,
      signedIn: parsed.signedIn === true
    };
  } catch {
    return null;
  }
}

function persist(nextSession: PrototypeSession) {
  if (!browser) return false;

  const value: PersistedPrototypeSession = {
    ...nextSession,
    version: 1
  };

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));

    return true;
  } catch {
    return false;
  }
}

function updateSession(nextSession: PrototypeSession) {
  const saved = persist(nextSession);

  if (saved) {
    prototypeSession.set(nextSession);
  }

  return saved;
}

export function initialisePrototypeSession() {
  if (!browser || initialised) return true;

  initialised = true;

  try {
    const restored = parsePersistedSession(window.localStorage.getItem(storageKey));

    if (restored) {
      prototypeSession.set(restored);
    }

    return true;
  } catch {
    return false;
  }
}

export function signUpPrototypeAdministrator(administrator: PrototypeAdministrator) {
  const nextSession: PrototypeSession = {
    ...get(prototypeSession),
    administrator: {
      email: administrator.email.trim().toLocaleLowerCase(),
      name: normaliseName(administrator.name)
    },
    signedIn: true
  };

  return updateSession(nextSession);
}

export function signInPrototypeAdministrator(email: string) {
  const currentSession = get(prototypeSession);
  const normalisedEmail = email.trim().toLocaleLowerCase();
  const savedAdministrator = currentSession.administrator;
  const matchingAdministrator =
    savedAdministrator?.email.toLocaleLowerCase() === normalisedEmail ? savedAdministrator : null;

  const nextSession: PrototypeSession = {
    ...currentSession,
    administrator: matchingAdministrator ?? {
      email: normalisedEmail,
      name: fallbackName(normalisedEmail)
    },
    signedIn: true
  };

  return updateSession(nextSession);
}

export function updatePrototypeChurchName(churchName: string) {
  const normalisedChurchName = normaliseName(churchName);

  if (!normalisedChurchName) return false;

  return updateSession({
    ...get(prototypeSession),
    churchName: normalisedChurchName
  });
}

export function signOutPrototypeAdministrator() {
  return updateSession({
    ...get(prototypeSession),
    signedIn: false
  });
}

export function resetPrototypeSessionForTests() {
  initialised = false;
  prototypeSession.set(defaultSession);
}
