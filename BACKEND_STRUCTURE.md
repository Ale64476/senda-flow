# Estructura del Backend - Sistema de Entrenamientos Automáticos

## 📋 Arquitectura General

Este documento describe la estructura completa del backend para el sistema de entrenamientos automáticos y prediseñados de la aplicación de fitness.

### Stack Tecnológico Backend
- **Lovable Cloud** (basado en Supabase)
- **PostgreSQL** (base de datos)
- **Edge Functions** (TypeScript serverless)
- **Row Level Security (RLS)** para seguridad

---

## 🗄️ Estructura de Base de Datos

### Tablas Principales

#### `exercises`
Contiene información de todos los ejercicios disponibles.
```sql
- id (text, PK)
- nombre (text)
- descripcion (text)
- grupo_muscular (text)
- nivel (text)
- tipo_entrenamiento (text)
- lugar (text)
- objetivo (text)
- series_sugeridas (int)
- repeticiones_sugeridas (int)
- duracion_promedio_segundos (int)
- calorias_por_repeticion (numeric)
- equipamiento (text)
- maquina_gym (text)
- video (text)
- imagen (text)
```

#### `predesigned_plans`
Planes de entrenamiento prediseñados por profesionales.
```sql
- id (text, PK)
- nombre_plan (text)
- descripcion_plan (text)
- objetivo (text) -- 'ganar_masa', 'perder_grasa', 'tonificar'
- nivel (text) -- 'principiante', 'intermedio', 'avanzado'
- lugar (text) -- 'casa', 'gimnasio', 'ambos'
- dias_semana (int) -- días por semana del plan
- ejercicios_ids_ordenados (jsonb)
```

#### `plan_ejercicios`
Relación entre planes y ejercicios con detalles de ejecución.
```sql
- id (uuid, PK)
- plan_id (text, FK -> predesigned_plans)
- ejercicio_id (text, FK -> exercises)
- dia (int) -- día de la semana (1-7)
- orden (int) -- orden del ejercicio en el día
```

#### `workouts`
Entrenamientos asignados a usuarios.
```sql
- id (uuid, PK)
- user_id (uuid, FK -> profiles)
- name (text)
- description (text)
- scheduled_date (date)
- location (enum: 'casa', 'gimnasio')
- duration_minutes (int)
- estimated_calories (int)
- completed (boolean)
- completed_at (timestamp)
- tipo (enum: 'automatico', 'manual')
```

#### `workout_exercises`
Ejercicios específicos de cada workout.
```sql
- id (uuid, PK)
- workout_id (uuid, FK -> workouts)
- name (text)
- sets (int)
- reps (int)
- notes (text)
- duration_minutes (int)
```

---

## 🔌 Endpoints (Edge Functions)

### 1. **POST /assign-routine**
**Archivo:** `supabase/functions/assign-routine/index.ts`

**Descripción:** Asigna automáticamente un plan prediseñado a un usuario y genera entrenamientos para la semana actual.

**Flujo:**
1. Obtiene el perfil del usuario (objetivo, nivel, días disponibles)
2. Busca planes compatibles en `predesigned_plans`
3. Calcula un score para cada plan basado en:
   - Objetivo del usuario vs objetivo del plan
   - Nivel de fitness
   - Días disponibles por semana
   - Tipo de entrenamiento (casa/gimnasio)
4. Selecciona el plan con mejor score
5. Obtiene ejercicios del plan desde `plan_ejercicios`
6. Genera entrenamientos para la semana actual en `workouts`
7. Inserta ejercicios correspondientes en `workout_exercises`

**Input:** Automático (usa datos del perfil del usuario autenticado)

**Output:**
```json
{
  "success": true,
  "routine": {
    "plan_id": "plan_001",
    "plan_name": "Tonificación Casa - Principiante",
    "workouts_created": 3,
    "workouts": [
      {
        "id": "uuid",
        "name": "Plan - Día 1",
        "date": "2025-10-22"
      }
    ]
  }
}
```

**Autenticación:** Requerida (JWT)

---

### 2. **GET /get-todays-workouts**
**Archivo:** `supabase/functions/get-todays-workouts/index.ts`

**Descripción:** Retorna todos los entrenamientos programados para el día actual.

**Query Parameters:** Ninguno

**Output:**
```json
{
  "workouts": [
    {
      "id": "uuid",
      "name": "Entrenamiento de Hoy",
      "scheduled_date": "2025-10-22",
      "location": "casa",
      "duration_minutes": 45,
      "estimated_calories": 300,
      "completed": false,
      "tipo": "automatico",
      "workout_exercises": [
        {
          "id": "uuid",
          "name": "Sentadillas",
          "sets": 3,
          "reps": 12,
          "notes": "Piernas - principiante"
        }
      ]
    }
  ]
}
```

