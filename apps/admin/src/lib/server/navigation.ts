export function safeNextPath(value: string | null): string {
  const hasControlCharacter = Array.from(value ?? '').some((character) => {
    const code = character.charCodeAt(0);

    return code < 32 || code === 127;
  });

  if (!value || value.includes('\\') || hasControlCharacter) {
    return '/people';
  }

  const origin = 'https://eglise.invalid';
  let destination: URL;

  try {
    destination = new URL(value, origin);
  } catch {
    return '/people';
  }

  if (
    destination.origin !== origin ||
    !destination.pathname.startsWith('/') ||
    destination.pathname.startsWith('//')
  ) {
    return '/people';
  }

  return `${destination.pathname}${destination.search}${destination.hash}`;
}
