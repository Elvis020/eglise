export function createInviteToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));

  return btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

export async function hashInviteToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));

  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, '0')).join(
    ''
  );
}

function encodeBase64Url(value: Uint8Array): string {
  return btoa(String.fromCharCode(...value))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

function decodeBase64Url(value: string): Uint8Array {
  const padded =
    value.replaceAll('-', '+').replaceAll('_', '/') + '==='.slice((value.length + 3) % 4);
  const decoded = atob(padded);

  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

async function inviteEncryptionKey(secret: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));

  return crypto.subtle.importKey('raw', keyMaterial, { name: 'AES-GCM' }, false, [
    'decrypt',
    'encrypt'
  ]);
}

export async function encryptInviteToken(token: string, secret: string): Promise<string> {
  const initializationVector = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { iv: initializationVector, name: 'AES-GCM' },
    await inviteEncryptionKey(secret),
    new TextEncoder().encode(token)
  );
  const ciphertext = new Uint8Array(encrypted);
  const encryptedValue = new Uint8Array(initializationVector.length + ciphertext.length);

  encryptedValue.set(initializationVector);
  encryptedValue.set(ciphertext, initializationVector.length);

  return encodeBase64Url(encryptedValue);
}

export async function decryptInviteToken(ciphertext: string, secret: string): Promise<string> {
  const encryptedValue = decodeBase64Url(ciphertext);
  const initializationVector = encryptedValue.slice(0, 12);
  const encryptedToken = encryptedValue.slice(12);
  const decrypted = await crypto.subtle.decrypt(
    { iv: initializationVector, name: 'AES-GCM' },
    await inviteEncryptionKey(secret),
    encryptedToken
  );

  return new TextDecoder().decode(decrypted);
}

export function normaliseEmail(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function normaliseFullName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}