**Autenticación:** Requerida (JWT)

---

### 3. **GET /get-all-workouts**
**Archivo:** `supabase/functions/get-all-workouts/index.ts`

**Descripción:** Retorna todos los entrenamientos del usuario (rutina completa).

**Query Parameters:**
- `include_completed` (boolean, default: true) - Incluir completados
- `tipo` (string, optional) - Filtrar por 'automatico' o 'manual'

**Output:**
```json
{
  "workouts": [...],
  "stats": {
    "total": 10,
    "completed": 5,
    "pending": 5,
    "automaticos": 8,
    "manuales": 2,
    "totalCalories": 3000,
    "totalMinutes": 450
  }
}
```

**Autenticación:** Requerida (JWT)

---

### 4. **GET /get-workouts-by-date**
**Archivo:** `supabase/functions/get-workouts-by-date/index.ts`

**Descripción:** Retorna entrenamientos para una fecha específica o rango de fechas.

**Query Parameters:**
- `date` (string, YYYY-MM-DD) - Fecha específica
- `start_date` (string, YYYY-MM-DD) - Fecha inicio de rango
- `end_date` (string, YYYY-MM-DD) - Fecha fin de rango

**Output:**
```json
{
  "workouts": [...]
}
```

**Autenticación:** Requerida (JWT)

---

### 5. **POST /complete-workout**
**Archivo:** `supabase/functions/complete-workout/index.ts`

**Descripción:** Marca un entrenamiento como completado o incompleto.

**Input:**
```json
{
  "workout_id": "uuid",
  "completed": true
}
```

**Output:**
```json
{
  "success": true,
  "workout": {
    "id": "uuid",
    "completed": true,
    "completed_at": "2025-10-22T10:30:00Z",
    ...
  }
}
```

**Autenticación:** Requerida (JWT)

---

### 6. **GET /get-predesigned-plans**
**Archivo:** `supabase/functions/get-predesigned-plans/index.ts`

**Descripción:** Lista todos los planes prediseñados disponibles.

**Query Parameters:**
- `objetivo` (string) - Filtrar por objetivo
- `nivel` (string) - Filtrar por nivel
- `lugar` (string) - Filtrar por lugar
- `dias_semana` (int) - Filtrar por días por semana

**Output:**
```json
{
  "plans": [
    {
      "id": "plan_001",
      "nombre_plan": "Tonificación Casa",
      "descripcion_plan": "Plan de tonificación para hacer en casa",
      "objetivo": "tonificar",
      "nivel": "principiante",
      "lugar": "casa",
      "dias_semana": 3,
      "total_exercises": 15
    }
  ],
  "count": 1
}
```

**Autenticación:** No requerida

---

## 🔒 Seguridad (RLS)

### Políticas de Seguridad Implementadas

#### Tabla `workouts`
```sql
-- Los usuarios solo pueden ver sus propios workouts
CREATE POLICY "Users can view own workouts"
ON workouts FOR SELECT
USING (auth.uid() = user_id);

-- Los usuarios solo pueden insertar sus propios workouts
CREATE POLICY "Users can insert own workouts"
ON workouts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden actualizar sus propios workouts
CREATE POLICY "Users can update own workouts"
ON workouts FOR UPDATE
USING (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar sus propios workouts
CREATE POLICY "Users can delete own workouts"
ON workouts FOR DELETE
USING (auth.uid() = user_id);
```

#### Tabla `workout_exercises`
Las políticas verifican que el workout asociado pertenezca al usuario.

---

## 🔄 Flujo Completo de Asignación Automática

### 1. Usuario Completa Onboarding
Cuando `profiles.onboarding_completed` cambia a `true`, se dispara un trigger:

```sql
CREATE TRIGGER on_onboarding_completed
  AFTER UPDATE ON profiles
  FOR EACH ROW
  WHEN (NEW.onboarding_completed = true AND OLD.onboarding_completed = false)
  EXECUTE FUNCTION auto_assign_routine_on_onboarding();
```

### 2. Lógica de Selección de Plan
El algoritmo de scoring en `assign-routine`:

```typescript
// Scoring de planes
let score = 0;

// 1. Objetivo (peso: 50 + 20 bonus)
if (userGoals.includes(plan.objetivo)) {
  score += 50;
  if (userGoals[0] === plan.objetivo) score += 20;
}

// 2. Nivel (peso: 30)
if (plan.nivel === profile.fitness_level) {
  score += 30;
}

// 3. Días disponibles (peso: 20)
if (profile.available_days_per_week >= plan.dias_semana) {
  score += Math.max(0, 20 - daysDiff * 3);
}

// 4. Lugar (peso: 15)
if (locationMatches) {
  score += 15;
}
```

