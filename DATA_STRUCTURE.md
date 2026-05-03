# Estructura de Datos - RunningTrainer

Este documento describe la estructura de datos utilizada en RunningTrainer para la persistencia en localStorage.

## 📦 localStorage Keys

La aplicación utiliza 3 claves principales en localStorage:

```javascript
{
  "runningTrainerUsers": {...},  // Objeto con todos los usuarios
  "currentUser": "email@example.com", // Email del usuario actualmente logueado
  "runningTrainerLoginAttempts": {...} // Control de intentos fallidos y bloqueo temporal
}
```

---

## 👤 Estructura de Usuario

### `runningTrainerUsers`

Objeto que contiene todos los usuarios registrados, indexados por email:

```javascript
{
  "juan@example.com": {
    name: String,           // Nombre completo del usuario
    email: String,          // Email (actúa como ID único)
    passwordHash: String,   // Hash PBKDF2-SHA256 de la contraseña
    passwordSalt: String,   // Salt aleatorio en base64
    passwordAlgo: String,   // Algoritmo usado: "pbkdf2-sha256"
    passwordIterations: Number, // Iteraciones de PBKDF2
    authSchemaVersion: Number, // Version del esquema de autenticación
    level: String,          // Nivel: "beginner" | "intermediate" | "advanced" | "expert"
    xp: Number,            // Puntos de experiencia acumulados
    pace5k: Number,        // (Opcional) Mejor tiempo 5K en segundos para plan 20K
    pace10k: Number,       // (Opcional) Mejor tiempo 10K en segundos para plan Maratón
    progressData: Object,   // Datos de progreso por plan (ver abajo)
    createdAt: String      // ISO timestamp de creación
  },
  "maria@example.com": {...},
  // ... más usuarios
}
```

### Ejemplo Completo de Usuario

```javascript
{
  "juan.perez@gmail.com": {
    name: "Juan Pérez",
    email: "juan.perez@gmail.com",
    passwordHash: "<HASH_BASE64>",
    passwordSalt: "<SALT_BASE64>",
    passwordAlgo: "pbkdf2-sha256",
    passwordIterations: 120000,
    authSchemaVersion: 2,
    level: "intermediate",
    xp: 475,
    pace5k: 1530,
    pace10k: 3120,
    progressData: {
      "30min": {
        "semana0": [true, true, false, true, false, false, false],
        "semana1": [true, false, false, false, false, false, false],
        "semana2": [false, false, false, false, false, false, false],
        // ... hasta semana7
      },
      "5k": {
        "semana0": [false, false, false, false, false, false, false],
        // ... hasta semana5
      }
      // ... otros planes
    },
    createdAt: "2026-03-01T10:30:00.000Z"
  }
}
```

---

## 📊 Estructura de `progressData`

### Por Plan

Cada plan tiene su propio objeto de progreso:

```javascript
progressData: {
  "30min": {...},      // Plan de 30 minutos
  "5k": {...},         // Plan de 5K
  "10k": {...},        // Plan de 10K
  "fartlek": {...},    // Plan Fartlek
  "hiit": {...},       // Plan HIIT
  "trail": {...},      // Plan Trail
  "sobrepeso": {...},  // Plan Principiantes
  "20k": {...},        // Plan 20K personalizado (generado dinámicamente)
  "maraton": {...}     // Plan Maratón personalizado (generado dinámicamente)
}
```

### Por Semana

Cada plan contiene semanas, y cada semana es un array de booleanos:

```javascript
"30min": {
  "semana0": [true, true, false, true, false, false, false],
  //         Lun   Mar   Mié   Jue   Vie   Sáb   Dom
  "semana1": [false, false, false, false, false, false, false],
  "semana2": [false, false, false, false, false, false, false],
  // ...
  "semana7": [false, false, false, false, false, false, false]
}
```

### Interpretación de Valores

- `true`: Día completado ✅
- `false`: Día pendiente ❌
- Los días de descanso se almacenan como `false` pero **no se cuentan** en el progreso

