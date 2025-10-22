// Mapeo de días de la semana
export const dayMap: Record<string, number> = {
  'L': 1,   // Lunes
  'M': 2,   // Martes
  'Mi': 3,  // Miércoles
  'J': 4,   // Jueves
  'V': 5,   // Viernes
  'S': 6,   // Sábado
  'D': 0,   // Domingo (0 en JS Date.getDay())
};

export const dayNames: Record<string, string> = {
  'L': 'Lunes',
  'M': 'Martes',
  'Mi': 'Miércoles',
  'J': 'Jueves',
  'V': 'Viernes',
  'S': 'Sábado',
  'D': 'Domingo',
};

export const dayNamesShort: Record<number, string> = {
  1: 'L',    // Lunes
  2: 'M',    // Martes
  3: 'Mi',   // Miércoles
  4: 'J',    // Jueves
  5: 'V',    // Viernes
  6: 'S',    // Sábado
  0: 'D',    // Domingo
};

export const dayNumberToName: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
  0: 'Domingo',
  7: 'Domingo', // Por si acaso se usa 7 en lugar de 0
};

// Convierte número de día del plan (1-7) a nombre de día
export function planDayToName(dayNum: number): string {
  // El plan usa 1=lunes, 2=martes, ..., 7=domingo
  const mapping: Record<number, string> = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
  };
  return mapping[dayNum] || `Día ${dayNum}`;
}

// Convierte número de día del plan (1-7) a código corto (L, M, Mi, etc.)
export function planDayToShort(dayNum: number): string {
  const mapping: Record<number, string> = {
    1: 'L',
    2: 'M',
    3: 'Mi',
    4: 'J',
    5: 'V',
    6: 'S',
    7: 'D',
  };
  return mapping[dayNum] || `${dayNum}`;
}

// Obtiene el nombre del día desde una fecha
export function getDateDayName(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dayOfWeek = d.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
  return dayNumberToName[dayOfWeek] || 'Desconocido';
}

// Obtiene el código corto del día desde una fecha
export function getDateDayShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dayOfWeek = d.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
  return dayNamesShort[dayOfWeek] || '?';
}