### 3. Generación de Entrenamientos Semanales
Para cada día del plan:
1. Calcula fecha correspondiente (inicio de semana = lunes)
2. Obtiene ejercicios del plan para ese día
3. Crea workout en tabla `workouts`
4. Inserta ejercicios en `workout_exercises`
5. Calcula calorías estimadas basado en ejercicios

---

## 📱 Integración con Frontend

### React Query Hooks Disponibles

```typescript
// Hook para asignar rutina automática
const { mutate: assignRoutine } = useAssignRoutine();

// Hook para obtener entrenamientos de hoy
const { data: todaysWorkouts } = useTodaysWorkouts();

// Hook para obtener todos los entrenamientos
const { data: allWorkouts } = useAllWorkouts({
  include_completed: false,
  tipo: 'automatico'
});

// Hook para obtener entrenamientos por fecha
const { data: workoutsByDate } = useWorkoutsByDate({
  date: '2025-10-22'
});

// Hook para marcar completado
const { mutate: completeWorkout } = useCompleteWorkout();

// Hook para obtener planes prediseñados
const { data: plans } = usePredesignedPlans({
  nivel: 'principiante',
  objetivo: 'tonificar'
});
```

### Ejemplo de Uso en Componente

```typescript
// Componente de entrenamientos del día
const TodaysWorkouts = () => {
  const { data, isLoading } = useTodaysWorkouts();
  const { mutate: complete } = useCompleteWorkout();

  const handleComplete = (workoutId: string) => {
    complete({ workoutId, completed: true });
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      {data?.workouts.map(workout => (
        <WorkoutCard 
          key={workout.id}
          workout={workout}
          onComplete={() => handleComplete(workout.id)}
        />
      ))}
    </div>
  );
};
```

---

## 🧪 Testing y Validación

### Casos de Prueba Clave

1. **Usuario nuevo completa onboarding**
   - ✅ Se asigna plan automáticamente
   - ✅ Se generan workouts para la semana
   - ✅ Los workouts tienen tipo='automatico'

2. **Usuario consulta entrenamientos de hoy**
   - ✅ Solo ve workouts de la fecha actual
   - ✅ Incluye ejercicios con series y reps

3. **Usuario marca workout completado**
   - ✅ Campo completed se actualiza a true
   - ✅ Se registra completed_at timestamp
   - ✅ Se invalidan queries en cache

4. **Filtrado de planes**
   - ✅ Planes se filtran por objetivo
   - ✅ Planes se filtran por nivel
   - ✅ Planes se filtran por lugar

---

## 📊 Monitoreo y Logs

Todos los edge functions incluyen logging detallado:

```typescript
console.log(`Assigning routine for user ${user.id}`);
console.log('User profile:', { 
  fitness_goal: profile.fitness_goal, 
  fitness_level: profile.fitness_level 
});
console.log(`Best match: ${selectedPlan.id} (score: ${score})`);
```

Los logs están disponibles en la sección de Edge Functions del dashboard de Lovable Cloud.

---

## 🚀 Despliegue

Las Edge Functions se despliegan automáticamente con el código del proyecto. No requieren configuración manual adicional.

### Configuración en `supabase/config.toml`

```toml
[functions.assign-routine]
verify_jwt = true

[functions.get-todays-workouts]
verify_jwt = true

[functions.get-all-workouts]
verify_jwt = true

[functions.complete-workout]
verify_jwt = true

[functions.get-workouts-by-date]
verify_jwt = true

[functions.get-predesigned-plans]
verify_jwt = false
```

---

## 📝 Notas Importantes

1. **Idempotencia:** La función `assign-routine` verifica que no existan workouts automáticos para la semana actual antes de crear nuevos.

2. **Performance:** Las queries incluyen índices en columnas frecuentemente consultadas (`user_id`, `scheduled_date`, `tipo`).

3. **Escalabilidad:** El sistema soporta múltiples planes y puede adaptarse a diferentes perfiles de usuario mediante el algoritmo de scoring.

4. **Mantenibilidad:** Código modular y bien documentado facilita futuras extensiones.

---

## 🔮 Próximas Mejoras

- [ ] Sistema de notificaciones para recordar entrenamientos
- [ ] Ajuste dinámico de planes basado en progreso
- [ ] Recomendaciones de ejercicios alternativos
- [ ] Integración con wearables para tracking automático
- [ ] Analytics de rendimiento por plan
