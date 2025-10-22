/**
 * Calculadora de Macros basada en la fórmula de Mifflin-St Jeor
 * 
 * Calcula automáticamente las calorías y macronutrientes diarios necesarios
 * según el perfil del usuario y sus objetivos
 */

export interface UserProfileData {
  gender: string; // "masculino" o "femenino"
  age: number;
  weight: number; // en kg
  height: number; // en cm
  availableDays: number; // días de entrenamiento por semana
  fitnessLevel: string; // "principiante", "intermedio", "avanzado"
  fitnessGoal: string; // "bajar_grasa", "ganar_masa", "mantener_peso", "rendimiento"
}

export interface MacrosResult {
  dailyCalories: number;
  protein: number; // gramos
  fat: number; // gramos
  carbs: number; // gramos
  tmb: number; // para referencia
  tdee: number; // para referencia
  activityFactor: number; // para referencia
}

/**
 * Determina el factor de actividad basado en días de entrenamiento y nivel
 */
function getActivityFactor(availableDays: number, fitnessLevel: string): number {
  // Mapeo de días de entrenamiento a nivel de actividad base
  let baseFactor = 1.2; // Sedentario por defecto
  
  if (availableDays === 0) {
    baseFactor = 1.2; // Sedentario
  } else if (availableDays <= 2) {
    baseFactor = 1.375; // Actividad ligera
  } else if (availableDays <= 4) {
    baseFactor = 1.55; // Actividad moderada
  } else if (availableDays <= 6) {
    baseFactor = 1.725; // Actividad intensa
  } else {
    baseFactor = 1.9; // Actividad muy intensa
  }
  
  // Ajuste según nivel de fitness (más avanzado = más intensidad)
  if (fitnessLevel === "avanzado" && baseFactor < 1.9) {
    baseFactor += 0.05; // Pequeño incremento para usuarios avanzados
  } else if (fitnessLevel === "principiante" && baseFactor > 1.375) {
    baseFactor -= 0.05; // Pequeña reducción para principiantes
  }
  
  return baseFactor;
}

/**
 * Calcula la Tasa Metabólica Basal (TMB) usando Mifflin-St Jeor
 */
function calculateTMB(gender: string, age: number, weight: number, height: number): number {
  let tmb: number;
  
  if (gender === "masculino") {
    // Hombres: (10 x Peso en kg) + (6.25 x Altura en cm) - (5 x Edad en años) + 5
    tmb = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    // Mujeres: (10 x Peso en kg) + (6.25 x Altura en cm) - (5 x Edad en años) - 161
    tmb = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  
  return Math.round(tmb);
}

/**
 * Calcula el Gasto Energético Diario Total (TDEE)
 */
function calculateTDEE(tmb: number, activityFactor: number): number {
  return Math.round(tmb * activityFactor);
}

/**
 * Ajusta las calorías según el objetivo del usuario
 */
function adjustCaloriesForGoal(tdee: number, goal: string): number {
  let adjustedCalories = tdee;
  
  switch (goal) {
    case "bajar_grasa":
    case "bajar_peso":
      // Déficit del 20%
      adjustedCalories = Math.round(tdee * 0.8);
      break;
    case "ganar_masa":
    case "aumentar_masa":
      // Superávit del 10%
      adjustedCalories = Math.round(tdee * 1.1);
      break;
    case "mantener_peso":
    case "rendimiento":
      // Mantenimiento (sin cambio)
      adjustedCalories = tdee;
      break;
    default:
      // Por defecto, mantenimiento
      adjustedCalories = tdee;
  }
  
  return adjustedCalories;
}

/**
 * Distribuye las calorías en macronutrientes
 */
function distributeMacros(targetCalories: number, weight: number): {
  protein: number;
  fat: number;
  carbs: number;
} {
  // PASO 1: Calcular Proteína (prioridad #1)
  // 2.0 g por kg de peso corporal
  const proteinGrams = Math.round(weight * 2.0);
  const proteinCalories = proteinGrams * 4; // 4 kcal por gramo
  
  // PASO 2: Calcular Grasa (prioridad #2)
  // 25% de las calorías totales
  const fatCalories = Math.round(targetCalories * 0.25);
  const fatGrams = Math.round(fatCalories / 9); // 9 kcal por gramo
  
  // PASO 3: Calcular Carbohidratos (relleno con calorías restantes)
  const carbCalories = targetCalories - proteinCalories - fatCalories;
  const carbGrams = Math.round(carbCalories / 4); // 4 kcal por gramo
  
  return {
    protein: proteinGrams,
    fat: fatGrams,
    carbs: Math.max(0, carbGrams) // Asegurar que no sea negativo
  };
}

/**
 * Función principal: Calcula todos los macros para un usuario
 */
export function calculateMacros(profile: UserProfileData): MacrosResult {
  // Paso 1: Calcular TMB
  const tmb = calculateTMB(profile.gender, profile.age, profile.weight, profile.height);
  
  // Paso 2: Determinar factor de actividad y calcular TDEE
  const activityFactor = getActivityFactor(profile.availableDays, profile.fitnessLevel);
  const tdee = calculateTDEE(tmb, activityFactor);
  
  // Paso 3: Ajustar calorías según objetivo
  const targetCalories = adjustCaloriesForGoal(tdee, profile.fitnessGoal);
  
  // Paso 4: Distribuir macronutrientes
  const macros = distributeMacros(targetCalories, profile.weight);
  
  return {
    dailyCalories: targetCalories,
    protein: macros.protein,
    fat: macros.fat,
    carbs: macros.carbs,
    tmb,
    tdee,
    activityFactor
  };
}

/**
 * Función de ayuda para validar los datos del perfil antes del cálculo
 */
export function validateProfileData(profile: Partial<UserProfileData>): boolean {
  if (!profile.gender || !profile.age || !profile.weight || !profile.height) {
    return false;
  }
  
  if (profile.age < 13 || profile.age > 120) {
    return false;
  }
  
  if (profile.weight < 30 || profile.weight > 300) {
    return false;
  }
  
  if (profile.height < 100 || profile.height > 250) {
    return false;
  }
  
  return true;
}
