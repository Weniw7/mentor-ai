export const QUOTES: string[] = [
  'Hoy es un buen día para empezar.',
  'Pequeños pasos crean grandes cambios.',
  'Tu enfoque es tu superpoder.',
  'Sigue, aunque sea lento, pero sigue.',
  'La disciplina vence a la motivación.',
  'Hecho es mejor que perfecto.',
  'Cada minuto cuenta, haz que valga.',
  'Empieza por lo pequeño, gana impulso.',
  'Tú controlas tu siguiente acción.',
  'Una cosa a la vez, bien hecha.',
  'Con constancia, todo llega.',
  'Respira, prioriza y avanza.',
  'Un poco hoy, mucho mañana.',
  'Tu futuro yo te lo agradecerá.',
  'La claridad llega al actuar.',
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function getQuoteForDate(dateStr: string): string {
  const index = hashString(dateStr) % QUOTES.length;
  return QUOTES[index];
}