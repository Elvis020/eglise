import { describe, expect, it } from 'vitest';

import { safeNextPath } from '../src/lib/server/navigation';

describe('safeNextPath', () => {
  it('preserves an internal path, query, and fragment', () => {
    expect(safeNextPath('/people?filter=member#directory')).toBe('/people?filter=member#directory');
  });

  it('rejects external, protocol-relative, and backslash redirect targets', () => {
    expect(safeNextPath('https://attacker.example')).toBe('/people');
    expect(safeNextPath('//attacker.example')).toBe('/people');
    expect(safeNextPath('/\\attacker.example')).toBe('/people');
    expect(safeNextPath('/people\u0000')).toBe('/people');
    expect(safeNextPath('http://[')).toBe('/people');
    expect(safeNextPath('/a/..//attacker.example')).toBe('/people');
    expect(safeNextPath('/.//attacker.example')).toBe('/people');
    expect(safeNextPath('/%2e//attacker.example')).toBe('/people');
  });
});