---

## 🎯 Sistema de Niveles y XP

### Definición de Niveles

```javascript
const NIVELES_XP = {
  'beginner': {
    nombre: 'Principiante',
    xpMinimo: 0,
    xpMaximo: 300,
    siguiente: 'intermediate'
  },
  'intermediate': {
    nombre: 'Intermedio',
    xpMinimo: 300,
    xpMaximo: 800,
    siguiente: 'advanced'
  },
  'advanced': {
    nombre: 'Avanzado',
    xpMinimo: 800,
    xpMaximo: 1500,
    siguiente: 'expert'
  },
  'expert': {
    nombre: 'Experto',
    xpMinimo: 1500,
    xpMaximo: 9999,
    siguiente: null  // Nivel máximo
  }
}
```

### XP por Plan

```javascript
const XP_POR_PLAN = {
  'sobrepeso': 10,    // Principiantes
  '30min': 15,        // Básico
  '5k': 20,           // Intermedio
  'fartlek': 25,      // Avanzado
  '10k': 30,          // Avanzado+
  'trail': 35,        // Experto
  'hiit': 40,         // Experto intenso
  '20k': 50,          // Plan 20K personalizado
  'maraton': 65       // Plan Maratón 42K personalizado
};
```

### Cálculo de XP

**Al completar un día**:
```javascript
nuevoXP = xpActual + XP_POR_PLAN[planActual]
```

**Al desmarcar un día**:
```javascript
nuevoXP = Math.max(0, xpActual - XP_POR_PLAN[planActual])
```

**Subida de nivel**:
```javascript
if (xpActual >= NIVELES_XP[nivelActual].xpMaximo) {
  nuevoNivel = NIVELES_XP[nivelActual].siguiente
}
```

---

## 📅 Estructura de Planes (`data.js`)

### Formato de `planes`

```javascript
const planes = {
  "30min": [
    // Semana 0
    [
      ["Lunes", "5 Series de 1 min corriendo + 2 min caminando"],
      ["Martes", "5 Series de 1 min corriendo + 2 min caminando"],
      ["Miércoles", "Descanso"],
      // ... resto de días
    ],
    // Semana 1
    [...],
    // ... más semanas
  ],
  "5k": [...],
  // ... otros planes
}

// Nota: los planes "20k" y "maraton" se generan dinámicamente en app.js
// a partir de los ritmos ingresados por el usuario.
```

### Estructura de Día

Cada día es un array de 2 elementos:

```javascript
[
  "Lunes",                                        // [0] Nombre del día
  "5 Series de 1 min corriendo + 2 min caminando" // [1] Descripción del entrenamiento
]
```

### Detección de Día de Descanso

Un día se considera descanso si su descripción incluye:

```javascript
function isRestDay(description) {
  return /descanso|recuperaci[oó]n/i.test(description.toLowerCase());
}
```

---

## 🔄 Flujo de Datos

### 1. Registro de Usuario

```
Usuario ingresa datos
  ↓
Validación de email único
  ↓
Creación de objeto de usuario
  ↓
Guardado en runningTrainerUsers
  ↓
Login automático
```

### 2. Login

```
Usuario ingresa credenciales
  ↓
Validación de email y password
  ↓
Establecer currentUser en localStorage
  ↓
Cargar progressData del usuario
  ↓
Renderizar UI con datos del usuario
```

### 3. Cambio de Plan

```
Usuario selecciona plan
  ↓
Verificar si existe progressData[plan]
  ↓
Si no existe: Inicializar con arrays de false
  ↓
Renderizar semanas del plan
  ↓
Actualizar gráficas
```

### 4. Completar Día

```
Usuario marca día como completado
  ↓
Cambiar progressData[plan][semana][dia] = true
  ↓
Sumar XP según plan
  ↓
Verificar subida de nivel
  ↓
Guardar en localStorage
  ↓
Actualizar UI (gráficas, progreso, XP)
```

