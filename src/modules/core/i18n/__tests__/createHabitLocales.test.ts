import { es } from '../locales/es';
import { en } from '../locales/en';

describe('create habit locales', () => {
  it('keeps the Spanish locale fully in Spanish for the create-habit screen', () => {
    expect(es.new_habit.title).toBe('Nuevo hábito');
    expect(es.create_habit.sections.identity).toBe('Identidad');
    expect(es.create_habit.sections.category).toBe('Categoría');
    expect(es.create_habit.sections.frequency).toBe('Frecuencia');
    expect(es.create_habit.select_days).toBe('Seleccionar días');
    expect(es.create_habit.frequency_presets.daily).toBe('Diario');
    expect(es.create_habit.frequency_presets.mon_fri).toBe('Lun-Vie');
    expect(es.create_habit.frequency_presets.custom).toBe('Personalizado');
    expect(es.levels.seed).toBe('Semilla');
    expect(es.levels.sprout).toBe('Brote');
    expect(es.levels.tree).toBe('Árbol');
    expect(es.levels.forest).toBe('Bosque');
    expect(es.levels.ancient).toBe('Ancestral');
    expect(es.profile.level_chip).toBe('Nivel {{level}}');
  });

  it('keeps the English locale aligned with the Stitch-style wording', () => {
    expect(en.new_habit.title).toBe('New habit');
    expect(en.create_habit.sections.identity).toBe('Identity');
    expect(en.create_habit.sections.category).toBe('Category');
    expect(en.create_habit.sections.frequency).toBe('Frequency');
    expect(en.create_habit.select_days).toBe('Select days');
    expect(en.profile.level_chip).toBe('{{level}} Level');
  });
});
