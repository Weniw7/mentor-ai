export type PersonaName = 'emprendedor' | 'fitness' | 'estudio' | 'dieta';
export type EnergyLevel = 'low' | 'med' | 'high';

export type PersonaDef = {
  tone: 'directo' | 'energico' | 'calmo' | 'disciplinado';
  blurb: string;
  defaultGoal: string;
  defaultWake: string;
  defaultSleep: string;
  defaultPreferredHours: { start: string; end: string }[];
  defaultEnergyByHour: Array<{ hour: number; level: EnergyLevel }>;
};

function buildEnergyMap(ranges: Array<{ start: number; end: number; level: EnergyLevel }>): Array<{ hour: number; level: EnergyLevel }> {
  const out: Array<{ hour: number; level: EnergyLevel }> = [];
  for (let h = 0; h < 24; h++) {
    let lvl: EnergyLevel = 'med';
    for (const r of ranges) {
      if (h >= r.start && h <= r.end) {
        lvl = r.level;
      }
    }
    out.push({ hour: h, level: lvl });
  }
  return out;
}

export const PERSONA_DEFS: Record<PersonaName, PersonaDef> = {
  emprendedor: {
    tone: 'directo',
    blurb: 'Agilidad para construir y vender. Sin ruido.',
    defaultGoal: 'Cerrar 1 cliente nuevo/semana',
    defaultWake: '06:30',
    defaultSleep: '22:30',
    defaultPreferredHours: [
      { start: '08:30', end: '12:30' },
      { start: '15:00', end: '18:30' },
    ],
    defaultEnergyByHour: buildEnergyMap([
      { start: 6, end: 8, level: 'med' },
      { start: 9, end: 12, level: 'high' },
      { start: 13, end: 15, level: 'med' },
      { start: 16, end: 19, level: 'high' },
      { start: 20, end: 23, level: 'low' },
    ]),
  },
  fitness: {
    tone: 'energico',
    blurb: 'Constancia y recuperación. Movimiento inteligente.',
    defaultGoal: 'Entrenar 4x/semana y mejorar marcas',
    defaultWake: '07:00',
    defaultSleep: '23:00',
    defaultPreferredHours: [
      { start: '07:30', end: '09:00' },
      { start: '18:00', end: '20:00' },
    ],
    defaultEnergyByHour: buildEnergyMap([
      { start: 6, end: 9, level: 'high' },
      { start: 10, end: 16, level: 'med' },
      { start: 17, end: 20, level: 'high' },
      { start: 21, end: 23, level: 'low' },
    ]),
  },
  estudio: {
    tone: 'calmo',
    blurb: 'Profundidad, foco y descansos activos.',
    defaultGoal: '2h de estudio profundo al día',
    defaultWake: '07:30',
    defaultSleep: '23:30',
    defaultPreferredHours: [
      { start: '09:00', end: '12:00' },
      { start: '16:00', end: '19:00' },
    ],
    defaultEnergyByHour: buildEnergyMap([
      { start: 7, end: 10, level: 'high' },
      { start: 11, end: 15, level: 'med' },
      { start: 16, end: 19, level: 'high' },
      { start: 20, end: 23, level: 'low' },
    ]),
  },
  dieta: {
    tone: 'disciplinado',
    blurb: 'Hábitos sostenibles. Pasos pequeños, diario.',
    defaultGoal: 'Cumplir plan semanal sin atracones',
    defaultWake: '08:00',
    defaultSleep: '23:30',
    defaultPreferredHours: [
      { start: '09:00', end: '11:00' },
      { start: '17:00', end: '19:00' },
    ],
    defaultEnergyByHour: buildEnergyMap([
      { start: 8, end: 11, level: 'high' },
      { start: 12, end: 16, level: 'med' },
      { start: 17, end: 19, level: 'high' },
      { start: 20, end: 23, level: 'low' },
    ]),
  },
};