### 5. Uso de Temporizador

```
Usuario abre temporizador
  ↓
Parser extrae: series, tiempo correr, tiempo caminar
  ↓
Usuario inicia temporizador
  ↓
Entra en modo fullscreen
  ↓
Ejecuta intervalos automáticamente
  ↓
Al finalizar: Notificación de éxito
```

---

## 🔍 Queries Útiles

### Obtener progreso total de un usuario

```javascript
function getOverallProgress(userEmail, plan) {
  const user = users[userEmail];
  let completed = 0;
  let total = 0;
  
  planes[plan].forEach((week, weekIndex) => {
    week.forEach(([day, description], dayIndex) => {
      if (!isRestDay(description)) {
        total++;
        if (user.progressData[plan][`semana${weekIndex}`][dayIndex]) {
          completed++;
        }
      }
    });
  });
  
  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100)
  };
}
```

### Verificar si una semana está completa

```javascript
function isWeekComplete(userEmail, plan, weekIndex) {
  const user = users[userEmail];
  const week = planes[plan][weekIndex];
  
  return week.every(([day, description], dayIndex) => {
    if (isRestDay(description)) return true; // Ignorar descansos
    return user.progressData[plan][`semana${weekIndex}`][dayIndex];
  });
}
```

### Calcular días restantes para subir de nivel

```javascript
function daysToNextLevel(userEmail, plan) {
  const user = users[userEmail];
  const currentLevel = NIVELES_XP[user.level];
  
  if (!currentLevel.siguiente) return Infinity; // Ya es experto
  
  const xpNeeded = currentLevel.xpMaximo - user.xp;
  const xpPerDay = XP_POR_PLAN[plan];
  
  return Math.ceil(xpNeeded / xpPerDay);
}
```

---

## ⚠️ Consideraciones de Seguridad

### Limitaciones Actuales

1. **Contraseñas en texto plano**: 
   - ❌ No usar en producción
   - ✅ Solo para demo/prototipo
   - 🔐 Implementar hash (bcrypt) en backend real

2. **localStorage público**:
   - Datos visibles en DevTools
   - Sin encriptación
   - Vulnerable a XSS

3. **Sin validación de tipos**:
   - No hay TypeScript
   - Posibles inconsistencias de datos

### Recomendaciones para Producción

```javascript
// ✅ Usar backend con:
- JWT para autenticación
- Hash de contraseñas (bcrypt)
- Validación de esquemas (Joi, Yup)
- Base de datos (PostgreSQL, MongoDB)
- HTTPS obligatorio
```

---

## 🔄 Migración de Datos

Si necesitas migrar datos existentes:

```javascript
// Backup
function backupData() {
  const backup = {
    users: localStorage.getItem('runningTrainerUsers'),
    currentUser: localStorage.getItem('currentUser'),
    timestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(backup)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `runningtrainer-backup-${Date.now()}.json`;
  a.click();
}

// Restore
function restoreData(jsonString) {
  const backup = JSON.parse(jsonString);
  localStorage.setItem('runningTrainerUsers', backup.users);
  localStorage.setItem('currentUser', backup.currentUser);
  location.reload();
}
```

---

## 📊 Ejemplos de Cálculos

### Progreso de Usuario

```javascript
// Usuario: Juan
// Plan: HIIT (40 XP/día)
// Días completados: 15
// XP ganado: 15 × 40 = 600 XP
// Nivel inicial: Principiante (0 XP)
// Resultado: 600 XP → Nivel Intermedio ✅ (300-800 XP)
```

### Tiempo para Alcanzar Experto

```javascript
// Nivel actual: Principiante (50 XP)
// Objetivo: Experto (1500 XP)
// XP faltante: 1450 XP
// Plan elegido: HIIT (40 XP/día)
// Días necesarios: 1450 / 40 = 36.25 ≈ 37 días
```

---

Este documento refleja el estado actual de la estructura de datos de RunningTrainer v1.1.0
