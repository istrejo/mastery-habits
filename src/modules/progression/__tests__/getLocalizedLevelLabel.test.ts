import { getLocalizedLevelLabel } from '../utils/getLocalizedLevelLabel';

describe('getLocalizedLevelLabel', () => {
  const t = (key: string) => {
    const translations: Record<string, string> = {
      'levels.seed': 'Semilla',
      'levels.sprout': 'Brote',
      'levels.tree': 'Árbol',
      'levels.forest': 'Bosque',
      'levels.ancient': 'Ancestral',
    };

    return translations[key] ?? key;
  };

  it('returns the translated label for each mastery level key', () => {
    expect(getLocalizedLevelLabel('seed', t)).toBe('Semilla');
    expect(getLocalizedLevelLabel('sprout', t)).toBe('Brote');
    expect(getLocalizedLevelLabel('tree', t)).toBe('Árbol');
    expect(getLocalizedLevelLabel('forest', t)).toBe('Bosque');
    expect(getLocalizedLevelLabel('ancient', t)).toBe('Ancestral');
  });
});
