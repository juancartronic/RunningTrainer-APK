// ===========================================
// SISTEMA DE AUTENTICACIÓN Y USUARIOS
// ===========================================
let users = JSON.parse(localStorage.getItem("runningTrainerUsers")) || {};
let currentUser = null;
let planActual = "30min";
const AUTH_CONFIG = {
  schemaVersion: 2,
  pbkdf2Iterations: 120000,
  pbkdf2Hash: 'SHA-256',
  minPasswordLength: 8,
  maxFailedAttempts: 5,
  lockoutMs: 5 * 60 * 1000
};
const LOGIN_ATTEMPTS_KEY = 'runningTrainerLoginAttempts';
let loginAttempts = JSON.parse(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '{}');
let chart;
const _savedDarkMode = localStorage.getItem('darkMode');
let darkMode = _savedDarkMode !== null
  ? _savedDarkMode === 'true'
  : window.matchMedia('(prefers-color-scheme: dark)').matches;
let soundMode = localStorage.getItem('soundMode') || 'on'; // 'on', 'success', 'motivation', 'off'
let sharedAudioContext = null;

// Elementos de la interfaz
const authContainer = document.getElementById('authContainer');
const userBar = document.getElementById('userBar');
const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const userName = document.getElementById('userName');
const userAvatar = document.getElementById('userAvatar');
const userLevelBadge = document.getElementById('userLevelBadge');
const logoutBtn = document.getElementById('logoutBtn');
const profileBtn = document.getElementById('profileBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const profileModal = document.getElementById('profileSection');
const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
const soundStatus = document.getElementById('soundStatus');
const profileName = document.getElementById('profileName');
const profileAvatar = document.getElementById('profileAvatar');
const profileLevelBadge = document.getElementById('profileLevelBadge');
const profilePlan = document.getElementById('profilePlan');
const profileCompleted = document.getElementById('profileCompleted');
const profileTotal = document.getElementById('profileTotal');
const profileProgress = document.getElementById('profileProgress');
const profileMinStepsInput = document.getElementById('profileMinStepsInput');
const profileMinStepsHelp = document.getElementById('profileMinStepsHelp');
const profilePedometerUpper = document.getElementById('profilePedometerUpper');
const profilePedometerLower = document.getElementById('profilePedometerLower');
const levelProgressDetails = document.getElementById('levelProgressDetails');
const profilePhotoInput = document.getElementById('profilePhotoInput');
const badgesGrid = document.getElementById('badgesGrid');
const weeksDefaultAnchor = document.getElementById('weeksDefaultAnchor');
const weeksContainerElement = document.getElementById('weeks');
const bottomNav = document.getElementById('bottomNav');
const homeView = document.getElementById('homeView');
const trainingView = document.getElementById('trainingSection');
const calendarView = document.getElementById('calendarSection');
const myRoutesView = document.getElementById('myRoutesSection');
const myRoutesImportBtn = document.getElementById('myRoutesImportBtn');
const myRoutesClearActiveBtn = document.getElementById('myRoutesClearActiveBtn');
const myRoutesImportInput = document.getElementById('myRoutesImportInput');
const myRoutesList = document.getElementById('myRoutesList');
const myRoutesSearch = document.getElementById('myRoutesSearch');
const profileExportBtn = document.getElementById('profileExportBtn');
const profileImportBtn = document.getElementById('profileImportBtn');
const profileImportInput = document.getElementById('profileImportInput');
const homeStepsEl = document.getElementById('homeSteps');
const homeCaloriesEl = document.getElementById('homeCalories');
const homeActiveTimeEl = document.getElementById('homeActiveTime');
const homeDistanceEl = document.getElementById('homeDistance');
const homeStepsGoalEl = document.getElementById('homeStepsGoal');
const homeStepsProgressTextEl = document.getElementById('homeStepsProgressText');
const homeStepsRingProgressEl = document.getElementById('homeStepsRingProgress');
const homeOpenGpsPanelBtn = document.getElementById('homeOpenGpsPanelBtn');
const homeGpsPanel = document.getElementById('homeGpsPanel');
const homeCloseGpsPanelBtn = document.getElementById('homeCloseGpsPanelBtn');
const homeStartRouteBtn = document.getElementById('homeStartRouteBtn');
const homeStopRouteBtn = document.getElementById('homeStopRouteBtn');
const homeCenterRouteBtn = document.getElementById('homeCenterRouteBtn');
const homeGpsTopInicioBtn = document.getElementById('homeGpsTopInicioBtn');
const homeGpsTopGpsBtn = document.getElementById('homeGpsTopGpsBtn');
const homeGpsSettingsBtn = document.getElementById('homeGpsSettingsBtn');
const homeGpsAudioBtn = document.getElementById('homeGpsAudioBtn');
const homeGpsHistoryBtn = document.getElementById('homeGpsHistoryBtn');
const homeGpsFabStartBtn = document.getElementById('homeGpsFabStartBtn');
const homeGpsActivityTabs = document.querySelectorAll('.home-gps-activity-tab');
const homeGpsStatus = document.getElementById('homeGpsStatus');
const homeGpsProgressCard = document.getElementById('homeGpsProgressCard');
const homeGpsProgressTitle = document.getElementById('homeGpsProgressTitle');
const homeGpsProgressPercent = document.getElementById('homeGpsProgressPercent');
const homeGpsProgressFill = document.getElementById('homeGpsProgressFill');
const homeGpsCovered = document.getElementById('homeGpsCovered');
const homeGpsRemaining = document.getElementById('homeGpsRemaining');
const homeRoutesMenu = document.getElementById('homeRoutesScreen');
const homeRoutesCloseBtn = document.getElementById('homeRoutesScreenCloseBtn');
const homeRouteImportBtn = document.getElementById('homeRouteImportBtn');
const homeRouteExportBtn = document.getElementById('homeRouteExportBtn');
const homeRouteExportGpxBtn = document.getElementById('homeRouteExportGpxBtn');
const homeRouteCenterBtn = document.getElementById('homeRouteCenterBtn');
const homeRouteClearLoadedBtn = document.getElementById('homeRouteClearLoadedBtn');
const homeRouteImportInput = document.getElementById('homeRouteImportInput');
const homeRouteNameInput = document.getElementById('homeRouteNameInput');
const homeRouteSaveCurrentBtn = document.getElementById('homeRouteSaveCurrentBtn');
const homeRoutesList = document.getElementById('homeRoutesList');
const homeHistoryMenu = document.getElementById('homeHistoryMenu');
const homeHistoryCloseBtn = document.getElementById('homeHistoryCloseBtn');
const homeHistoryClearBtn = document.getElementById('homeHistoryClearBtn');
const homeHistoryList = document.getElementById('homeHistoryList');
const calendarTrainingLogList = document.getElementById('calendarTrainingLogList');
const homeGpsSettingsPanel = document.getElementById('homeGpsSettingsPanel');
const homeGpsSettingsPanelCloseBtn = document.getElementById('homeGpsSettingsPanelCloseBtn');
const gpsScreenAlwaysOnToggle = document.getElementById('gpsScreenAlwaysOnToggle');
const homeMapTypeButtons = document.querySelectorAll('.home-map-type-btn');

let gpsScreenAlwaysOn = localStorage.getItem('gpsScreenAlwaysOn') !== 'false'; // default true

const HOME_DAILY_KEY = 'runningTrainerHomeDaily';
const HOME_DAILY_HISTORY_KEY = 'runningTrainerDailyHistory';
const HOME_SAVED_ROUTES_KEY = 'runningTrainerSavedRoutes';
const HOME_ROUTE_HISTORY_KEY = 'runningTrainerRouteHistory';
const HOME_MAP_TYPE_KEY = 'runningTrainerHomeMapType';
const HOME_STEPS_GOAL_DEFAULT = 5800;
const HOME_STEPS_RING_RADIUS = 94;
const MY_ROUTES_PAGE_SIZE = 10;
const HOME_STEPS_RING_CIRCUMFERENCE = 2 * Math.PI * HOME_STEPS_RING_RADIUS;

const HOME_MAP_TYPES = ['streets', 'satellite', 'terrain'];
let homeMapType = localStorage.getItem(HOME_MAP_TYPE_KEY) || 'streets';
let homeMapTileLayers = null;
let homeCurrentMapTileLayer = null;

function normalizeHomeStepsGoal(value, fallback = HOME_STEPS_GOAL_DEFAULT) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  const rounded = Math.round(numeric);
  return Math.max(1000, Math.min(50000, rounded));
}

function getHomeStepsGoal() {
  if (currentUser?.homeStepsGoal != null) {
    return normalizeHomeStepsGoal(currentUser.homeStepsGoal, HOME_STEPS_GOAL_DEFAULT);
  }
  // Fallback: leer del usuario persistido en localStorage antes de que currentUser esté disponible
  try {
    const email = localStorage.getItem('currentUser');
    if (email) {
      const storedUsers = JSON.parse(localStorage.getItem('runningTrainerUsers') || '{}');
      const stored = storedUsers[email.toLowerCase().trim()];
      if (stored?.homeStepsGoal != null) {
        return normalizeHomeStepsGoal(stored.homeStepsGoal, HOME_STEPS_GOAL_DEFAULT);
      }
    }
  } catch (_) { /* ignorar errores de parsing */ }
  return HOME_STEPS_GOAL_DEFAULT;
}

let homeDailyData = null;
let _gpsSessionBaseSeconds = 0;
let _gpsSessionBaseDistanceKm = 0;
let _stepActiveTimer = null;
let homeMap = null;
let homeRoutePolyline = null;
let homeLoadedRoutePolyline = null;
let homeRouteMarker = null;
let homeRouteIsRecording = false;
let homeTimerTickInterval = null;
let homeMotionEnabled = false;
let homeMotionWasAboveThreshold = false;
let homeLastStepTs = 0;
let homeNativeStepListener = null;
let homeSavedRoutes = [];
let homeLoadedRouteId = null;
let homeLoadedRoute = null;
let homeLastGuidanceTs = 0;
let homeGuidanceRouteIndex = 0;
let homeNextSplitKm = 1;
let homePrevSplitElapsed = 0;
let homeLastOffRouteTs = 0;
let homeFinishAnnounced = false;
let homeLoadedRouteCumulativeMeters = [];
let homeLoadedRouteTotalMeters = 0;
let homeLastGuidanceMessage = '';
let homeRouteHistory = [];
let homeCurrentSplitSeconds = [];
let myRoutesPage = 1;

// Elementos del temporizador
const timerModal = document.getElementById('timerModal');
const closeTimerModalBtn = document.getElementById('closeTimerModalBtn');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const timerWorkoutTitle = document.getElementById('timerWorkoutTitle');
const currentRepDisplay = document.getElementById('currentRep');
const totalRepsDisplay = document.getElementById('totalReps');
const timerLabel = document.getElementById('timerLabel');
const timerRingProgress = document.getElementById('timerRingProgress');
const countdownDisplay = document.getElementById('countdown');
const timerPhaseHint = document.getElementById('timerPhaseHint');

let currentDayWorkout = null;
let timerInterval = null;
let timeLeft = 0;
let phaseDuration = 0;
let isRunning = false;
let isExercise = true;
let totalReps = 0;
let currentRep = 0;
let timerStartTimestamp = null;
let lastTimerElapsedSeconds = null;
let lastGpsData = null; // Datos GPS del último entrenamiento
let gpsUpdateInterval = null; // Intervalo para actualizar UI del GPS

const TIMER_RING_RADIUS = 96;
const TIMER_RING_CIRCUMFERENCE = 2 * Math.PI * TIMER_RING_RADIUS;

// ===========================================
// SISTEMA DE BADGES/LOGROS
// ===========================================
const BADGES = {
  // 🎯 LOGROS INICIALES
  'primer-entrenamiento': {
    icon: '🏃',
    name: 'Primer Paso',
    description: 'Completar tu primer entrenamiento'
  },
  'bienvenida': {
    icon: '👋',
    name: 'Bienvenido',
    description: 'Crear tu cuenta'
  },
  
  // 📅 LOGROS POR SEMANA
  'semana-completa': {
    icon: '🌟',
    name: 'Semana Perfecta',
    description: 'Completa una semana entera (7 entrenamientos)'
  },
  'dos-semanas': {
    icon: '⚡',
    name: 'Imparable',
    description: 'Completa 2 semanas consecutivas'
  },
  'mes-entrenador': {
    icon: '📆',
    name: 'Hombre de Hierro',
    description: 'Entrena durante un mes completo'
  },
  
  // 📊 LOGROS DE PROGRESIÓN
  'nivel-intermedio': {
    icon: '⬆️',
    name: 'Ascenso',
    description: 'Alcanza nivel Intermedio'
  },
  'nivel-avanzado': {
    icon: '🚀',
    name: 'En Órbita',
    description: 'Alcanza nivel Avanzado'
  },
  'experto': {
    icon: '👑',
    name: 'Rey del Atletismo',
    description: 'Alcanza nivel Experto (¡Máximo!)'
  },
  
  // 💪 LOGROS DE PLANES
  'plan-completado': {
    icon: '🏆',
    name: 'Maestro del Plan',
    description: 'Completa un plan entero (56 entrenamientos)'
  },
  'plan-30min': {
    icon: '⏱️',
    name: 'Media Hora de Glory',
    description: 'Completa el plan de 30 minutos'
  },
  'plan-5k': {
    icon: '5️⃣',
    name: 'Corredor de 5K',
    description: 'Completa el plan de 5K'
  },
  'plan-10k': {
    icon: '🔟',
    name: 'Ultramaratonista',
    description: 'Completa el plan de 10K'
  },
  'plan-hiit': {
    icon: '🔥',
    name: 'Intenso',
    description: 'Completa el plan HIIT'
  },
  'plan-fartlek': {
    icon: '🌪️',
    name: 'Maestro del Ritmo',
    description: 'Completa el plan Fartlek'
  },
  'plan-trail': {
    icon: '⛰️',
    name: 'Montañero',
    description: 'Completa el plan Trail Running'
  },
  'plan-20k': {
    icon: '🎯',
    name: 'Medio Maratoniano',
    description: 'Completa el plan 1/2 Maratón'
  },
  'plan-maraton': {
    icon: '🏆',
    name: 'Maratoniano',
    description: 'Completa el plan Maratón 42K'
  },
  'todos-planes': {
    icon: '🎖️',
    name: 'Explorador',
    description: 'Prueba todos los planes disponibles'
  },
  
  // 🔢 LOGROS DE CANTIDAD
  '50-entrenamientos': {
    icon: '5️⃣0️⃣',
    name: 'Medio Siglo',
    description: 'Completa 50 entrenamientos'
  },
  '100-entrenamientos': {
    icon: '💯',
    name: 'Centésimo',
    description: 'Completa 100 entrenamientos'
  },
  '250-entrenamientos': {
    icon: '🌈',
    name: 'Más Allá del Límite',
    description: 'Completa 250 entrenamientos'
  },
  '500-xp': {
    icon: '⭐',
    name: 'Coleccionista de XP',
    description: 'Acumula 500 XP'
  },
  '1000-xp': {
    icon: '✨',
    name: 'XP Infinito',
    description: 'Acumula 1000 XP'
  },
  
  // 🔥 LOGROS DESAFIANTES
  'racha-3': {
    icon: '🔥',
    name: 'En Llamas',
    description: 'Completa 3 entrenamientos consecutivos'
  },
  'racha-7': {
    icon: '🌪️',
    name: 'Tormenta de Fuego',
    description: 'Completa 7 entrenamientos consecutivos'
  },
  'racha-30': {
    icon: '☄️',
    name: 'Leyenda Viva',
    description: 'Completa 30 entrenamientos consecutivos'
  },
  'semana-todos-planes': {
    icon: '🎯',
    name: 'Versátil',
    description: 'Usa todos los planes en una semana'
  },
  
  // 🎪 LOGROS ESPECIALES
  'de-vuelta': {
    icon: '🔄',
    name: 'Resurección',
    description: 'Vuelve a entrenar después de 7 días sin actividad'
  },
  'madrugador': {
    icon: '🌅',
    name: 'Madrugador',
    description: 'Completa entrenamientos en horario matutino'
  },
  'perfeccionista': {
    icon: '✅',
    name: 'Perfeccionista',
    description: 'Completa 5 semanas al 100%'
  },
  'velocista': {
    icon: '💨',
    name: 'Velocista',
    description: 'Completa un plan en menos de 50 días'
  },
  'persistencia': {
    icon: '💎',
    name: 'Diamante en Bruto',
    description: 'Entrena más de 100 días en total'
  },
  'coleccionista-badges': {
    icon: '🏅',
    name: 'Coleccionista',
    description: 'Desbloquea 15 logros'
  },
  'maestro-absolute': {
    icon: '🧙',
    name: 'Maestro Absoluto',
    description: 'Desbloquea 25 logros'
  }
};

// ===========================================
// SISTEMA DE PROGRESIÓN Y EXPERIENCIA
// ===========================================
const XP_POR_PLAN = {
  'sobrepeso': 10,    // Principiantes: 10 XP por día
  '30min': 15,        // Básico: 15 XP
  '5k': 20,           // Intermedio: 20 XP
  'fartlek': 25,      // Avanzado: 25 XP
  '10k': 30,          // Avanzado: 30 XP
  'trail': 35,        // Experto: 35 XP
  'hiit': 40,         // Experto intenso: 40 XP
  '20k': 50,          // Elite: 50 XP por dia
  'maraton': 65        // Maratón: 65 XP por dia
};

const NIVELES_XP = {
  'beginner': { nombre: 'Principiante', xpMinimo: 0, xpMaximo: 300, siguiente: 'intermediate' },
  'intermediate': { nombre: 'Intermedio', xpMinimo: 300, xpMaximo: 800, siguiente: 'advanced' },
  'advanced': { nombre: 'Avanzado', xpMinimo: 800, xpMaximo: 1500, siguiente: 'expert' },
  'expert': { nombre: 'Experto', xpMinimo: 1500, xpMaximo: 9999, siguiente: null }
};

// ===========================================
// MENSAJES MOTIVACIONALES POR NIVEL DE USUARIO
// ===========================================
const mensajesMotivadores = {
  beginner: [
    { min: 0, max: 10, mensaje: "¡Vamos! El primer paso es el más importante. 💪 Cada gran corredor empezó donde tú estás ahora." },
    { min: 11, max: 30, mensaje: "¡Buen comienzo! 🚀 Cada entrenamiento te acerca a tus metas. Sigue así." },
    { min: 31, max: 50, mensaje: "¡Ya estás en camino! 🔥 La constancia es la clave. Siente el progreso." },
    { min: 51, max: 70, mensaje: "¡Más de la mitad! 🌟 Estás haciendo un trabajo increíble. No pares ahora." },
    { min: 71, max: 90, mensaje: "¡Casi lo logras! 💯 El esfuerzo de hoy es el éxito de mañana. ¡Tú puedes!" },
    { min: 91, max: 99, mensaje: "¡Último empujón! 🏁 Prepárate para celebrar tu logro. Eres increíble." },
    { min: 100, max: 100, mensaje: "¡LO LOGRASTE! 🎉🏆 Eres un/a verdadero/a corredor/a. ¡Celebra este momento!" }
  ],
  intermediate: [
    { min: 0, max: 10, mensaje: "¡Retoma tu ritmo! 💪 Ya tienes experiencia, ahora es momento de mejorar." },
    { min: 11, max: 30, mensaje: "¡Vas por buen camino! 🚀 Tu consistencia está dando resultados." },
    { min: 31, max: 50, mensaje: "¡Mitad del camino! 🔥 Tu dedicación es inspiradora. Siente cómo mejoras." },
    { min: 51, max: 70, mensaje: "¡Más de la mitad! 🌟 Estás superando expectativas. Sigue así." },
    { min: 71, max: 90, mensaje: "¡Casi llegas! 💯 Tu perseverancia es admirable. El éxito está cerca." },
    { min: 91, max: 99, mensaje: "¡Último esfuerzo! 🏁 Estás a punto de alcanzar un nuevo nivel." },
    { min: 100, max: 100, mensaje: "¡META ALCANZADA! 🎉🏆 Has demostrado tu compromiso. ¡Eres increíble!" }
  ],
  advanced: [
    { min: 0, max: 10, mensaje: "¡A por todas! 💪 Como corredor avanzado, sabes que la disciplina es clave." },
    { min: 11, max: 30, mensaje: "¡Imparable! 🚀 Tu experiencia se nota en cada zancada." },
    { min: 31, max: 50, mensaje: "¡Mitad del recorrido! 🔥 Estás puliendo tu técnica y resistencia." },
    { min: 51, max: 70, mensaje: "¡Dominando el plan! 🌟 Tu dedicación es ejemplar." },
    { min: 71, max: 90, mensaje: "¡Casi perfection! 💯 Estás a punto de alcanzar la excelencia." },
    { min: 91, max: 99, mensaje: "¡Último sprint! 🏁 Tu determinación te llevará al éxito." },
    { min: 100, max: 100, mensaje: "¡EXCELENCIA LOGrada! 🎉🏆 Has demostrado maestría en tu entrenamiento." }
  ],
  expert: [
    { min: 0, max: 10, mensaje: "¡Maestro en acción! 💪 Como experto, sabes que cada detalle cuenta." },
    { min: 11, max: 30, mensaje: "¡Precisión experta! 🚀 Tu técnica y conocimiento marcan la diferencia." },
    { min: 31, max: 50, mensaje: "¡Mitad del camino hacia la maestría! 🔥 Estás refinando tu arte." },
    { min: 51, max: 70, mensaje: "¡Dominio total! 🌟 Tu ejecución es impecable." },
    { min: 71, max: 90, mensaje: "¡Casi perfección absoluta! 💯 Estás a un paso de la excelencia máxima." },
    { min: 91, max: 99, mensaje: "¡Último refinamiento! 🏁 Pulir estos detalles te llevará la cima." },
    { min: 100, max: 100, mensaje: "¡MAESTRÍA ALCANZADA! 🎉🏆 Has demostrado pericia total. ¡Eres una inspiración!" }
  ]
};

// ===========================================
// FUNCIONALIDADES DE LA APLICACIÓN
// ===========================================

// Animación de inicio
document.addEventListener('DOMContentLoaded', () => {
  const splashScreen = document.getElementById('splashScreen');
  const splashTitle = document.getElementById('splashTitle');
  const loadingCircle = document.getElementById('loadingCircle');
  
  // Aplicar tema siempre al arrancar (oscuro o claro)
  applyDarkMode();
  
  // Verificar autenticación primero
  const isAuthenticated = checkAuthStatus();
  
  setTimeout(() => {
    splashTitle.style.animation = 'fadeInUp 0.8s ease-out forwards';
    loadingCircle.style.animation = 'fadeInUp 0.8s ease-out 0.3s forwards';
  }, 100);
  
  setTimeout(() => {
    splashScreen.style.opacity = '0';
    document.body.classList.add('app-loaded');
    setTimeout(() => splashScreen.remove(), 500);
    
    // Si no está autenticado, mostrar el formulario de login
    if (!isAuthenticated) {
      authContainer.classList.remove('hidden');
    }
  }, 2500);
  
  // Inicializar event listeners
  initEventListeners();
  initModal10K();
  initModal20K();
  initModalMaraton();
});

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyHomeDailyData(previousData = null) {
  return {
    date: getTodayKey(),
    stepsSensor: 0,
    stepsDistance: 0,
    calories: 0,
    activeSeconds: 0,
    gpsActiveSeconds: 0,
    stepActiveSeconds: 0,
    distanceKm: 0,
    routePositions: [],
    stepCounterBase: Number.isFinite(previousData?.stepCounterLastTotal) ? previousData.stepCounterLastTotal : null,
    stepCounterBootTime: Number.isFinite(previousData?.stepCounterBootTime) ? previousData.stepCounterBootTime : 0,
    stepCounterLastTotal: Number.isFinite(previousData?.stepCounterLastTotal) ? previousData.stepCounterLastTotal : 0
  };
}

function archiveDailyData(data) {
  if (!data) return;
  const totalSteps = Math.max(data.stepsSensor || 0, data.stepsDistance || 0);
  if (totalSteps === 0 && (data.activeSeconds || 0) === 0) return;
  const history = JSON.parse(localStorage.getItem(HOME_DAILY_HISTORY_KEY) || '[]');
  if (!history.some(e => e.date === data.date)) {
    history.unshift({
      date: data.date,
      steps: totalSteps,
      calories: data.calories || 0,
      activeSeconds: data.activeSeconds || 0,
      distanceKm: data.distanceKm || 0
    });
    if (history.length > 90) history.length = 90;
    localStorage.setItem(HOME_DAILY_HISTORY_KEY, JSON.stringify(history));
  }
}

function ensureHomeDailyData() {
  const todayKey = getTodayKey();
  if (!homeDailyData || homeDailyData.date !== todayKey) {
    const saved = JSON.parse(localStorage.getItem(HOME_DAILY_KEY) || 'null');
    if (saved && saved.date === todayKey) {
      homeDailyData = saved;
    } else {
      if (saved && saved.date !== todayKey) archiveDailyData(saved);
      homeDailyData = createEmptyHomeDailyData(saved);
      localStorage.setItem(HOME_DAILY_KEY, JSON.stringify(homeDailyData));
    }
  }
}

function saveHomeDailyData() {
  if (!homeDailyData) return;
  localStorage.setItem(HOME_DAILY_KEY, JSON.stringify(homeDailyData));
}

function getHomeTotalSteps() {
  ensureHomeDailyData();
  return Math.max(homeDailyData.stepsSensor || 0, homeDailyData.stepsDistance || 0);
}

function calculateCalories(distanceKm, activeSeconds) {
  const minutes = activeSeconds / 60;
  return Math.max(0, Math.round((distanceKm * 35) + (minutes * 1.5)));
}

function formatActiveTimeShort(totalSeconds) {
  const safeSeconds = Math.max(0, Math.round(totalSeconds || 0));
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function renderHomeDashboard() {
  ensureHomeDailyData();

  if (!homeStepsEl || !homeCaloriesEl || !homeActiveTimeEl || !homeDistanceEl) return;

  const totalSteps = getHomeTotalSteps();
  const stepsBasedKm = totalSteps * 0.0008;
  const distanceKm = Math.max(homeDailyData.distanceKm || 0, stepsBasedKm);
  const activeSeconds = homeDailyData.activeSeconds || 0;
  const calories = calculateCalories(distanceKm, activeSeconds);
  homeDailyData.calories = calories;

  homeStepsEl.textContent = totalSteps.toLocaleString('es-ES');
  homeCaloriesEl.textContent = calories.toLocaleString('es-ES');
  homeActiveTimeEl.textContent = formatActiveTimeShort(activeSeconds);
  homeDistanceEl.textContent = distanceKm.toFixed(2).replace('.', ',');

  if (homeStepsGoalEl) {
    homeStepsGoalEl.textContent = getHomeStepsGoal().toLocaleString('es-ES');
  }

  const stepsGoal = getHomeStepsGoal();
  const progress = totalSteps > 0 ? Math.round((totalSteps / stepsGoal) * 100) : 0;
  if (homeStepsProgressTextEl) {
    homeStepsProgressTextEl.textContent = `${progress}% completado`;
  }

  if (homeStepsRingProgressEl) {
    const ratio = Math.min(1, totalSteps / stepsGoal);
    const dashOffset = HOME_STEPS_RING_CIRCUMFERENCE * (1 - ratio);
    homeStepsRingProgressEl.style.strokeDasharray = `${HOME_STEPS_RING_CIRCUMFERENCE}`;
    homeStepsRingProgressEl.style.strokeDashoffset = `${dashOffset}`;
    homeStepsRingProgressEl.style.stroke = progress >= 100 ? '#22c55e' : '#0ea5e9';
  }

  saveHomeDailyData();
}

function updateHomeStepsUI() {
  if (!homeStepsEl) return;
  const totalSteps = getHomeTotalSteps();
  homeStepsEl.textContent = totalSteps.toLocaleString('es-ES');

  const stepsGoal = getHomeStepsGoal();
  const progress = totalSteps > 0 ? Math.round((totalSteps / stepsGoal) * 100) : 0;
  if (homeStepsProgressTextEl) {
    homeStepsProgressTextEl.textContent = `${progress}% completado`;
  }
  if (homeStepsRingProgressEl) {
    const ratio = Math.min(1, totalSteps / stepsGoal);
    const dashOffset = HOME_STEPS_RING_CIRCUMFERENCE * (1 - ratio);
    homeStepsRingProgressEl.style.strokeDasharray = `${HOME_STEPS_RING_CIRCUMFERENCE}`;
    homeStepsRingProgressEl.style.strokeDashoffset = `${dashOffset}`;
    homeStepsRingProgressEl.style.stroke = progress >= 100 ? '#22c55e' : '#0ea5e9';
  }
}

function getPedometerThresholds() {
  const upper = Number(currentUser?.pedometerUpper);
  const lower = Number(currentUser?.pedometerLower);
  return {
    upperThreshold: Number.isFinite(upper) && upper > 0 ? upper : 12.2,
    lowerThreshold: Number.isFinite(lower) && lower > 0 ? lower : 10.5,
  };
}

function getNativeStepCounterPlugin() {
  return window.Capacitor?.Plugins?.StepCounter || null;
}

function getIsoDateFromTimestamp(timestamp) {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '';
  return new Date(timestamp).toISOString().slice(0, 10);
}

function applyNativeStepCounterUpdate(snapshot) {
  ensureHomeDailyData();
  if (!snapshot) return false;

  const totalSteps = Math.max(0, Math.floor(Number(snapshot.totalSteps) || 0));
  const bootTimeMs = Math.max(0, Math.floor(Number(snapshot.bootTimeMs) || 0));
  const bootDate = getIsoDateFromTimestamp(bootTimeMs);
  const todayKey = homeDailyData.date;
  const previousDisplayedSteps = Math.max(0, Math.floor(Number(homeDailyData.stepsSensor) || 0));
  const previousRawTotal = Math.max(0, Math.floor(Number(homeDailyData.stepCounterLastTotal) || 0));

  let base = homeDailyData.stepCounterBase;
  const storedBootTime = Math.max(0, Math.floor(Number(homeDailyData.stepCounterBootTime) || 0));
  const bootChanged = storedBootTime && bootTimeMs && storedBootTime !== bootTimeMs;
  const baseMissing = !Number.isFinite(base);

  if (bootChanged || baseMissing || base > totalSteps) {
    if (bootDate === todayKey) {
      base = 0;
    } else if (!baseMissing && !bootChanged) {
      base = Math.min(base, totalSteps);
    } else {
      base = totalSteps;
    }
  }

  const todaySteps = Math.max(0, totalSteps - base);
  homeDailyData.stepCounterBase = base;
  homeDailyData.stepCounterBootTime = bootTimeMs || storedBootTime || 0;
  homeDailyData.stepCounterLastTotal = totalSteps;
  homeDailyData.stepsSensor = todaySteps;

  if (totalSteps > previousRawTotal || todaySteps > previousDisplayedSteps) {
    homeLastStepTs = Date.now();
  }

  saveHomeDailyData();
  renderHomeDashboard();
  return true;
}

function ensureStepActiveTimer() {
  if (_stepActiveTimer) return;

  _stepActiveTimer = setInterval(() => {
    if (homeRouteIsRecording || !homeDailyData) return;
    const now = Date.now();
    if (homeLastStepTs && now - homeLastStepTs < 90000) {
      ensureHomeDailyData();
      homeDailyData.stepActiveSeconds = (homeDailyData.stepActiveSeconds || 0) + 60;
      homeDailyData.activeSeconds = (homeDailyData.gpsActiveSeconds || 0) + homeDailyData.stepActiveSeconds;
      saveHomeDailyData();
      renderHomeDashboard();
    }
  }, 60000);
}

function handleHomeMotion(event) {
  ensureHomeDailyData();

  const accel = event.accelerationIncludingGravity;
  if (!accel) return;
  const x = accel.x || 0;
  const y = accel.y || 0;
  const z = accel.z || 0;
  const magnitude = Math.sqrt(x * x + y * y + z * z);
  const now = Date.now();

  const { upperThreshold, lowerThreshold } = getPedometerThresholds();
  const minStepIntervalMs = 280;

  if (!homeMotionWasAboveThreshold && magnitude > upperThreshold && (now - homeLastStepTs) > minStepIntervalMs) {
    homeMotionWasAboveThreshold = true;
    homeLastStepTs = now;
    homeDailyData.stepsSensor = (homeDailyData.stepsSensor || 0) + 1;
    updateHomeStepsUI();
  } else if (homeMotionWasAboveThreshold && magnitude < lowerThreshold) {
    homeMotionWasAboveThreshold = false;
  }
}

async function enableHomeMotionTracking({ silent = false } = {}) {
  if (homeMotionEnabled) return true;

  const nativeStepCounter = getNativeStepCounterPlugin();
  if (nativeStepCounter) {
    try {
      const availability = await nativeStepCounter.isAvailable();
      if (availability?.available) {
        homeNativeStepListener = await nativeStepCounter.addListener('stepUpdate', applyNativeStepCounterUpdate);
        const initialSnapshot = await nativeStepCounter.startUpdates();
        applyNativeStepCounterUpdate(initialSnapshot);
        ensureStepActiveTimer();
        homeMotionEnabled = true;
        if (!silent) showToast('Contador de pasos activado.', 'success');
        return true;
      }
    } catch (err) {
      console.warn('No se pudo activar el contador de pasos nativo:', err);
    }
  }

  try {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      const permissionState = await DeviceMotionEvent.requestPermission();
      if (permissionState !== 'granted') {
        if (!silent) showToast('Permiso de movimiento denegado.', 'error');
        return false;
      }
    }

    window.addEventListener('devicemotion', handleHomeMotion, { passive: true });
    homeMotionEnabled = true;
    ensureStepActiveTimer();
    if (!silent) showToast('Contador de pasos activado.', 'success');
    return true;
  } catch (err) {
    console.warn('No se pudo activar el sensor de pasos:', err);
    if (!silent) showToast('No se pudo activar el sensor de pasos en este dispositivo.', 'error');
    return false;
  }
}

async function requestGeoPermissionOnce() {
  if (!window.GPS?.isSupported || !GPS.isSupported()) {
    return { coords: null, message: 'GPS no disponible en este dispositivo.' };
  }

  try {
    const permission = await GPS.ensurePermission();
    if (!permission.granted) {
      return { coords: null, message: permission.message || 'Permiso GPS denegado. Habilitalo en ajustes.' };
    }

    const pos = await GPS.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
    return {
      coords: {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude
      },
      message: ''
    };
  } catch (err) {
    return { coords: null, message: err?.message || 'Permiso GPS requerido para abrir el mapa.' };
  }
}

function setHomeGpsStatus(message = '', type = 'info') {
  if (!homeGpsStatus) return;

  if (!message) {
    homeGpsStatus.textContent = '';
    homeGpsStatus.className = 'home-gps-status';
    return;
  }

  homeGpsStatus.textContent = message;
  homeGpsStatus.className = `home-gps-status active ${type}`;
}

function speakGpsMessage(message) {
  if (!message || soundMode === 'off') return;
  if (!('speechSynthesis' in window)) return;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'es-ES';
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearingDegrees(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const toDeg = (v) => (v * 180) / Math.PI;
  const y = Math.sin(toRad(lon2 - lon1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2 - lon1));
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function bearingToDirectionLabel(deg) {
  if (deg >= 337.5 || deg < 22.5) return 'norte';
  if (deg < 67.5) return 'noreste';
  if (deg < 112.5) return 'este';
  if (deg < 157.5) return 'sureste';
  if (deg < 202.5) return 'sur';
  if (deg < 247.5) return 'suroeste';
  if (deg < 292.5) return 'oeste';
  return 'noroeste';
}

function normalizeRoutePoint(point) {
  const lat = Number(point?.lat);
  const lon = Number(point?.lon ?? point?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

function computeRouteDistanceKm(points = []) {
  if (!Array.isArray(points) || points.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineDistanceMeters(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon);
  }
  return total / 1000;
}

function computeRouteCumulativeMeters(points = []) {
  const cumulative = [0];
  if (!Array.isArray(points) || points.length < 2) return cumulative;
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineDistanceMeters(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon);
    cumulative.push(total);
  }
  return cumulative;
}

function resetGpsProgressCard() {
  if (!homeGpsProgressCard) return;
  homeGpsProgressCard.hidden = true;
  if (homeGpsProgressFill) homeGpsProgressFill.style.width = '0%';
  if (homeGpsProgressPercent) homeGpsProgressPercent.textContent = '0%';
  if (homeGpsCovered) homeGpsCovered.textContent = '0,00 km';
  if (homeGpsRemaining) homeGpsRemaining.textContent = '0,00 km';
}

function updateGpsProgressCard(progress) {
  if (!homeGpsProgressCard || !progress) {
    resetGpsProgressCard();
    return;
  }

  homeGpsProgressCard.hidden = false;
  if (homeGpsProgressTitle) homeGpsProgressTitle.textContent = homeLoadedRoute?.name || 'Ruta activa';
  if (homeGpsProgressPercent) homeGpsProgressPercent.textContent = `${Math.round(progress.percent)}%`;
  if (homeGpsProgressFill) homeGpsProgressFill.style.width = `${Math.max(0, Math.min(100, progress.percent))}%`;
  if (homeGpsCovered) homeGpsCovered.textContent = `${(progress.coveredMeters / 1000).toFixed(2).replace('.', ',')} km`;
  if (homeGpsRemaining) homeGpsRemaining.textContent = `${(progress.remainingMeters / 1000).toFixed(2).replace('.', ',')} km`;
}

function saveHomeRoutesStorage() {
  localStorage.setItem(HOME_SAVED_ROUTES_KEY, JSON.stringify(homeSavedRoutes));
}

function saveHomeRouteHistoryStorage() {
  localStorage.setItem(HOME_ROUTE_HISTORY_KEY, JSON.stringify(homeRouteHistory.slice(0, 120)));
}

function loadHomeRouteHistoryStorage() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HOME_ROUTE_HISTORY_KEY) || '[]');
    if (!Array.isArray(parsed)) {
      homeRouteHistory = [];
      return;
    }

    homeRouteHistory = parsed
      .map((item) => {
        const splitSeconds = Array.isArray(item?.splitSeconds)
          ? item.splitSeconds.map((secs) => Math.max(0, Math.round(Number(secs) || 0))).filter((secs) => secs > 0)
          : [];

        return {
          id: String(item?.id || `history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
          createdAt: item?.createdAt || new Date().toISOString(),
          activity: String(item?.activity || 'correr'),
          routeName: String(item?.routeName || 'Ruta libre'),
          distanceMeters: Math.max(0, Math.round(Number(item?.distanceMeters) || 0)),
          elapsedSeconds: Math.max(0, Math.round(Number(item?.elapsedSeconds) || 0)),
          splitSeconds,
          finalPartialMeters: Math.max(0, Math.round(Number(item?.finalPartialMeters) || 0)),
          finalPartialSeconds: Math.max(0, Math.round(Number(item?.finalPartialSeconds) || 0))
        };
      })
      .filter((item) => item.elapsedSeconds > 0 && item.distanceMeters > 0)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (_) {
    homeRouteHistory = [];
  }
}

function loadHomeRoutesStorage() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HOME_SAVED_ROUTES_KEY) || '[]');
    if (!Array.isArray(parsed)) {
      homeSavedRoutes = [];
      return;
    }

    homeSavedRoutes = parsed
      .map((route) => {
        const points = (route?.points || []).map(normalizeRoutePoint).filter(Boolean);
        if (points.length < 2) return null;
        return {
          id: String(route.id || `route-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
          name: String(route.name || 'Ruta sin nombre'),
          createdAt: route.createdAt || new Date().toISOString(),
          points,
          distanceKm: Number(route.distanceKm) || computeRouteDistanceKm(points)
        };
      })
      .filter(Boolean);
  } catch (_) {
    homeSavedRoutes = [];
  }
}

function drawLoadedRouteOnMap() {
  if (!homeMap || !homeLoadedRoutePolyline) return;
  const latLngs = (homeLoadedRoute?.points || []).map((p) => [p.lat, p.lon]);
  homeLoadedRoutePolyline.setLatLngs(latLngs);
}

function setLoadedRoute(routeId = null) {
  homeLoadedRouteId = routeId;
  homeLoadedRoute = homeSavedRoutes.find((r) => r.id === routeId) || null;
  homeGuidanceRouteIndex = 0;
  homeFinishAnnounced = false;
  homeLastGuidanceMessage = '';
  homeLoadedRouteCumulativeMeters = homeLoadedRoute ? computeRouteCumulativeMeters(homeLoadedRoute.points) : [];
  homeLoadedRouteTotalMeters = homeLoadedRouteCumulativeMeters.length
    ? homeLoadedRouteCumulativeMeters[homeLoadedRouteCumulativeMeters.length - 1]
    : 0;
  drawLoadedRouteOnMap();

  if (homeLoadedRoute) {
    setHomeGpsStatus(`Ruta activa: ${homeLoadedRoute.name}`, 'info');
    updateGpsProgressCard(computeRouteProgressFromIndex(0));
    if (homeMap) {
      const bounds = L.latLngBounds(homeLoadedRoute.points.map((p) => [p.lat, p.lon]));
      homeMap.fitBounds(bounds.pad(0.18));
    }
  } else if (!homeRouteIsRecording) {
    setHomeGpsStatus('');
  }

  if (!homeLoadedRoute) {
    resetGpsProgressCard();
  }

  renderAllRoutesLists();
}

function routeItemTemplate(route) {
  const created = new Date(route.createdAt).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const distance = `${route.distanceKm.toFixed(2).replace('.', ',')} km`;
  const points = `${(route.points || []).length} puntos`;
  const activeTag = route.id === homeLoadedRouteId ? ' (activa)' : '';
  return `
    <div class="home-route-item" data-route-id="${route.id}">
      <div>
        <div class="home-route-item-title">${route.name}${activeTag}</div>
        <div class="home-route-item-meta">${distance} · ${points}</div>
        <div class="home-route-item-meta">Guardada: ${created}</div>
      </div>
      <div class="home-route-item-actions">
        <button type="button" data-action="load">Cargar</button>
        <button type="button" data-action="export">Exportar</button>
        <button type="button" data-action="delete">Borrar</button>
      </div>
    </div>
  `;
}

function renderRoutesListIn(container) {
  if (!container) return;
  if (!homeSavedRoutes.length) {
    container.innerHTML = '<div class="home-route-item-meta">No hay rutas guardadas todavia.</div>';
    return;
  }

  container.innerHTML = homeSavedRoutes.map(routeItemTemplate).join('');
}

function renderHomeRoutesList() {
  renderRoutesListIn(homeRoutesList);
}

function renderMyRoutesList(resetPage = false) {
  if (!myRoutesList) return;
  if (resetPage) {
    myRoutesPage = 1;
    if (myRoutesSearch) myRoutesSearch.value = '';
  }

  const query = myRoutesSearch ? myRoutesSearch.value.trim().toLowerCase() : '';
  const filtered = query
    ? homeSavedRoutes.filter((r) => r.name.toLowerCase().includes(query))
    : homeSavedRoutes;

  if (!filtered.length) {
    myRoutesList.innerHTML = query
      ? '<div class="home-route-item-meta">No hay rutas que coincidan con la búsqueda.</div>'
      : '<div class="home-route-item-meta">No hay rutas guardadas todavia.</div>';
    return;
  }

  const visible = filtered.slice(0, myRoutesPage * MY_ROUTES_PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  myRoutesList.innerHTML = visible.map(routeItemTemplate).join('');

  if (hasMore) {
    const loadMoreBtn = document.createElement('button');
    loadMoreBtn.type = 'button';
    loadMoreBtn.className = 'btn btn-secondary my-routes-load-more';
    loadMoreBtn.textContent = `Mostrar más (${filtered.length - visible.length} restantes)`;
    loadMoreBtn.addEventListener('click', () => {
      myRoutesPage += 1;
      renderMyRoutesList();
    });
    myRoutesList.appendChild(loadMoreBtn);
  }
}

function renderAllRoutesLists() {
  renderHomeRoutesList();
  renderMyRoutesList();
}

async function handleRouteImportInputChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    await importRouteFromFile(file);
    renderAllRoutesLists();
  } catch (err) {
    const reason = err?.message || '';
    if (reason === 'Ruta invalida') {
      showToast('El archivo no contiene puntos de ruta válidos (mínimo 2 puntos).', 'error');
    } else if (reason.includes('JSON')) {
      showToast('El archivo JSON tiene un formato incorrecto.', 'error');
    } else {
      showToast('No se pudo importar la ruta. Comprueba que el archivo sea .gpx o .json válido.', 'error');
    }
  }
  event.target.value = '';
}

function handleRoutesListClick(event, { closeMenuOnLoad = false } = {}) {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;
  const item = event.target.closest('.home-route-item');
  const routeId = item?.dataset.routeId;
  if (!routeId) return;
  const route = homeSavedRoutes.find((r) => r.id === routeId);
  if (!route) return;

  const action = btn.dataset.action;
  if (action === 'load') {
    setLoadedRoute(routeId);
    if (closeMenuOnLoad) {
      closeHomeRoutesMenu();
    }
    showToast(`Ruta cargada: ${route.name}`, 'success');
  } else if (action === 'export') {
    exportRoute(route);
  } else if (action === 'delete') {
    homeSavedRoutes = homeSavedRoutes.filter((r) => r.id !== routeId);
    saveHomeRoutesStorage();
    if (homeLoadedRouteId === routeId) {
      setLoadedRoute(null);
    }
    renderAllRoutesLists();
  }
}

function openHomeRoutesMenu() {
  if (!homeRoutesMenu) return;
  closeHomeHistoryMenu();
  closeGpsSettingsPanel();
  renderHomeRoutesList();
  homeRoutesMenu.classList.add('active');
  homeRoutesMenu.setAttribute('aria-hidden', 'false');
  syncHomeGpsOverlayState();
}

function closeHomeRoutesMenu() {
  if (!homeRoutesMenu) return;
  homeRoutesMenu.classList.remove('active');
  homeRoutesMenu.setAttribute('aria-hidden', 'true');
  syncHomeGpsOverlayState();
}

function openGpsSettingsPanel() {
  if (!homeGpsSettingsPanel) return;
  closeHomeRoutesMenu();
  closeHomeHistoryMenu();
  // Sincronizar estado visual del toggle
  if (gpsScreenAlwaysOnToggle) {
    gpsScreenAlwaysOnToggle.setAttribute('aria-pressed', String(gpsScreenAlwaysOn));
  }
  homeGpsSettingsPanel.classList.add('active');
  homeGpsSettingsPanel.setAttribute('aria-hidden', 'false');
  syncHomeGpsOverlayState();
}

function closeGpsSettingsPanel() {
  if (!homeGpsSettingsPanel) return;
  homeGpsSettingsPanel.classList.remove('active');
  homeGpsSettingsPanel.setAttribute('aria-hidden', 'true');
  syncHomeGpsOverlayState();
}

function syncHomeGpsOverlayState() {
  if (!homeGpsPanel) return;
  const overlayOpen = Boolean(
    homeRoutesMenu?.classList.contains('active') ||
    homeHistoryMenu?.classList.contains('active') ||
    homeGpsSettingsPanel?.classList.contains('active')
  );
  homeGpsPanel.classList.toggle('overlay-open', overlayOpen);
}

function normalizeHomeMapType(value) {
  return HOME_MAP_TYPES.includes(value) ? value : 'streets';
}

function refreshHomeMapTypeButtons() {
  if (!homeMapTypeButtons?.length) return;
  const current = normalizeHomeMapType(homeMapType);
  homeMapTypeButtons.forEach((btn) => {
    const isActive = btn.dataset.mapType === current;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}

function createHomeMapTileLayers() {
  if (typeof L === 'undefined') return null;

  return {
    streets: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }),
    satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri'
    }),
    terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap'
    })
  };
}

function applyHomeMapType(value, { persist = true } = {}) {
  homeMapType = normalizeHomeMapType(value);
  if (persist) {
    localStorage.setItem(HOME_MAP_TYPE_KEY, homeMapType);
  }
  refreshHomeMapTypeButtons();

  if (!homeMap || typeof L === 'undefined') return;
  if (!homeMapTileLayers) {
    homeMapTileLayers = createHomeMapTileLayers();
  }
  if (!homeMapTileLayers) return;

  const selectedLayer = homeMapTileLayers[homeMapType] || homeMapTileLayers.streets;
  if (!selectedLayer) return;

  if (homeCurrentMapTileLayer && homeMap.hasLayer(homeCurrentMapTileLayer)) {
    homeMap.removeLayer(homeCurrentMapTileLayer);
  }

  selectedLayer.addTo(homeMap);
  homeCurrentMapTileLayer = selectedLayer;
}

function applyGpsScreenAlwaysOn(value) {
  gpsScreenAlwaysOn = value;
  localStorage.setItem('gpsScreenAlwaysOn', String(value));
  if (gpsScreenAlwaysOnToggle) {
    gpsScreenAlwaysOnToggle.setAttribute('aria-pressed', String(value));
  }
  if (value) {
    enableWakeLock();
  } else {
    disableWakeLock();
  }
}

function historyItemTemplate(item) {
  const dateLabel = new Date(item.createdAt).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  const distanceLabel = (item.distanceMeters / 1000).toFixed(2).replace('.', ',');
  const totalLabel = GPS.formatTime(item.elapsedSeconds);

  const splitRows = item.splitSeconds
    .map((secs, idx) => `<div class="home-history-split-row"><span>Km ${idx + 1}</span><strong>${GPS.formatTime(secs)}</strong></div>`)
    .join('');

  const partialRow = item.finalPartialMeters >= 120
    ? `<div class="home-history-split-row"><span>Final ${(item.finalPartialMeters / 1000).toFixed(2).replace('.', ',')} km</span><strong>${GPS.formatTime(item.finalPartialSeconds)}</strong></div>`
    : '';

  return `
    <article class="home-history-item">
      <div class="home-history-item-head">
        <div>
          <div class="home-history-item-title">${item.routeName}</div>
          <div class="home-history-item-meta">${dateLabel} · ${distanceLabel} km · ${item.activity}</div>
        </div>
        <div class="home-history-total">Total ${totalLabel}</div>
      </div>
      <div class="home-history-splits">${splitRows || '<div class="home-history-split-row"><span>Sin splits por km</span><strong>--</strong></div>'}${partialRow}</div>
    </article>
  `;
}

function renderHomeHistoryList() {
  if (!homeHistoryList) return;
  if (!homeRouteHistory.length) {
    homeHistoryList.innerHTML = '<div class="home-history-empty">Aun no hay entrenamientos guardados en el historial.</div>';
    return;
  }

  homeHistoryList.innerHTML = homeRouteHistory.map(historyItemTemplate).join('');
}

function getPlanDisplayName(planKey = planActual) {
  return {
    '30min': 'Corre 30 Minutos',
    '5k': 'Corre 5K',
    '10k': 'Plan 10K Personalizado',
    'fartlek': 'Entrenamiento Fartlek',
    'hiit': 'Entrenamiento HIIT',
    'trail': 'Trail Running',
    'sobrepeso': 'Principiantes con Sobrepeso',
    '20k': 'Plan 1/2 Maratón Personalizado',
    'maraton': 'Maratón 42K Personalizado'
  }[planKey] || 'Plan';
}

function ensureCurrentUserTrainingLog() {
  if (!currentUser) return [];
  if (!Array.isArray(currentUser.trainingLog)) {
    currentUser.trainingLog = [];
    users[currentUser.email] = currentUser;
    localStorage.setItem('runningTrainerUsers', JSON.stringify(users));
  }
  return currentUser.trainingLog;
}

function recordPlanCompletion(planKey, weekIndex, dayIndex, dayName, description) {
  const log = ensureCurrentUserTrainingLog();
  const existing = log.find((entry) =>
    entry?.type === 'plan' &&
    entry?.planKey === planKey &&
    Number(entry?.weekIndex) === Number(weekIndex) &&
    Number(entry?.dayIndex) === Number(dayIndex)
  );

  if (existing) {
    existing.completedAt = new Date().toISOString();
    existing.dayName = dayName;
    existing.description = description;
    return;
  }

  log.push({
    id: `planlog-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'plan',
    planKey,
    weekIndex,
    dayIndex,
    dayName,
    description,
    completedAt: new Date().toISOString()
  });
}

function removePlanCompletion(planKey, weekIndex, dayIndex) {
  const log = ensureCurrentUserTrainingLog();
  currentUser.trainingLog = log.filter((entry) => !(
    entry?.type === 'plan' &&
    entry?.planKey === planKey &&
    Number(entry?.weekIndex) === Number(weekIndex) &&
    Number(entry?.dayIndex) === Number(dayIndex)
  ));
}

function buildPlanEntriesForCalendar() {
  if (!currentUser?.progressData) return [];
  const log = ensureCurrentUserTrainingLog().filter((entry) => entry?.type === 'plan');
  const logByKey = new Map();

  log.forEach((entry) => {
    const key = `${entry.planKey}:${entry.weekIndex}:${entry.dayIndex}`;
    const prev = logByKey.get(key);
    if (!prev) {
      logByKey.set(key, entry);
      return;
    }
    const prevTs = new Date(prev.completedAt || 0).getTime();
    const nextTs = new Date(entry.completedAt || 0).getTime();
    if (nextTs > prevTs) {
      logByKey.set(key, entry);
    }
  });

  const entries = [];
  Object.entries(currentUser.progressData).forEach(([planKey, weeksObj]) => {
    Object.entries(weeksObj || {}).forEach(([weekKey, days]) => {
      const weekIndex = Number(String(weekKey).replace('semana', ''));
      if (!Array.isArray(days) || !Number.isFinite(weekIndex)) return;

      days.forEach((done, dayIndex) => {
        if (!done) return;
        const dayTuple = planes?.[planKey]?.[weekIndex]?.[dayIndex];
        const dayName = dayTuple?.[0] || `Día ${dayIndex + 1}`;
        const description = dayTuple?.[1] || 'Entrenamiento completado';
        if (isRestDay(description)) return;
        const logKey = `${planKey}:${weekIndex}:${dayIndex}`;
        const logEntry = logByKey.get(logKey);

        entries.push({
          source: 'plan',
          title: `${getPlanDisplayName(planKey)} · Semana ${weekIndex + 1} · ${dayName}`,
          meta: logEntry?.completedAt
            ? `${new Date(logEntry.completedAt).toLocaleString('es-ES')}`
            : 'Sin fecha exacta (registro anterior)',
          extra: description,
          timestamp: logEntry?.completedAt ? new Date(logEntry.completedAt).getTime() : 0
        });
      });
    });
  });

  return entries;
}

function buildFreeEntriesForCalendar() {
  return homeRouteHistory.map((item) => {
    const dateLabel = new Date(item.createdAt).toLocaleString('es-ES');
    const distance = (item.distanceMeters / 1000).toFixed(2).replace('.', ',');
    const total = GPS.formatTime(item.elapsedSeconds);
    return {
      source: 'libre',
      title: item.routeName || 'Ruta libre',
      meta: `${dateLabel} · ${distance} km`,
      extra: `Tiempo total ${total}`,
      timestamp: new Date(item.createdAt).getTime() || 0
    };
  });
}

function calendarTrainingItemTemplate(item) {
  const sourceLabel = item.source === 'plan' ? 'Plan' : 'Libre';
  return `
    <article class="calendar-log-item">
      <div class="calendar-log-item-head">
        <div>
          <p class="calendar-log-item-title">${item.title}</p>
          <div class="calendar-log-item-meta">${item.meta}</div>
        </div>
        <span class="calendar-log-type ${item.source}">${sourceLabel}</span>
      </div>
      <div class="calendar-log-item-extra">${item.extra}</div>
    </article>
  `;
}

function renderPerspectivas() {
  const list = document.getElementById('dailyHistoryList');
  if (!list) return;
  const history = JSON.parse(localStorage.getItem(HOME_DAILY_HISTORY_KEY) || '[]');
  if (history.length === 0) {
    list.innerHTML = '<p class="daily-history-empty">Sin registros todavía. Los datos se guardarán cada día automáticamente.</p>';
    return;
  }
  list.innerHTML = history.map(entry => {
    const dateStr = new Date(entry.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
    const steps = (entry.steps || 0).toLocaleString('es-ES');
    const km = (entry.distanceKm || 0).toFixed(2).replace('.', ',');
    const time = formatActiveTimeShort(entry.activeSeconds || 0);
    const kcal = (entry.calories || 0).toLocaleString('es-ES');
    return `<div class="daily-history-row">
      <span class="daily-history-date">${dateStr}</span>
      <span class="daily-history-stat"><strong>${steps}</strong><small>pasos</small></span>
      <span class="daily-history-stat"><strong>${km}</strong><small>km</small></span>
      <span class="daily-history-stat"><strong>${time}</strong><small>activo</small></span>
      <span class="daily-history-stat"><strong>${kcal}</strong><small>kcal</small></span>
    </div>`;
  }).join('');
}

function renderCalendarTrainingLog() {
  if (!calendarTrainingLogList) return;

  const unified = [...buildPlanEntriesForCalendar(), ...buildFreeEntriesForCalendar()]
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  if (!unified.length) {
    calendarTrainingLogList.innerHTML = '<div class="calendar-log-empty">Todavia no tienes entrenamientos registrados.</div>';
    return;
  }

  calendarTrainingLogList.innerHTML = unified.map(calendarTrainingItemTemplate).join('');
}

function openHomeHistoryMenu() {
  if (!homeHistoryMenu) return;
  closeHomeRoutesMenu();
  closeGpsSettingsPanel();
  renderHomeHistoryList();
  homeHistoryMenu.classList.add('active');
  homeHistoryMenu.setAttribute('aria-hidden', 'false');
  syncHomeGpsOverlayState();
}

function closeHomeHistoryMenu() {
  if (!homeHistoryMenu) return;
  homeHistoryMenu.classList.remove('active');
  homeHistoryMenu.setAttribute('aria-hidden', 'true');
  syncHomeGpsOverlayState();
}

function getCurrentGpsActivity() {
  const active = Array.from(homeGpsActivityTabs || []).find((tab) => tab.classList.contains('active'));
  const raw = active?.dataset?.gpsActivity || 'correr';
  return raw;
}

function saveHistoryFromSession(data) {
  const distanceMeters = Math.max(0, Math.round(Number(data?.distanceMeters) || 0));
  const elapsedSeconds = Math.max(0, Math.round(Number(data?.elapsedSeconds) || 0));
  if (distanceMeters < 50 || elapsedSeconds < 20) return;

  const splitSeconds = homeCurrentSplitSeconds.slice();
  const splitElapsed = splitSeconds.reduce((acc, secs) => acc + secs, 0);
  const fullKmDistance = splitSeconds.length * 1000;
  const finalPartialMeters = Math.max(0, distanceMeters - fullKmDistance);
  const finalPartialSeconds = Math.max(0, elapsedSeconds - splitElapsed);

  homeRouteHistory.unshift({
    id: `history-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    activity: getCurrentGpsActivity(),
    routeName: homeLoadedRoute?.name || 'Ruta libre',
    distanceMeters,
    elapsedSeconds,
    splitSeconds,
    finalPartialMeters,
    finalPartialSeconds
  });

  if (homeRouteHistory.length > 120) {
    homeRouteHistory.length = 120;
  }

  saveHomeRouteHistoryStorage();
  if (calendarView?.classList.contains('active')) {
    renderCalendarTrainingLog();
  }
}

function saveCurrentRecordedRoute() {
  ensureHomeDailyData();
  const points = (homeDailyData.routePositions || []).map(normalizeRoutePoint).filter(Boolean);
  if (points.length < 2) {
    showToast('No hay una ruta suficiente para guardar.', 'error');
    return;
  }

  const name = (homeRouteNameInput?.value || '').trim() || `Ruta ${new Date().toLocaleDateString('es-ES')}`;
  const route = {
    id: `route-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    createdAt: new Date().toISOString(),
    points,
    distanceKm: computeRouteDistanceKm(points)
  };

  homeSavedRoutes.unshift(route);
  saveHomeRoutesStorage();
  setLoadedRoute(route.id);
  if (homeRouteNameInput) homeRouteNameInput.value = '';
  showToast('Ruta guardada correctamente.', 'success');
}

function exportRoute(route) {
  if (!route) {
    showToast('No hay ruta activa para exportar.', 'error');
    return;
  }

  const payload = JSON.stringify(route, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = route.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.href = url;
  link.download = `${safeName || 'ruta'}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function routeToGpx(route) {
  const pointsXml = (route?.points || [])
    .map((p) => `<trkpt lat="${p.lat}" lon="${p.lon}"></trkpt>`)
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="RunningTrainer" xmlns="http://www.topografix.com/GPX/1/1">\n  <trk>\n    <name>${route?.name || 'Ruta'}</name>\n    <trkseg>${pointsXml}</trkseg>\n  </trk>\n</gpx>`;
}

function exportRouteAsGpx(route) {
  if (!route) {
    showToast('No hay ruta activa para exportar.', 'error');
    return;
  }

  const payload = routeToGpx(route);
  const blob = new Blob([payload], { type: 'application/gpx+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = route.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  link.href = url;
  link.download = `${safeName || 'ruta'}.gpx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function parseGpxPoints(text) {
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  const trkPoints = Array.from(xml.querySelectorAll('trkpt'));
  const points = trkPoints
    .map((node) => normalizeRoutePoint({ lat: node.getAttribute('lat'), lon: node.getAttribute('lon') }))
    .filter(Boolean);
  return points;
}

async function importRouteFromFile(file) {
  const text = await file.text();
  let route = null;

  if (file.name.toLowerCase().endsWith('.gpx')) {
    const points = parseGpxPoints(text);
    route = {
      id: `route-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name.replace(/\.gpx$/i, ''),
      createdAt: new Date().toISOString(),
      points,
      distanceKm: computeRouteDistanceKm(points)
    };
  } else {
    const parsed = JSON.parse(text);
    const points = (parsed?.points || []).map(normalizeRoutePoint).filter(Boolean);
    route = {
      id: `route-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: parsed?.name || file.name.replace(/\.json$/i, ''),
      createdAt: new Date().toISOString(),
      points,
      distanceKm: computeRouteDistanceKm(points)
    };
  }

  if (!route.points || route.points.length < 2) {
    throw new Error('Ruta invalida');
  }

  homeSavedRoutes.unshift(route);
  saveHomeRoutesStorage();
  setLoadedRoute(route.id);
  showToast('Ruta importada correctamente.', 'success');
}

function announceSplitPerKm(data) {
  if (!homeRouteIsRecording) return;
  if (!data || !Number.isFinite(data.distanceMeters) || !Number.isFinite(data.elapsedSeconds)) return;

  while (data.distanceMeters >= homeNextSplitKm * 1000) {
    const splitSecs = data.elapsedSeconds - homePrevSplitElapsed;
    homeCurrentSplitSeconds.push(Math.max(0, splitSecs));
    const splitLabel = GPS.formatTime(Math.max(0, splitSecs));
    const msg = `Kilometro ${homeNextSplitKm} en ${splitLabel}`;
    showToast(msg, 'success');
    speakGpsMessage(msg);
    homePrevSplitElapsed = data.elapsedSeconds;
    homeNextSplitKm += 1;
  }
}

function normalizeBearingDelta(delta) {
  let d = delta;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function findNearestRouteIndex(current, points, fromIndex = 0) {
  const start = Math.max(0, fromIndex - 8);
  const end = Math.min(points.length - 1, fromIndex + 60);
  let bestIdx = fromIndex;
  let bestDist = Number.POSITIVE_INFINITY;

  for (let i = start; i <= end; i++) {
    const p = points[i];
    const d = haversineDistanceMeters(current.lat, current.lon, p.lat, p.lon);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }

  return { bestIdx, bestDist };
}

function computeRouteProgressFromIndex(idx) {
  if (!homeLoadedRouteTotalMeters || !homeLoadedRouteCumulativeMeters.length) return null;
  const clampedIdx = Math.max(0, Math.min(homeLoadedRouteCumulativeMeters.length - 1, idx));
  const coveredMeters = homeLoadedRouteCumulativeMeters[clampedIdx];
  const remainingMeters = Math.max(0, homeLoadedRouteTotalMeters - coveredMeters);
  const percent = homeLoadedRouteTotalMeters > 0 ? (coveredMeters / homeLoadedRouteTotalMeters) * 100 : 0;
  return { coveredMeters, remainingMeters, percent };
}

function getTurnInstruction(current, points, nearestIdx) {
  const maxLookAhead = Math.min(points.length - 4, nearestIdx + 40);
  for (let i = nearestIdx + 4; i <= maxLookAhead; i++) {
    const a0 = points[Math.max(0, i - 4)];
    const a1 = points[i];
    const b1 = points[Math.min(points.length - 1, i + 4)];
    if (!a0 || !a1 || !b1) continue;

    const bearingA = bearingDegrees(a0.lat, a0.lon, a1.lat, a1.lon);
    const bearingB = bearingDegrees(a1.lat, a1.lon, b1.lat, b1.lon);
    const delta = normalizeBearingDelta(bearingB - bearingA);
    const absDelta = Math.abs(delta);

    if (absDelta < 28) continue;

    const metersToTurn = Math.round(haversineDistanceMeters(current.lat, current.lon, a1.lat, a1.lon));
    const side = delta > 0 ? 'derecha' : 'izquierda';
    const level = absDelta > 70 ? 'fuerte' : 'suave';

    if (metersToTurn > 45) {
      const rounded = Math.max(20, Math.round(metersToTurn / 10) * 10);
      return `En ${rounded} metros gira ${level} a la ${side}`;
    }

    return `Gira ${level} a la ${side}`;
  }

  const nextIdx = Math.min(points.length - 1, nearestIdx + 8);
  const nextPoint = points[nextIdx];
  if (!nextPoint) return null;
  const heading = bearingDegrees(current.lat, current.lon, nextPoint.lat, nextPoint.lon);
  return `Sigue recto hacia ${bearingToDirectionLabel(heading)}`;
}

function updateRouteGuidance(data) {
  if (!homeRouteIsRecording || !homeLoadedRoute?.points?.length) return;
  const positions = data?.positions || [];
  if (!positions.length) return;

  announceSplitPerKm(data);

  const now = Date.now();
  const current = positions[positions.length - 1];
  const points = homeLoadedRoute.points;
  const { bestIdx, bestDist } = findNearestRouteIndex(current, points, homeGuidanceRouteIndex);

  homeGuidanceRouteIndex = Math.max(homeGuidanceRouteIndex, bestIdx);
  updateGpsProgressCard(computeRouteProgressFromIndex(homeGuidanceRouteIndex));

  if (bestDist > 45 && now - homeLastOffRouteTs > 15000) {
    homeLastOffRouteTs = now;
    const msg = 'Te alejaste de la ruta. Intenta volver al trazado.';
    showToast(msg, 'error');
    speakGpsMessage(msg);
  }

  if (now - homeLastGuidanceTs < 12000) return;

  const msg = getTurnInstruction(current, points, homeGuidanceRouteIndex);
  if (!msg) return;
  if (msg === homeLastGuidanceMessage && now - homeLastGuidanceTs < 20000) return;

  homeLastGuidanceMessage = msg;
  homeLastGuidanceTs = now;
  showToast(msg, 'success');
  speakGpsMessage(msg);

  if (!homeFinishAnnounced && homeGuidanceRouteIndex >= points.length - 4) {
    homeFinishAnnounced = true;
    const finishMsg = 'Ruta completada.';
    showToast(finishMsg, 'success');
    speakGpsMessage(finishMsg);
  }
}

function openHomeGpsPanel(initialCoords) {
  if (!homeGpsPanel) return;
  document.body.classList.add('home-gps-open');
  homeGpsPanel.classList.add('active');
  homeGpsPanel.setAttribute('aria-hidden', 'false');

  if (!initialCoords) return;

  initHomeMap(initialCoords);
  requestAnimationFrame(() => {
    if (homeMap) {
      homeMap.invalidateSize();
      homeMap.setView([initialCoords.lat, initialCoords.lon], 16);
    }
  });
}

function closeHomeGpsPanel() {
  if (!homeGpsPanel) return;
  document.body.classList.remove('home-gps-open');
  homeGpsPanel.classList.remove('active');
  homeGpsPanel.classList.remove('overlay-open');
  homeGpsPanel.setAttribute('aria-hidden', 'true');
  closeHomeRoutesMenu();
  closeHomeHistoryMenu();
  closeGpsSettingsPanel();
  setHomeGpsStatus('');
}

function renderHomeRouteOnMap(shouldFitBounds = false) {
  if (!homeMap || !homeRoutePolyline) return;
  ensureHomeDailyData();

  const latLngs = (homeDailyData.routePositions || []).map((p) => [p.lat, p.lon]);
  homeRoutePolyline.setLatLngs(latLngs);

  if (latLngs.length > 0) {
    const last = latLngs[latLngs.length - 1];
    if (!homeRouteMarker) {
      homeRouteMarker = L.circleMarker(last, {
        radius: 7,
        color: '#ffffff',
        weight: 2,
        fillColor: '#0ea5e9',
        fillOpacity: 1
      }).addTo(homeMap);
    } else {
      homeRouteMarker.setLatLng(last);
    }

    if (shouldFitBounds) {
      const bounds = L.latLngBounds(latLngs);
      homeMap.fitBounds(bounds.pad(0.25));
    }
  }
}

function initHomeMap(initialCoords) {
  if (!initialCoords || !document.getElementById('homeRouteMap') || typeof L === 'undefined') return;

  if (homeMap) {
    homeMap.setView([initialCoords.lat, initialCoords.lon], 16);
    renderHomeRouteOnMap(true);
    return;
  }

  homeMap = L.map('homeRouteMap', { zoomControl: true }).setView([initialCoords.lat, initialCoords.lon], 16);
  homeMapTileLayers = createHomeMapTileLayers();
  homeCurrentMapTileLayer = null;
  applyHomeMapType(homeMapType, { persist: false });

  homeRoutePolyline = L.polyline([], {
    color: '#0ea5e9',
    weight: 5,
    opacity: 0.85,
    lineJoin: 'round'
  }).addTo(homeMap);

  homeLoadedRoutePolyline = L.polyline([], {
    color: '#f59e0b',
    weight: 4,
    opacity: 0.85,
    lineJoin: 'round',
    dashArray: '8, 8'
  }).addTo(homeMap);

  renderHomeRouteOnMap(true);
  drawLoadedRouteOnMap();
}

function setHomeRouteButtonsState() {
  if (homeStartRouteBtn) homeStartRouteBtn.disabled = homeRouteIsRecording;
  if (homeStopRouteBtn) homeStopRouteBtn.disabled = !homeRouteIsRecording;
  if (homeGpsFabStartBtn) {
    homeGpsFabStartBtn.classList.toggle('recording', homeRouteIsRecording);
    const iconEl = homeGpsFabStartBtn.querySelector('.home-gps-fab-icon');
    const labelEl = homeGpsFabStartBtn.querySelector('.home-gps-fab-label');
    if (iconEl) {
      iconEl.textContent = homeRouteIsRecording ? '■' : '▶';
    }
    if (labelEl) {
      labelEl.textContent = homeRouteIsRecording ? 'Detener' : 'Comenzar';
    }
    homeGpsFabStartBtn.setAttribute('aria-pressed', homeRouteIsRecording ? 'true' : 'false');
  }
}

function applyHomeGpsData(data) {
  ensureHomeDailyData();
  homeDailyData.gpsActiveSeconds = _gpsSessionBaseSeconds + (data.elapsedSeconds || 0);
  homeDailyData.activeSeconds = (homeDailyData.gpsActiveSeconds || 0) + (homeDailyData.stepActiveSeconds || 0);
  homeDailyData.distanceKm = _gpsSessionBaseDistanceKm + (data.distanceKm || 0);
  homeDailyData.stepsDistance = Math.round((homeDailyData.distanceKm * 1000) / 0.78);
  homeDailyData.routePositions = data.positions || [];
  renderHomeRouteOnMap(false);
  renderHomeDashboard();
  updateRouteGuidance(data);

  if (!homeLoadedRoute) {
    resetGpsProgressCard();
  }
}

async function startHomeRouteRecording() {
  if (homeRouteIsRecording) return;

  if (window.GPS?.isTracking && GPS.isTracking()) {
    showToast('Ya hay otro seguimiento GPS activo.', 'error');
    return;
  }

  ensureHomeDailyData();
  _gpsSessionBaseSeconds = homeDailyData.gpsActiveSeconds || 0;
  _gpsSessionBaseDistanceKm = homeDailyData.distanceKm || 0;

  const started = await GPS.start((data) => {
    applyHomeGpsData(data);
  });

  if (!started) return;

  homeRouteIsRecording = true;
  homeNextSplitKm = 1;
  homePrevSplitElapsed = 0;
  homeLastGuidanceTs = 0;
  homeLastOffRouteTs = 0;
  homeGuidanceRouteIndex = 0;
  homeFinishAnnounced = false;
  homeCurrentSplitSeconds = [];
  setHomeRouteButtonsState();
  showToast(homeLoadedRoute ? `Guiado iniciado: ${homeLoadedRoute.name}` : 'Grabación de ruta iniciada.', 'success');

  if (homeTimerTickInterval) clearInterval(homeTimerTickInterval);
  homeTimerTickInterval = setInterval(() => {
    if (!homeRouteIsRecording) return;
    applyHomeGpsData(GPS.getData());
  }, 1000);
}

function stopHomeRouteRecording() {
  if (!homeRouteIsRecording) return;

  const data = GPS.stop();
  homeRouteIsRecording = false;
  setHomeRouteButtonsState();
  if (homeTimerTickInterval) {
    clearInterval(homeTimerTickInterval);
    homeTimerTickInterval = null;
  }

  applyHomeGpsData(data);
  renderHomeRouteOnMap(true);
  saveHistoryFromSession(data);

  if (!homeLoadedRoute && (data.positions || []).length > 3) {
    const shouldSave = window.confirm('Quieres guardar esta ruta para volver a usarla?');
    if (shouldSave) {
      if (homeRouteNameInput) {
        homeRouteNameInput.value = `Ruta ${new Date().toLocaleDateString('es-ES')}`;
      }
      saveCurrentRecordedRoute();
      openHomeRoutesMenu();
    }
  }

  showToast('Ruta detenida.', 'success');
}

function centerHomeMap() {
  if (!homeMap) return;
  ensureHomeDailyData();

  if (homeLoadedRoute?.points?.length > 1) {
    const loadedBounds = L.latLngBounds(homeLoadedRoute.points.map((p) => [p.lat, p.lon]));
    homeMap.fitBounds(loadedBounds.pad(0.18));
    return;
  }

  const routePoints = homeDailyData.routePositions || [];
  if (routePoints.length > 1) {
    renderHomeRouteOnMap(true);
    return;
  }

  if (window.GPS?.isSupported && GPS.isSupported()) {
    GPS.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 })
      .then((pos) => homeMap.setView([pos.coords.latitude, pos.coords.longitude], 16))
      .catch(() => homeMap.setView([40.4168, -3.7038], 13));
  } else {
    homeMap.setView([40.4168, -3.7038], 13);
  }
}

function initHomeDashboard() {
  ensureHomeDailyData();
  renderHomeDashboard();
  setHomeRouteButtonsState();
  enableHomeMotionTracking({ silent: true });

  if (homeOpenGpsPanelBtn && !homeOpenGpsPanelBtn.dataset.bound) {
    homeOpenGpsPanelBtn.dataset.bound = '1';
    homeOpenGpsPanelBtn.addEventListener('click', async () => {
      openHomeGpsPanel();
      setHomeGpsStatus('Solicitando permiso GPS...', 'info');

      const geoResult = await requestGeoPermissionOnce();
      if (geoResult.coords) {
        setHomeGpsStatus('');
        openHomeGpsPanel(geoResult.coords);
      } else {
        setHomeGpsStatus(geoResult.message || 'No se pudo obtener la ubicacion.', 'error');
      }
    });
  }

  if (homeCloseGpsPanelBtn && !homeCloseGpsPanelBtn.dataset.bound) {
    homeCloseGpsPanelBtn.dataset.bound = '1';
    homeCloseGpsPanelBtn.addEventListener('click', closeHomeGpsPanel);
  }

  if (homeGpsTopInicioBtn && !homeGpsTopInicioBtn.dataset.bound) {
    homeGpsTopInicioBtn.dataset.bound = '1';
    homeGpsTopInicioBtn.addEventListener('click', closeHomeGpsPanel);
  }

  if (homeGpsTopGpsBtn && !homeGpsTopGpsBtn.dataset.bound) {
    homeGpsTopGpsBtn.dataset.bound = '1';
    homeGpsTopGpsBtn.addEventListener('click', () => {
      if (!homeGpsPanel.classList.contains('active')) return;
      requestAnimationFrame(() => {
        if (homeMap) homeMap.invalidateSize();
      });
    });
  }

  if (homeGpsSettingsBtn && !homeGpsSettingsBtn.dataset.bound) {
    homeGpsSettingsBtn.dataset.bound = '1';
    homeGpsSettingsBtn.addEventListener('click', openGpsSettingsPanel);
  }

  if (homeGpsSettingsPanelCloseBtn && !homeGpsSettingsPanelCloseBtn.dataset.bound) {
    homeGpsSettingsPanelCloseBtn.dataset.bound = '1';
    homeGpsSettingsPanelCloseBtn.addEventListener('click', closeGpsSettingsPanel);
  }

  if (gpsScreenAlwaysOnToggle && !gpsScreenAlwaysOnToggle.dataset.bound) {
    gpsScreenAlwaysOnToggle.dataset.bound = '1';
    gpsScreenAlwaysOnToggle.setAttribute('aria-pressed', String(gpsScreenAlwaysOn));
    gpsScreenAlwaysOnToggle.addEventListener('click', () => {
      applyGpsScreenAlwaysOn(!gpsScreenAlwaysOn);
    });
  }

  if (homeMapTypeButtons.length > 0 && !homeMapTypeButtons[0].dataset.bound) {
    homeMapTypeButtons.forEach((btn) => {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        applyHomeMapType(btn.dataset.mapType || 'streets');
      });
    });
  }
  refreshHomeMapTypeButtons();

  if (homeGpsAudioBtn && !homeGpsAudioBtn.dataset.bound) {
    homeGpsAudioBtn.dataset.bound = '1';
    homeGpsAudioBtn.addEventListener('click', async () => {
      const modeOrder = ['on', 'success', 'motivation', 'off'];
      const currentIndex = modeOrder.indexOf(soundMode);
      const nextMode = modeOrder[(currentIndex + 1) % modeOrder.length];
      await setSoundMode(nextMode, document.querySelectorAll('.sound-option'), true);
    });
  }

  if (homeGpsHistoryBtn && !homeGpsHistoryBtn.dataset.bound) {
    homeGpsHistoryBtn.dataset.bound = '1';
    homeGpsHistoryBtn.addEventListener('click', () => {
      openHomeHistoryMenu();
    });
  }

  if (homeHistoryCloseBtn && !homeHistoryCloseBtn.dataset.bound) {
    homeHistoryCloseBtn.dataset.bound = '1';
    homeHistoryCloseBtn.addEventListener('click', closeHomeHistoryMenu);
  }

  if (homeGpsSettingsPanel && !homeGpsSettingsPanel.dataset.bound) {
    homeGpsSettingsPanel.dataset.bound = '1';
  }

  if (homeHistoryClearBtn && !homeHistoryClearBtn.dataset.bound) {
    homeHistoryClearBtn.dataset.bound = '1';
    homeHistoryClearBtn.addEventListener('click', () => {
      const ok = window.confirm('Quieres borrar todo el historial GPS?');
      if (!ok) return;
      homeRouteHistory = [];
      saveHomeRouteHistoryStorage();
      renderHomeHistoryList();
      if (calendarView?.classList.contains('active')) {
        renderCalendarTrainingLog();
      }
      showToast('Historial GPS borrado.', 'success');
    });
  }

  if (homeGpsFabStartBtn && !homeGpsFabStartBtn.dataset.bound) {
    homeGpsFabStartBtn.dataset.bound = '1';
    homeGpsFabStartBtn.addEventListener('click', () => {
      if (homeRouteIsRecording) {
        stopHomeRouteRecording();
      } else {
        startHomeRouteRecording();
      }
    });
  }

  if (homeGpsActivityTabs.length > 0 && !homeGpsActivityTabs[0].dataset.bound) {
    homeGpsActivityTabs.forEach((btn) => {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        homeGpsActivityTabs.forEach((tab) => tab.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  if (homeStartRouteBtn && !homeStartRouteBtn.dataset.bound) {
    homeStartRouteBtn.dataset.bound = '1';
    homeStartRouteBtn.addEventListener('click', startHomeRouteRecording);
  }

  if (homeStopRouteBtn && !homeStopRouteBtn.dataset.bound) {
    homeStopRouteBtn.dataset.bound = '1';
    homeStopRouteBtn.addEventListener('click', stopHomeRouteRecording);
  }

  if (homeCenterRouteBtn && !homeCenterRouteBtn.dataset.bound) {
    homeCenterRouteBtn.dataset.bound = '1';
    homeCenterRouteBtn.addEventListener('click', openHomeRoutesMenu);
  }

  if (homeRoutesCloseBtn && !homeRoutesCloseBtn.dataset.bound) {
    homeRoutesCloseBtn.dataset.bound = '1';
    homeRoutesCloseBtn.addEventListener('click', closeHomeRoutesMenu);
  }

  if (homeRouteImportBtn && !homeRouteImportBtn.dataset.bound) {
    homeRouteImportBtn.dataset.bound = '1';
    homeRouteImportBtn.addEventListener('click', () => {
      homeRouteImportInput?.click();
    });
  }

  if (homeRouteImportInput && !homeRouteImportInput.dataset.bound) {
    homeRouteImportInput.dataset.bound = '1';
    homeRouteImportInput.addEventListener('change', handleRouteImportInputChange);
  }

  if (myRoutesImportBtn && !myRoutesImportBtn.dataset.bound) {
    myRoutesImportBtn.dataset.bound = '1';
    myRoutesImportBtn.addEventListener('click', () => {
      myRoutesImportInput?.click();
    });
  }

  if (myRoutesImportInput && !myRoutesImportInput.dataset.bound) {
    myRoutesImportInput.dataset.bound = '1';
    myRoutesImportInput.addEventListener('change', handleRouteImportInputChange);
  }

  if (myRoutesClearActiveBtn && !myRoutesClearActiveBtn.dataset.bound) {
    myRoutesClearActiveBtn.dataset.bound = '1';
    myRoutesClearActiveBtn.addEventListener('click', () => {
      setLoadedRoute(null);
      showToast('Ruta activa eliminada.', 'success');
    });
  }

  if (homeRouteExportBtn && !homeRouteExportBtn.dataset.bound) {
    homeRouteExportBtn.dataset.bound = '1';
    homeRouteExportBtn.addEventListener('click', () => {
      exportRoute(homeLoadedRoute);
    });
  }

  if (homeRouteExportGpxBtn && !homeRouteExportGpxBtn.dataset.bound) {
    homeRouteExportGpxBtn.dataset.bound = '1';
    homeRouteExportGpxBtn.addEventListener('click', () => {
      exportRouteAsGpx(homeLoadedRoute);
    });
  }

  if (homeRouteCenterBtn && !homeRouteCenterBtn.dataset.bound) {
    homeRouteCenterBtn.dataset.bound = '1';
    homeRouteCenterBtn.addEventListener('click', centerHomeMap);
  }

  if (homeRouteClearLoadedBtn && !homeRouteClearLoadedBtn.dataset.bound) {
    homeRouteClearLoadedBtn.dataset.bound = '1';
    homeRouteClearLoadedBtn.addEventListener('click', () => {
      setLoadedRoute(null);
      showToast('Ruta activa eliminada.', 'success');
    });
  }

  if (homeRouteSaveCurrentBtn && !homeRouteSaveCurrentBtn.dataset.bound) {
    homeRouteSaveCurrentBtn.dataset.bound = '1';
    homeRouteSaveCurrentBtn.addEventListener('click', saveCurrentRecordedRoute);
  }

  if (homeRoutesList && !homeRoutesList.dataset.bound) {
    homeRoutesList.dataset.bound = '1';
    homeRoutesList.addEventListener('click', (event) => {
      handleRoutesListClick(event, { closeMenuOnLoad: true });
    });
  }

  if (myRoutesList && !myRoutesList.dataset.bound) {
    myRoutesList.dataset.bound = '1';
    myRoutesList.addEventListener('click', (event) => {
      handleRoutesListClick(event, { closeMenuOnLoad: false });
    });
  }

  if (myRoutesSearch) {
    myRoutesSearch.addEventListener('input', () => {
      myRoutesPage = 1;
      renderMyRoutesList();
    });
  }

  loadHomeRoutesStorage();
  loadHomeRouteHistoryStorage();
  renderAllRoutesLists();
}

// Inicializar event listeners
function initEventListeners() {
  // Toggle visibilidad de contraseña
  document.querySelectorAll('.password-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const wrapper = btn.closest('.password-wrapper');
      const input = wrapper.querySelector('input');
      const eyeIcon = btn.querySelector('.eye-icon');
      const eyeOffIcon = btn.querySelector('.eye-off-icon');
      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      eyeIcon.style.display = isHidden ? 'none' : '';
      eyeOffIcon.style.display = isHidden ? '' : 'none';
    });
  });

  // Cambiar entre pestañas de login/registro
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  });

  registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  });

  // Dark Mode Toggle
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }

  if (profileMinStepsInput && !profileMinStepsInput.dataset.bound) {
    profileMinStepsInput.dataset.bound = '1';
    profileMinStepsInput.addEventListener('change', () => {
      if (!currentUser) return;
      const parsed = Number(profileMinStepsInput.value?.trim());
      if (!Number.isFinite(parsed) || parsed < 1000 || parsed > 50000) {
        showToast('El objetivo debe estar entre 1.000 y 50.000 pasos.', 'error');
        return;
      }
      currentUser.homeStepsGoal = normalizeHomeStepsGoal(parsed);
      saveUserData();
      renderHomeDashboard();
      updateProfileModal();
      showToast('Objetivo de pasos actualizado.', 'success');
    });
  }

  if (profileExportBtn) {
    profileExportBtn.addEventListener('click', exportUserBackup);
  }

  if (profileImportBtn && profileImportInput) {
    profileImportBtn.addEventListener('click', () => profileImportInput.click());
    profileImportInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (file) await importUserBackup(file);
      e.target.value = '';
    });
  }

  function savePedometerIfValid() {
    if (!currentUser) return;
    const upper = Number(profilePedometerUpper?.value);
    const lower = Number(profilePedometerLower?.value);
    if (!Number.isFinite(upper) || upper < 8 || upper > 20) {
      showToast('Umbral alto debe estar entre 8 y 20.', 'error');
      return;
    }
    if (!Number.isFinite(lower) || lower < 6 || lower > 18) {
      showToast('Umbral bajo debe estar entre 6 y 18.', 'error');
      return;
    }
    if (lower >= upper) {
      showToast('El umbral bajo debe ser menor que el alto.', 'error');
      return;
    }
    currentUser.pedometerUpper = upper;
    currentUser.pedometerLower = lower;
    saveUserData();
    showToast('Sensibilidad del pedómetro guardada.', 'success');
  }

  if (profilePedometerUpper && !profilePedometerUpper.dataset.bound) {
    profilePedometerUpper.dataset.bound = '1';
    profilePedometerUpper.addEventListener('change', savePedometerIfValid);
  }

  if (profilePedometerLower && !profilePedometerLower.dataset.bound) {
    profilePedometerLower.dataset.bound = '1';
    profilePedometerLower.addEventListener('change', savePedometerIfValid);
  }

  // Controles de sonido mejorados
  const soundOptions = document.querySelectorAll('.sound-option');
  soundOptions.forEach(option => {
    option.addEventListener('click', async (e) => {
      const nextSoundMode = e.currentTarget.dataset.sound;
      await setSoundMode(nextSoundMode, soundOptions, true);
    });
  });

  // Establecer opción de sonido activa
  renderSoundOptions(soundOptions);

  // Registrar nuevo usuario
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = normalizeEmail(document.getElementById('registerEmail').value);
    const password = document.getElementById('registerPassword').value;
    const level = document.getElementById('registerLevel').value;

    if (!isValidEmail(email)) {
      showToast('Ingresa un correo electronico valido', 'error');
      return;
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      showToast(passwordValidation.message, 'error');
      return;
    }
    
    if (users[email]) {
      showToast('Este correo ya está registrado', 'error');
      return;
    }

    try {
      const securedPassword = await buildSecuredPassword(password);
      const useLegacyPasswordFallback = !securedPassword;
      
      // Crear nuevo usuario
      const newUser = {
        name,
        email,
        passwordHash: securedPassword?.passwordHash,
        passwordSalt: securedPassword?.passwordSalt,
        passwordAlgo: securedPassword?.passwordAlgo,
        passwordIterations: securedPassword?.passwordIterations,
        authSchemaVersion: securedPassword ? AUTH_CONFIG.schemaVersion : 1,
        ...(useLegacyPasswordFallback ? { password } : {}),
        level,
        xp: 0,
        progressData: {},
        trainingLog: [],
        createdAt: new Date().toISOString()
      };

      users[email] = newUser;
      localStorage.setItem("runningTrainerUsers", JSON.stringify(users));

      if (useLegacyPasswordFallback) {
        showToast('Seguridad limitada: el navegador no soporta cifrado moderno', 'error');
      }
      
      // Iniciar sesión directamente sin re-verificar contraseña
      currentUser = newUser;
      localStorage.setItem("currentUser", email);
      
      authContainer.classList.add('hidden');
      
      updateUserInterface();
      initApp();
      
      showToast(`¡Bienvenido/a, ${name}! Tu cuenta ha sido creada`, 'success');
      activateWakeLockIfNeeded();
      setTimeout(() => { if (window.STRAVA) STRAVA.init(); }, 200);
    } catch (err) {
      console.error('Error durante el registro:', err);
      showToast('Error al crear la cuenta. Inténtalo de nuevo.', 'error');
    }
  });

  // Iniciar sesión
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = normalizeEmail(document.getElementById('loginEmail').value);
    const password = document.getElementById('loginPassword').value;
    
    await loginUser(email, password);
  });

  // Cerrar sesión
  logoutBtn.addEventListener('click', () => {
    if (homeRouteIsRecording) {
      stopHomeRouteRecording();
    }
    closeHomeGpsPanel();
    if (profileModal) {
      profileModal.classList.remove('active');
    }
    currentUser = null;
    disableWakeLock();
    localStorage.removeItem("currentUser");
    
    userBar.classList.remove("visible");

    authContainer.classList.remove('hidden');
    
    showToast('Sesión cerrada correctamente', 'success');
  });

  // Ir a la vista de perfil
  profileBtn.addEventListener('click', () => {
    bottomNav?.querySelector('[data-nav="yo"]')?.click();
  });

  // Cambiar foto de perfil
  if (profileAvatar) {
    profileAvatar.addEventListener('click', () => {
      if (profilePhotoInput) profilePhotoInput.click();
    });
  }

  if (profilePhotoInput) {
    profilePhotoInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64Photo = event.target?.result;
          if (currentUser && typeof base64Photo === 'string') {
            currentUser.profilePhoto = base64Photo;
            saveUserData();
            updateUserInterface();
            updateProfileModal();
            showToast('Foto de perfil actualizada', 'success');
          }
        };
        reader.readAsDataURL(file);
      }
      e.target.value = '';
    });
  }

  // closeProfileModalBtn solo existe si el perfil está en modal; en la versión actual es una vista de nav, no se necesita.

  // Event Listeners del temporizador
  closeTimerModalBtn.addEventListener('click', closeTimerModal);
  timerModal.addEventListener('click', (e) => {
      if (e.target === timerModal) closeTimerModal();
  });
  startBtn.addEventListener('click', startTimer);
  pauseBtn.addEventListener('click', pauseTimer);
  resetBtn.addEventListener('click', resetTimer);
  
  // Cerrar modales con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    if (timerModal.classList.contains('active')) {
      closeTimerModal();
      return;
    }

    const distModal = document.getElementById('distanceModal');
    if (distModal && distModal.classList.contains('active')) {
      closeDistanceModal();
    }
  });

  window.addEventListener('resize', handleWeeksContainerPlacement);
  window.addEventListener('orientationchange', updateHomeFitHeight, { passive: true });
  initHomeDashboard();
  updateHomeFitHeight();
  initBottomNavigation();
}

function initBottomNavigation() {
  if (!bottomNav) return;

  const sectionByNav = {
    inicio: homeView,
    entrenamientos: trainingView,
    'mis-rutas': myRoutesView,
    calendario: calendarView,
    yo: profileModal
  };

  const NAV_ORDER = ['inicio', 'entrenamientos', 'mis-rutas', 'calendario', 'yo'];

  function moveIndicator(idx) {
    const indicator = document.getElementById('bottomNavIndicator');
    if (!indicator || !bottomNav) return;
    const navWidth = bottomNav.offsetWidth;
    const colWidth = navWidth / NAV_ORDER.length;
    const pillWidth = indicator.offsetWidth || 36;
    indicator.style.transform = `translateX(${idx * colWidth + (colWidth - pillWidth) / 2}px)`;
  }

  function setActiveBottomNav(navKey) {
    bottomNav.querySelectorAll('.bottom-nav-btn').forEach((btn) => {
      const isActive = btn.dataset.nav === navKey;
      btn.classList.toggle('active', isActive);
      if (isActive) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    });
    const idx = NAV_ORDER.indexOf(navKey);
    moveIndicator(idx >= 0 ? idx : 0);
  }

  function showAppView(navKey) {
    Object.entries(sectionByNav).forEach(([key, section]) => {
      if (!section) return;
      const isActive = key === navKey;
      section.classList.toggle('active', isActive);
    });

    if (navKey === 'inicio') {
      document.body.classList.add('home-fit-lock');
      updateHomeFitHeight();
    } else {
      document.body.classList.remove('home-fit-lock');
    }

    setActiveBottomNav(navKey);

    if (navKey === 'yo') {
      updateProfileModal();
      checkBadges();
      renderBadges();
    }

    if (navKey === 'calendario') {
      requestAnimationFrame(() => {
        updateChart();
        renderCalendarTrainingLog();
        renderPerspectivas();
      });
    }

    if (navKey === 'mis-rutas') {
      closeHomeRoutesMenu();
      closeHomeHistoryMenu();
      renderMyRoutesList(true);
    }

    if (navKey === 'inicio') {
      initHomeDashboard();
      requestAnimationFrame(() => {
        if (homeMap) homeMap.invalidateSize();
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  bottomNav.addEventListener('click', (event) => {
    const button = event.target.closest('.bottom-nav-btn');
    if (!button) return;

    const navKey = button.dataset.nav;
    if (!navKey) return;

    if (navKey === 'yo') {
      if (!currentUser) {
        authContainer.classList.remove('hidden');
        showToast('Inicia sesion para ver tu perfil', 'error');
        return;
      }
    }

    showAppView(navKey);
  });

  window.addEventListener('resize', () => {
    const activeButton = bottomNav.querySelector('.bottom-nav-btn.active');
    const activeNavKey = activeButton?.dataset.nav || 'inicio';
    setActiveBottomNav(activeNavKey);
    updateHomeFitHeight();
  }, { passive: true });

  showAppView('inicio');
  requestAnimationFrame(() => moveIndicator(0));
}

function updateHomeFitHeight() {
  if (!homeView) return;

  const header = document.querySelector('.app-header');
  const main = document.querySelector('.app-main-content');
  const nav = bottomNav;

  const viewportHeight = window.innerHeight;
  const headerHeight = header ? header.offsetHeight : 0;
  const navHeight = nav ? nav.offsetHeight : 0;
  const mainTopPadding = main ? parseFloat(getComputedStyle(main).paddingTop || '0') : 0;
  const userBarHeight = userBar?.classList.contains('visible') ? userBar.offsetHeight : 0;

  const available = Math.max(260, viewportHeight - headerHeight - navHeight - mainTopPadding - userBarHeight - 8);
  document.documentElement.style.setProperty('--home-fit-height', `${available}px`);
}

function toggleDarkMode() {
  darkMode = !darkMode;
  localStorage.setItem('darkMode', darkMode);
  applyDarkMode();
  showToast(darkMode ? 'Tema oscuro activado' : 'Tema claro activado', 'success');
}

function applyDarkMode() {
  if (darkMode) {
    document.body.classList.add('dark-mode');
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
  }

  if (darkModeToggle) {
    darkModeToggle.textContent = darkMode ? '☀️ Modo claro' : '🌙 Modo oscuro';
    darkModeToggle.title = darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    darkModeToggle.setAttribute('aria-label', darkModeToggle.title);
  }
}

function renderBadges() {
  if (!badgesGrid || !currentUser) return;

  badgesGrid.innerHTML = '';
  Object.entries(BADGES).forEach(([badgeId, badgeInfo]) => {
    const unlockedBadges = currentUser.badges || [];
    const isUnlocked = unlockedBadges.includes(badgeId);

    const badgeEl = document.createElement('div');
    badgeEl.className = `badge ${isUnlocked ? 'unlocked' : 'locked'}`;
    badgeEl.title = badgeInfo.description;
    badgeEl.innerHTML = `
      <div class="badge-icon">${badgeInfo.icon}</div>
      <div class="badge-name">${badgeInfo.name}</div>
    `;
    badgesGrid.appendChild(badgeEl);
  });
}

function unlockBadge(badgeId) {
  if (!currentUser) return;
  if (!currentUser.badges) currentUser.badges = [];

  if (!currentUser.badges.includes(badgeId)) {
    currentUser.badges.push(badgeId);
    const badgeInfo = BADGES[badgeId];
    showToast(`Logro desbloqueado: ${badgeInfo.name}`, 'success');
    saveUserData();
    renderBadges();
  }
}

function checkBadges() {
  if (!currentUser) return;

  // Calcular entrenamientos completados de forma más defensiva
  let totalCompleted = 0;
  for (const planData of Object.values(currentUser.progressData || {})) {
    if (planData && typeof planData === 'object') {
      for (const weekData of Object.values(planData)) {
        if (Array.isArray(weekData)) {
          totalCompleted += weekData.filter(v => v === true).length;
        }
      }
    }
  }

  const currentLevel = currentUser.level;
  const currentXP = currentUser.xp || 0;
  const hasTraining = totalCompleted > 0;
  const previousBadges = new Set(currentUser.badges || []);

  // Si no hay entrenamientos, limpiar TODOS los logros sin excepción
  if (!hasTraining) {
    currentUser.badges = [];
    if (previousBadges.size > 0) {
      saveUserData();
      renderBadges();
    }
    return;
  }

  const trainedPlans = Object.entries(currentUser.progressData || {}).filter(([, planData]) => {
    const completedDays = Object.values(planData || {}).flat().filter(Boolean).length;
    return completedDays > 0;
  }).length;

  const eligibleBadges = new Set();
  const grantIf = (condition, badgeId) => {
    if (condition) eligibleBadges.add(badgeId);
  };

  grantIf(totalCompleted >= 1, 'primer-entrenamiento');
  grantIf(totalCompleted >= 1, 'bienvenida');

  grantIf(totalCompleted >= 7, 'semana-completa');
  grantIf(totalCompleted >= 14, 'dos-semanas');
  grantIf(totalCompleted >= 30, 'mes-entrenador');

  grantIf(currentLevel === 'intermediate' && currentXP >= NIVELES_XP.intermediate.xpMinimo, 'nivel-intermedio');
  grantIf(currentLevel === 'advanced' && currentXP >= NIVELES_XP.advanced.xpMinimo, 'nivel-avanzado');
  grantIf(currentLevel === 'expert' && currentXP >= NIVELES_XP.expert.xpMinimo, 'experto');

  grantIf(totalCompleted >= 56, 'plan-completado');

  grantIf(currentUser.progressData['30min'] && getPlanCompletionPercentage('30min') === 100, 'plan-30min');
  grantIf(currentUser.progressData['5k'] && getPlanCompletionPercentage('5k') === 100, 'plan-5k');
  grantIf(currentUser.progressData['10k'] && getPlanCompletionPercentage('10k') === 100, 'plan-10k');
  grantIf(currentUser.progressData['hiit'] && getPlanCompletionPercentage('hiit') === 100, 'plan-hiit');
  grantIf(currentUser.progressData['fartlek'] && getPlanCompletionPercentage('fartlek') === 100, 'plan-fartlek');
  grantIf(currentUser.progressData['trail'] && getPlanCompletionPercentage('trail') === 100, 'plan-trail');
  grantIf(currentUser.progressData['20k'] && getPlanCompletionPercentage('20k') === 100, 'plan-20k');
  grantIf(currentUser.progressData['maraton'] && getPlanCompletionPercentage('maraton') === 100, 'plan-maraton');
  grantIf(trainedPlans >= 8, 'todos-planes');

  grantIf(totalCompleted >= 50, '50-entrenamientos');
  grantIf(totalCompleted >= 100, '100-entrenamientos');
  grantIf(totalCompleted >= 250, '250-entrenamientos');
  grantIf(currentXP >= 500, '500-xp');
  grantIf(currentXP >= 1000, '1000-xp');

  const currentStreak = calculateCurrentStreak();
  grantIf(currentStreak >= 3, 'racha-3');
  grantIf(currentStreak >= 7, 'racha-7');
  grantIf(currentStreak >= 30, 'racha-30');

  grantIf(trainedPlans >= 7, 'semana-todos-planes');
  grantIf(totalCompleted >= 100, 'persistencia');

  const perfectWeeks = countPerfectWeeks();
  grantIf(perfectWeeks >= 5, 'perfeccionista');

  if (eligibleBadges.size >= 15) eligibleBadges.add('coleccionista-badges');
  if (eligibleBadges.size >= 25) eligibleBadges.add('maestro-absolute');

  const addedBadges = Array.from(eligibleBadges).filter(badgeId => !previousBadges.has(badgeId));
  const removedBadges = Array.from(previousBadges).filter(badgeId => !eligibleBadges.has(badgeId));

  if (addedBadges.length === 0 && removedBadges.length === 0) return;

  currentUser.badges = Array.from(eligibleBadges);
  saveUserData();
  renderBadges();

  addedBadges.forEach((badgeId) => {
    const badgeInfo = BADGES[badgeId];
    if (badgeInfo) {
      showToast(`Logro desbloqueado: ${badgeInfo.name}`, 'success');
    }
  });
}

function getPlanCompletionPercentage(plan) {
  if (!currentUser || !currentUser.progressData[plan] || !planes[plan]) return 0;
  const planData = currentUser.progressData[plan];
  const totalDays = planes[plan].length * 7;
  const completedDays = Object.values(planData).flat().filter(v => v).length;
  return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
}

function calculateCurrentStreak() {
  if (!currentUser || !currentUser.progressData) return 0;

  let streak = 0;
  let foundBreak = false;

  for (const plan of Object.keys(currentUser.progressData).reverse()) {
    const planData = currentUser.progressData[plan];
    const weeksData = Object.entries(planData).sort().reverse();

    for (const [, dayArray] of weeksData) {
      for (const day of [...dayArray].reverse()) {
        if (day) {
          streak++;
        } else {
          foundBreak = true;
          break;
        }
      }
      if (foundBreak) break;
    }
    if (foundBreak) break;
  }

  return streak;
}

function countPerfectWeeks() {
  if (!currentUser || !currentUser.progressData) return 0;

  let perfectWeeks = 0;
  for (const plan of Object.keys(currentUser.progressData)) {
    const planData = currentUser.progressData[plan];
    if (!planes[plan]) continue;
    const planWeeks = planes[plan].length;

    for (let w = 0; w < planWeeks; w++) {
      const weekKey = `semana${w}`;
      const weekDays = planData[weekKey] || [];
      const isWeekComplete = weekDays.length > 0 && weekDays.every(day => day);
      if (isWeekComplete) perfectWeeks++;
    }
  }
  return perfectWeeks;
}

function exportUserBackup() {
  if (!currentUser) return;
  const backup = {
    version: 1,
    exportedAt: new Date().toISOString(),
    user: currentUser,
    homeDailyData: JSON.parse(localStorage.getItem(HOME_DAILY_KEY) || 'null'),
    savedRoutes: JSON.parse(localStorage.getItem(HOME_SAVED_ROUTES_KEY) || '[]'),
    routeHistory: JSON.parse(localStorage.getItem(HOME_ROUTE_HISTORY_KEY) || '[]'),
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `runningtrainer-backup-${currentUser.email.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Datos exportados correctamente.', 'success');
}

async function importUserBackup(file) {
  try {
    const text = await file.text();
    const backup = JSON.parse(text);

    if (!backup?.user?.email || !backup?.user?.passwordHash) {
      showToast('El archivo no es un backup válido de RunningTrainer.', 'error');
      return;
    }

    const email = normalizeEmail(backup.user.email);
    users[email] = backup.user;
    localStorage.setItem('runningTrainerUsers', JSON.stringify(users));

    if (backup.savedRoutes) {
      localStorage.setItem(HOME_SAVED_ROUTES_KEY, JSON.stringify(backup.savedRoutes));
    }
    if (backup.routeHistory) {
      localStorage.setItem(HOME_ROUTE_HISTORY_KEY, JSON.stringify(backup.routeHistory));
    }
    if (backup.homeDailyData) {
      localStorage.setItem(HOME_DAILY_KEY, JSON.stringify(backup.homeDailyData));
    }

    showToast(`Datos de ${backup.user.name || email} importados. Inicia sesión para continuar.`, 'success');
  } catch (_) {
    showToast('No se pudo leer el archivo de backup. Asegúrate de que es un .json válido.', 'error');
  }
}

function saveUserData() {
  if (currentUser) {
    users[currentUser.email] = currentUser;
    localStorage.setItem('runningTrainerUsers', JSON.stringify(users));
  }
}

function isMobileLayout() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function moveWeeksContainerBelowSelectedPlan(selectedCard) {
  if (!weeksContainerElement || !weeksDefaultAnchor) return;

  if (isMobileLayout() && selectedCard) {
    selectedCard.insertAdjacentElement('afterend', weeksContainerElement);
    return;
  }

  weeksDefaultAnchor.insertAdjacentElement('afterend', weeksContainerElement);
}

function handleWeeksContainerPlacement() {
  const activeCard = document.querySelector('.plan-card.active');
  moveWeeksContainerBelowSelectedPlan(activeCard);
}

// Función para mostrar notificaciones toast
let _toastTimer = null;
function showToast(message, type = "") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast";

  if (type) {
    toast.classList.add(type);
  }

  toast.classList.add("show");

  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    _toastTimer = null;
  }, 3000);
}

function getSoundModeLabel(mode) {
  const labels = {
    on: 'Habilitado',
    success: 'Solo Éxito',
    motivation: 'Motivación',
    off: 'Silencio'
  };

  return labels[mode] || 'Habilitado';
}

function renderSoundOptions(soundOptions = document.querySelectorAll('.sound-option')) {
  soundOptions.forEach(option => {
    const isActive = option.dataset.sound === soundMode;
    option.classList.toggle('active', isActive);
    option.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });

  if (soundStatus) {
    soundStatus.textContent = `Modo actual: ${getSoundModeLabel(soundMode)}`;
  }
}

async function ensureAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextClass();
  }

  if (sharedAudioContext.state === 'suspended') {
    try {
      await sharedAudioContext.resume();
    } catch (error) {
      console.warn('No se pudo reactivar el audio del temporizador', error);
    }
  }

  return sharedAudioContext;
}

async function setSoundMode(nextMode, soundOptions, showFeedback = false) {
  soundMode = nextMode;
  localStorage.setItem('soundMode', soundMode);
  renderSoundOptions(soundOptions);

  if (soundMode !== 'off') {
    await ensureAudioContext();
  }

  if (showFeedback) {
    if (soundMode === 'success') {
      createCompletionSound();
    } else if (soundMode === 'on' || soundMode === 'motivation') {
      createBellSound();
    }

    showToast(`Sonido: ${getSoundModeLabel(soundMode)}`, 'success');
  }
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePasswordStrength(password = '') {
  if (password.length < AUTH_CONFIG.minPasswordLength) {
    return {
      valid: false,
      message: `La contrasena debe tener al menos ${AUTH_CONFIG.minPasswordLength} caracteres`
    };
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return {
      valid: false,
      message: 'La contrasena debe incluir letras y numeros'
    };
  }

  return { valid: true, message: '' };
}

function toBase64(bytes) {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function generateSalt(size = 16) {
  const salt = new Uint8Array(size);
  crypto.getRandomValues(salt);
  return toBase64(salt);
}

async function derivePasswordHash(password, salt, iterations = AUTH_CONFIG.pbkdf2Iterations) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: AUTH_CONFIG.pbkdf2Hash,
      salt: encoder.encode(salt),
      iterations
    },
    keyMaterial,
    256
  );

  return toBase64(new Uint8Array(bits));
}

async function buildSecuredPassword(password) {
  if (!window.crypto?.subtle) {
    return null;
  }

  const passwordSalt = generateSalt();
  const passwordHash = await derivePasswordHash(password, passwordSalt);
  return {
    passwordHash,
    passwordSalt,
    passwordAlgo: 'pbkdf2-sha256',
    passwordIterations: AUTH_CONFIG.pbkdf2Iterations
  };
}

function persistLoginAttempts() {
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(loginAttempts));
}

function getLoginAttemptInfo(email) {
  const key = normalizeEmail(email);
  return loginAttempts[key] || { count: 0, lockUntil: 0 };
}

function isLoginLocked(email) {
  const info = getLoginAttemptInfo(email);
  if (!info.lockUntil) return false;
  if (Date.now() >= info.lockUntil) {
    clearLoginAttempts(email);
    return false;
  }
  return true;
}

function registerFailedLogin(email) {
  const key = normalizeEmail(email);
  const info = getLoginAttemptInfo(key);
  const nextCount = info.count + 1;
  const shouldLock = nextCount >= AUTH_CONFIG.maxFailedAttempts;

  loginAttempts[key] = {
    count: shouldLock ? 0 : nextCount,
    lockUntil: shouldLock ? Date.now() + AUTH_CONFIG.lockoutMs : 0
  };
  persistLoginAttempts();
}

function clearLoginAttempts(email) {
  const key = normalizeEmail(email);
  delete loginAttempts[key];
  persistLoginAttempts();
}

function getLockRemainingMs(email) {
  const info = getLoginAttemptInfo(email);
  return Math.max(0, (info.lockUntil || 0) - Date.now());
}

function normalizeUsersMap() {
  const migrated = {};
  let changed = false;

  Object.entries(users).forEach(([emailKey, userData]) => {
    const normalized = normalizeEmail(emailKey || userData?.email || '');
    if (!normalized || migrated[normalized]) return;
    const hadTrainingLog = Array.isArray(userData?.trainingLog);
    migrated[normalized] = {
      ...userData,
      email: normalized,
      trainingLog: hadTrainingLog ? userData.trainingLog : []
    };
    if (emailKey !== normalized || userData?.email !== normalized) {
      changed = true;
    }
    if (!hadTrainingLog) {
      changed = true;
    }
  });

  if (changed) {
    users = migrated;
    localStorage.setItem('runningTrainerUsers', JSON.stringify(users));
  }
}

async function migrateLegacyPasswordIfNeeded(user, plainPassword) {
  if (!user || user.passwordHash) return true;
  if (!user.password || user.password !== plainPassword) return false;

  const securedPassword = await buildSecuredPassword(plainPassword);
  if (!securedPassword) return true;

  user.passwordHash = securedPassword.passwordHash;
  user.passwordSalt = securedPassword.passwordSalt;
  user.passwordAlgo = securedPassword.passwordAlgo;
  user.passwordIterations = securedPassword.passwordIterations;
  user.authSchemaVersion = AUTH_CONFIG.schemaVersion;
  delete user.password;
  return true;
}

async function verifyUserPassword(user, plainPassword) {
  if (!user) return false;

  if (!user.passwordHash || !user.passwordSalt) {
    return migrateLegacyPasswordIfNeeded(user, plainPassword);
  }

  const iterations = user.passwordIterations || AUTH_CONFIG.pbkdf2Iterations;
  const computed = await derivePasswordHash(plainPassword, user.passwordSalt, iterations);
  return computed === user.passwordHash;
}

async function loginUser(email, password) {
  const normalizedEmail = normalizeEmail(email);
  const user = users[normalizedEmail];

  if (isLoginLocked(normalizedEmail)) {
    const seconds = Math.ceil(getLockRemainingMs(normalizedEmail) / 1000);
    showToast(`Demasiados intentos. Prueba de nuevo en ${seconds}s`, 'error');
    return;
  }
  
  if (!user) {
    registerFailedLogin(normalizedEmail);
    showToast('Usuario no encontrado', 'error');
    return;
  }
  
  const validPassword = await verifyUserPassword(user, password);
  if (!validPassword) {
    registerFailedLogin(normalizedEmail);
    showToast('Contraseña incorrecta', 'error');
    return;
  }

  clearLoginAttempts(normalizedEmail);
  
  // Establecer usuario actual
  currentUser = user;
  localStorage.setItem("currentUser", normalizedEmail);
  users[normalizedEmail] = currentUser;
  localStorage.setItem("runningTrainerUsers", JSON.stringify(users));
  
  // Ocultar auth y mostrar aplicación
  authContainer.classList.add('hidden');
  
  // Actualizar interfaz de usuario
  updateUserInterface();
  
  // Inicializar la aplicación
  initApp();
  
  showToast(`¡Bienvenido/a de nuevo, ${user.name}!`, 'success');
  activateWakeLockIfNeeded();

  // Inicializar Strava si ya había sesión conectada
  setTimeout(() => { if (window.STRAVA) STRAVA.init(); }, 200);
}
// Verificar si hay una sesión activa al cargar la página
function checkAuthStatus() {
  const userEmail = normalizeEmail(localStorage.getItem("currentUser"));
  
  if (userEmail && users[userEmail]) {
    currentUser = users[userEmail];
    // Migrar usuarios antiguos sin XP
    if (typeof currentUser.xp === 'undefined') {
      currentUser.xp = 0;
      users[userEmail] = currentUser;
      localStorage.setItem("runningTrainerUsers", JSON.stringify(users));
    }
    authContainer.classList.add('hidden');
    updateUserInterface();
    initApp();
    activateWakeLockIfNeeded();

    // Restaurar widget de Strava si había sesión activa
    setTimeout(() => { if (window.STRAVA) STRAVA.init(); }, 200);
    return true;
  }
  
  return false;
}

normalizeUsersMap();

// Verificar y aplicar subida de nivel
function checkLevelUp(nivelAnterior, xpGanado) {
  const infoNivelActual = NIVELES_XP[currentUser.level];
  
  if (currentUser.xp >= infoNivelActual.xpMaximo && infoNivelActual.siguiente) {
    currentUser.level = infoNivelActual.siguiente;
    const nuevoNivel = getLevelLabel(currentUser.level);
    
    // Notificación épica de subida de nivel
    setTimeout(() => {
      showToast(`🎉 ¡NIVEL SUPERIOR! Ahora eres ${nuevoNivel} 🏆`, "level-up");
      
      // Segundo mensaje motivacional
      setTimeout(() => {
        showToast(`🌟 ¡Sigue así! Tu dedicación está dando resultados.`, "success");
      }, 3500);
    }, 500);
  }
}

// Actualizar interfaz de usuario con datos del usuario
function updateUserInterface() {
  if (!currentUser) return;
  
  // Actualizar barra de usuario
  userName.textContent = currentUser.name;
  
  // Actualizar avatar con foto de perfil si existe
  if (currentUser.profilePhoto) {
    userAvatar.style.backgroundImage = `url('${currentUser.profilePhoto}')`;
    userAvatar.textContent = '';
  } else {
    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    userAvatar.style.backgroundImage = '';
  }
  
  userLevelBadge.textContent = getLevelLabel(currentUser.level);
  userLevelBadge.className = `user-level level-${currentUser.level}`;
  
  // Actualizar mini barra de XP
  const currentXP = currentUser.xp || 0;
  const infoNivel = NIVELES_XP[currentUser.level];
  const xpEnNivel = currentXP - infoNivel.xpMinimo;
  const xpParaNivel = infoNivel.xpMaximo - infoNivel.xpMinimo;
  const porcentajeXP = Math.min(100, Math.round((xpEnNivel / xpParaNivel) * 100));
  
  const userXPBar = document.getElementById('userXPBar');
  const userXPText = document.getElementById('userXPText');
  
  if (userXPBar && userXPText) {
    userXPBar.style.width = `${porcentajeXP}%`;
    userXPText.textContent = `${currentXP} XP`;
  }
}

// Obtener etiqueta para el nivel
function getLevelLabel(level) {
  const labels = {
    'beginner': 'Principiante',
    'intermediate': 'Intermedio',
    'advanced': 'Avanzado',
    'expert': 'Experto'
  };
  return labels[level] || 'Principiante';
}

function isRestDay(description = '') {
  return /descanso|recuperaci[oó]n/i.test(description.toLowerCase());
}

function getWeekTrainingStats(weekIndex) {
  const weekDays = planes[planActual][weekIndex] || [];
  const weekProgress = currentUser.progressData[planActual]?.[`semana${weekIndex}`] || [];
  let totalTrainingDays = 0;
  let completedTrainingDays = 0;

  weekDays.forEach(([, description], dayIndex) => {
    if (isRestDay(description)) return;
    totalTrainingDays++;
    if (weekProgress[dayIndex]) completedTrainingDays++;
  });

  return { totalTrainingDays, completedTrainingDays };
}

function getPlanTrainingStats() {
  let totalTrainingDays = 0;
  let completedTrainingDays = 0;

  planes[planActual].forEach((_, weekIndex) => {
    const weekStats = getWeekTrainingStats(weekIndex);
    totalTrainingDays += weekStats.totalTrainingDays;
    completedTrainingDays += weekStats.completedTrainingDays;
  });

  return { totalTrainingDays, completedTrainingDays };
}

function isWeekCompleteForPlan(planKey, weekIndex) {
  const weekDays = planes[planKey]?.[weekIndex] || [];
  const weekProgress = currentUser?.progressData?.[planKey]?.[`semana${weekIndex}`] || [];
  let totalTrainingDays = 0;
  let completedTrainingDays = 0;

  weekDays.forEach(([, description], dayIndex) => {
    if (isRestDay(description)) return;
    totalTrainingDays++;
    if (weekProgress[dayIndex]) completedTrainingDays++;
  });

  return totalTrainingDays > 0 && completedTrainingDays === totalTrainingDays;
}

function getVisibleWeekIndex(planKey = planActual) {
  const totalWeeks = planes[planKey]?.length || 0;
  if (totalWeeks === 0) return 0;

  for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
    if (!isWeekCompleteForPlan(planKey, weekIndex)) {
      return weekIndex;
    }
  }

  return totalWeeks - 1;
}

// Actualizar modal de perfil
function updateProfileModal() {
  if (!currentUser) return;

  currentUser.homeStepsGoal = normalizeHomeStepsGoal(currentUser.homeStepsGoal, HOME_STEPS_GOAL_DEFAULT);
  
  profileName.textContent = currentUser.name;
  
  // Actualizar avatar del modal con foto de perfil si existe
  if (currentUser.profilePhoto) {
    profileAvatar.style.backgroundImage = `url('${currentUser.profilePhoto}')`;
    profileAvatar.textContent = '';
  } else {
    profileAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    profileAvatar.style.backgroundImage = '';
  }
  
  profileLevelBadge.textContent = getLevelLabel(currentUser.level);
  profileLevelBadge.className = `user-level level-${currentUser.level}`;
  
  // Calcular estadísticas (solo días de entrenamiento, sin descansos)
  const { completedTrainingDays: completedDays, totalTrainingDays: totalDays } = getPlanTrainingStats();
  
  const progress = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  
  profilePlan.textContent = getPlanDisplayName();
  profileCompleted.textContent = completedDays;
  profileTotal.textContent = totalDays;
  profileProgress.textContent = `${progress}%`;

  if (profileMinStepsInput) {
    profileMinStepsInput.value = String(getHomeStepsGoal());
  }
  if (profileMinStepsHelp) {
    profileMinStepsHelp.textContent = `Objetivo actual en Inicio: ${getHomeStepsGoal().toLocaleString('es-ES')} pasos.`;
  }
  const { upperThreshold, lowerThreshold } = getPedometerThresholds();
  if (profilePedometerUpper) profilePedometerUpper.value = String(upperThreshold);
  if (profilePedometerLower) profilePedometerLower.value = String(lowerThreshold);
  
  // Actualizar información de XP
  const currentXP = currentUser.xp || 0;
  const infoNivel = NIVELES_XP[currentUser.level];
  const xpEnNivel = currentXP - infoNivel.xpMinimo;
  const xpParaNivel = infoNivel.xpMaximo - infoNivel.xpMinimo;
  const porcentajeXP = Math.min(100, Math.round((xpEnNivel / xpParaNivel) * 100));
  
  document.getElementById('profileXP').textContent = `${currentXP} / ${infoNivel.xpMaximo} XP`;
  document.getElementById('profileXPBar').style.width = `${porcentajeXP}%`;
  
  if (infoNivel.siguiente) {
    const siguienteNombre = NIVELES_XP[infoNivel.siguiente].nombre;
    const xpFaltante = infoNivel.xpMaximo - currentXP;
    document.getElementById('profileNextLevel').textContent = `Siguiente nivel: ${siguienteNombre} (${xpFaltante} XP restantes)`;
  } else {
    document.getElementById('profileNextLevel').textContent = '¡Nivel máximo alcanzado! 🏆';
  }

  if (levelProgressDetails) {
    const levelProgressContent = levelProgressDetails.querySelector('.level-progress-content');
    if (levelProgressContent) {
      const content = infoNivel.siguiente
        ? `
          <div>Nivel actual: <strong>${getLevelLabel(currentUser.level)}</strong></div>
          <div>XP actual: <strong>${currentXP} / ${infoNivel.xpMaximo}</strong></div>
          <div style="margin-top: 0.5rem;">Necesitas <strong>${infoNivel.xpMaximo - currentXP} XP</strong> para alcanzar <strong>${NIVELES_XP[infoNivel.siguiente].nombre}</strong>.</div>
          <div style="margin-top: 0.5rem;">Planes que dan m&aacute;s XP:</div>
          <ul>
            <li>Maratón: 65 XP por d&iacute;a</li>
            <li>1/2 Maratón: 50 XP por d&iacute;a</li>
            <li>HIIT: 40 XP por d&iacute;a</li>
            <li>Trail: 35 XP por d&iacute;a</li>
            <li>10K: 30 XP por d&iacute;a</li>
          </ul>
        `
        : `
          <div>Nivel actual: <strong>${getLevelLabel(currentUser.level)}</strong></div>
          <div>XP actual: <strong>${currentXP} / ${infoNivel.xpMaximo}</strong></div>
          <div style="margin-top: 0.5rem;"><strong>Has alcanzado el nivel m&aacute;ximo.</strong></div>
        `;

      levelProgressContent.innerHTML = content;
    }
  }
}

function initApp() {
  if (!currentUser) return;
  
  // Inicializar datos de progreso si no existen
  if (!currentUser.progressData) {
    currentUser.progressData = {};
    users[currentUser.email] = currentUser;
    localStorage.setItem("runningTrainerUsers", JSON.stringify(users));
  }

  // Restaurar planes dinámicos si el usuario ya los había generado
  if (currentUser.pace5k_10k) {
    planes['10k'] = generate10KPlan(calcular10KPaces(currentUser.pace5k_10k));
  }
  if (currentUser.pace5k) {
    planes['20k'] = generate20KPlan(calcular20KPaces(currentUser.pace5k));
  }
  if (currentUser.pace10k) {
    planes['maraton'] = generateMaratonPlan(calcularMaratonPaces(currentUser.pace10k));
  }
  
  cambiarPlan("30min", { showMotivationalBubble: false });
  
  // Verificar si hay datos guardados
  if (currentUser.progressData) {
    showToast(`¡Bienvenido/a ${currentUser.name}! Tus datos de entrenamiento se han cargado correctamente`, "success");
  }
}

function cambiarPlan(tipo, { showMotivationalBubble = true } = {}) {
  if (!currentUser) return;
  
  // Cerrar todos los desplegables de semanas del plan anterior
  document.querySelectorAll('.week-button.active').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
  });
  document.querySelectorAll('.day-details.active').forEach(details => {
    details.classList.remove('active');
  });
  
  planActual = tipo;
  const nombre = getPlanDisplayName(tipo);

  // Actualizar widget de Strava con el nuevo plan
  setTimeout(() => { if (window.STRAVA?.isConnected()) STRAVA.renderWidget(); }, 300);

  // Actualizar clases activas de las tarjetas
  document.querySelectorAll('.plan-card').forEach(card => {
    card.classList.remove('active');
  });
  
  // Marcar la tarjeta activa
  const planIndex = ['sobrepeso', '30min', '5k', '10k', '20k', 'maraton', 'trail', 'hiit', 'fartlek'].indexOf(tipo);
  if (planIndex >= 0) {
    const cards = document.querySelectorAll('.plan-card');
    if (cards[planIndex]) {
      cards[planIndex].classList.add('active');
      moveWeeksContainerBelowSelectedPlan(cards[planIndex]);
      if (trainingView?.classList.contains('active')) {
        cards[planIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  } else {
    moveWeeksContainerBelowSelectedPlan(null);
  }

  if (!currentUser.progressData[tipo]) {
    currentUser.progressData[tipo] = {};
    planes[tipo].forEach((_, weekIndex) => {
      currentUser.progressData[tipo][`semana${weekIndex}`] = Array(planes[tipo][weekIndex].length).fill(false);
    });
    // Guardar los cambios
    users[currentUser.email] = currentUser;
    localStorage.setItem("runningTrainerUsers", JSON.stringify(users));
    showToast(`¡Nuevo plan "${nombre}" iniciado!`, "success");
  } else {
    // Sincronizar semanas si el plan cambió de tamaño
    let updated = false;
    planes[tipo].forEach((weekDays, weekIndex) => {
      if (!currentUser.progressData[tipo][`semana${weekIndex}`]) {
        currentUser.progressData[tipo][`semana${weekIndex}`] = Array(weekDays.length).fill(false);
        updated = true;
      }
    });
    if (updated) {
      users[currentUser.email] = currentUser;
      localStorage.setItem("runningTrainerUsers", JSON.stringify(users));
    }
  }
  renderWeeks();
  updateChart();
  updateMotivationalMessage({ showBubble: showMotivationalBubble });
}

function renderWeeks() {
  if (!currentUser) return;

  weeksContainerElement.innerHTML = "";
  const weekIndex = getVisibleWeekIndex(planActual);
  const diasSemana = planes[planActual][weekIndex] || [];
  const totalWeeks = planes[planActual].length;

  const weekWrapper = document.createElement("div");
  weekWrapper.className = `week-wrapper animate-slide-up delay-${weekIndex % 3}`;

  const weekButton = document.createElement("button");
  weekButton.className = `week-button`;
  weekButton.setAttribute("aria-expanded", "false");

  const ws = getWeekTrainingStats(weekIndex);
  const pillText = ws.totalTrainingDays > 0
    ? `${ws.completedTrainingDays}/${ws.totalTrainingDays} días`
    : 'Sin entrenos';

  weekButton.innerHTML = `
    <span class="week-btn-label">Semana ${weekIndex + 1}/${totalWeeks}</span>
    <span class="week-btn-meta">
      <span class="week-progress-pill">${pillText}</span>
      <span class="week-btn-arrow">▶</span>
    </span>
  `;

  const weekDetailsDiv = document.createElement("div");
  weekDetailsDiv.className = `day-details`;
  weekButton.onclick = () => {
    const isExpanded = weekDetailsDiv.classList.toggle('active');
    weekButton.classList.toggle('active');
    weekButton.setAttribute("aria-expanded", isExpanded ? "true" : "false");
  };

  diasSemana.forEach(([day, description], dayIndex) => {
      const dayItem = document.createElement("div");
      dayItem.className = "day-item";

      const dayText = document.createElement("div");
      dayText.className = "day-text-wrap";
      dayText.innerHTML = `<span class="day-name-badge">${day}</span><span class="day-description">${description}</span>`;

      const actionsDiv = document.createElement("div");
      actionsDiv.className = "actions";

      if (isRestDay(description)) {
        const restLabel = document.createElement('span');
        restLabel.className = 'rest-day-label';
        restLabel.innerHTML = '💤 Descanso';

        dayItem.appendChild(dayText);
        dayItem.appendChild(restLabel);
        weekDetailsDiv.appendChild(dayItem);
        return;
      }

      const timerButton = document.createElement("button");
      const hasTimer = hasTimerPreset(description);
      if (hasTimer) {
        timerButton.className = "btn btn-sm btn-secondary";
        timerButton.innerHTML = '⏱️ Temporizador';
        timerButton.onclick = (e) => {
            e.stopPropagation();
            openTimerModal(description);
        };
      } else {
        timerButton.className = "btn btn-sm btn-secondary";
        timerButton.innerHTML = '📍 Iniciar Entrenamiento';
        timerButton.onclick = (e) => {
            e.stopPropagation();
            openDistanceModal(description, weekIndex, dayIndex);
        };
      }

      const completeButton = document.createElement("button");
      const isCompleted = currentUser.progressData[planActual][`semana${weekIndex}`][dayIndex];
      completeButton.className = `btn btn-sm ${isCompleted ? 'btn-success completed' : 'btn-secondary'}`;
      completeButton.textContent = isCompleted ? "Completado" : "Marcar";
      completeButton.onclick = (e) => {
        e.stopPropagation();
        toggleDayComplete(weekIndex, dayIndex, completeButton, weekButton);
      };

      actionsDiv.appendChild(timerButton);
      actionsDiv.appendChild(completeButton);
      dayItem.appendChild(dayText);
      dayItem.appendChild(actionsDiv);
      weekDetailsDiv.appendChild(dayItem);
  });

  const downloadButton = document.createElement("button");
  downloadButton.className = "btn btn-pdf btn-primary";
  downloadButton.innerHTML = '📄 Descargar PDF';
  downloadButton.onclick = () => downloadWeekPDF(weekIndex);
  weekDetailsDiv.appendChild(downloadButton);

  weekWrapper.appendChild(weekButton);
  weekWrapper.appendChild(weekDetailsDiv);
  weeksContainerElement.appendChild(weekWrapper);

  updateWeekButtonState(weekIndex, weekButton);
}

function toggleDayComplete(weekIndex, dayIndex, button, weekButton) {
  if (!currentUser) return;

  const dayDescription = planes[planActual][weekIndex]?.[dayIndex]?.[1] || '';
  const dayName = planes[planActual][weekIndex]?.[dayIndex]?.[0] || `Día ${dayIndex + 1}`;
  if (isRestDay(dayDescription)) {
    showToast('El dia de descanso no se marca como entrenamiento.', 'error');
    return;
  }
  
  const currentStatus = currentUser.progressData[planActual][`semana${weekIndex}`][dayIndex];
  const wasWeekComplete = isWeekCompleteForPlan(planActual, weekIndex);
  currentUser.progressData[planActual][`semana${weekIndex}`][dayIndex] = !currentStatus;
  
  // Si se completa el entrenamiento, añadir XP
  if (!currentStatus) {
    const xpGanado = XP_POR_PLAN[planActual] || 15;
    const nivelAnterior = currentUser.level;
    currentUser.xp = (currentUser.xp || 0) + xpGanado;
    
    // Verificar si sube de nivel
    checkLevelUp(nivelAnterior, xpGanado);
    recordPlanCompletion(planActual, weekIndex, dayIndex, dayName, dayDescription);
  } else {
    // Si desmarca, restar XP
    const xpPerdido = XP_POR_PLAN[planActual] || 15;
    currentUser.xp = Math.max(0, (currentUser.xp || 0) - xpPerdido);
    removePlanCompletion(planActual, weekIndex, dayIndex);
  }
  
  // Guardar cambios
  users[currentUser.email] = currentUser;
  localStorage.setItem("runningTrainerUsers", JSON.stringify(users));

  button.textContent = !currentStatus ? "Completado" : "Marcar";
  button.classList.toggle('btn-success', !currentStatus);
  button.classList.toggle('completed', !currentStatus);
  button.classList.toggle('btn-secondary', currentStatus);
  
  updateWeekButtonState(weekIndex, weekButton);
  const isWeekNowComplete = isWeekCompleteForPlan(planActual, weekIndex);
  if (!wasWeekComplete && isWeekNowComplete) {
    const nextWeekIndex = Math.min(planes[planActual].length - 1, weekIndex + 1);
    renderWeeks();
    if (nextWeekIndex !== weekIndex) {
      showToast(`Semana ${weekIndex + 1} completada. Pasas a Semana ${nextWeekIndex + 1}.`, "success");
    }
  }
  updateChart();
  if (calendarView?.classList.contains('active')) {
    renderCalendarTrainingLog();
  }
  updateMotivationalMessage({ showBubble: false });
  updateUserInterface();
  checkBadges();
  
  // Mostrar notificación
  if (!currentStatus) {
    showToast(`¡Entrenamiento completado! +${XP_POR_PLAN[planActual] || 15} XP 🌟`, "success");
    
    // Ofrecer subir a Strava si está conectado
    if (window.STRAVA && STRAVA.isConnected()) {
      setTimeout(() => {
        STRAVA.showUploadModal({
          planText: dayDescription,
          planType: planActual,
          weekIndex,
          dayIndex,
          timerSeconds: lastTimerElapsedSeconds || 0,
          gpsData: lastGpsData || null,
        });
        lastTimerElapsedSeconds = null;
        lastGpsData = null;
      }, 500);
    }
  } else {
    showToast("Entrenamiento marcado como pendiente.", "error");
  }
}

function updateWeekButtonState(weekIndex, weekButton) {
  if (!currentUser) return;
  const { totalTrainingDays, completedTrainingDays } = getWeekTrainingStats(weekIndex);
  const allDaysComplete = totalTrainingDays > 0 && completedTrainingDays === totalTrainingDays;
  weekButton.classList.toggle('completed', allDaysComplete);

  // Actualizar pill de progreso
  const pill = weekButton.querySelector('.week-progress-pill');
  if (pill) {
    pill.textContent = totalTrainingDays > 0
      ? `${completedTrainingDays}/${totalTrainingDays} días`
      : 'Sin entrenos';
  }
}

function downloadWeekPDF(weekIndex) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const planNombre = getPlanDisplayName();
  const semana = weekIndex + 1;
  const diasSemana = planes[planActual][weekIndex];
  
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246);
  doc.setFont("helvetica", "bold");
  doc.text("RunningTrainer", 105, 20, { align: 'center' });
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(40, 25, 170, 25);
  
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(`Plan: ${planNombre}`, 105, 35, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(100);
  doc.text(`Semana ${semana}`, 105, 45, { align: 'center' });
  
  const headers = [["Día", "Entrenamiento", "Estado"]];
  const data = diasSemana.map(([day, description], dayIndex) => {
    const completado = isRestDay(description)
      ? "Descanso 💤"
      : (currentUser.progressData[planActual][`semana${weekIndex}`][dayIndex] ? "Completado ✅" : "Pendiente ❌");
    return [day, description, completado];
  });
  
  doc.autoTable({
    startY: 55, head: headers, body: data, theme: 'grid',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 125 }, 2: { cellWidth: 35, halign: 'center' }}
  });
  
  doc.save(`RunningTrainer_${planNombre.replace(/ /g, '_')}_Semana_${semana}.pdf`);
  showToast("PDF descargado correctamente", "success");
}

function updateChart() {
  if (!currentUser) return;

  const totalWeeks = planes[planActual].length;

  // ── Datos reales por semana ──────────────────────────────────────────────
  const realData = planes[planActual].map((_, wi) => {
    const s = getWeekTrainingStats(wi);
    return s.totalTrainingDays > 0
      ? Math.round((s.completedTrainingDays / s.totalTrainingDays) * 100)
      : 0;
  });

  // ── Progreso ideal (lineal 0 → 100%) ────────────────────────────────────
  const idealData = planes[planActual].map((_, wi) =>
    Math.round(((wi + 1) / totalWeeks) * 100)
  );

  // ── Semana actual (última con algún progreso o semana 0) ─────────────────
  let currentWeekIdx = realData.reduce((acc, v, i) => (v > 0 ? i : acc), -1);
  if (currentWeekIdx < 0) currentWeekIdx = 0;

  // ── Estadísticas para el resumen ─────────────────────────────────────────
  const { completedTrainingDays: doneDays, totalTrainingDays: totalDays } = getPlanTrainingStats();
  const overallPct = totalDays > 0 ? Math.round((doneDays / totalDays) * 100) : 0;
  const idealPct   = Math.round(((currentWeekIdx + 1) / totalWeeks) * 100);
  const diff       = overallPct - idealPct;

  // Resumen textual
  const badge = document.getElementById('chartWeekBadge');
  const summary = document.getElementById('chartSummary');
  if (badge) badge.textContent = `Semana ${currentWeekIdx + 1} / ${totalWeeks}`;
  if (summary) {
    const diffLabel = diff > 0
      ? `<span class="cs-ahead">+${diff}% por delante 🚀</span>`
      : diff < 0
        ? `<span class="cs-behind">${diff}% por detrás</span>`
        : `<span class="cs-on">En ritmo ideal ✓</span>`;
    summary.innerHTML = `
      <span class="cs-item">
        <span class="cs-dot" style="background:#3b82f6"></span>
        Completados: <span class="cs-val">${doneDays} / ${totalDays} días</span>
      </span>
      <span class="cs-item">
        <span class="cs-dot" style="background:#10b981"></span>
        Global: <span class="cs-val">${overallPct}%</span>
      </span>
      <span class="cs-item">${diffLabel}</span>
    `;
  }

  // ── Canvas y gradientes ──────────────────────────────────────────────────
  const ctx = document.getElementById('progressChart').getContext('2d');

  const gradReal = ctx.createLinearGradient(0, 0, 0, 260);
  gradReal.addColorStop(0,   'rgba(59,130,246,0.35)');
  gradReal.addColorStop(1,   'rgba(59,130,246,0.01)');

  const gradIdeal = ctx.createLinearGradient(0, 0, 0, 260);
  gradIdeal.addColorStop(0,  'rgba(16,185,129,0.18)');
  gradIdeal.addColorStop(1,  'rgba(16,185,129,0.01)');

  // ── Puntos especiales (100% = trofeo) ────────────────────────────────────
  const pointStyles = realData.map(v => v === 100 ? 'star' : 'circle');
  const pointRadii  = realData.map(v => v === 100 ? 8 : (v > 0 ? 5 : 3));
  const pointColors = realData.map(v =>
    v === 100 ? '#f59e0b' : (v > 0 ? '#3b82f6' : '#e2e8f0')
  );

  const labels = planes[planActual].map((_, i) => `S${i + 1}`);

  const config = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Tu progreso',
          data: realData,
          borderColor: '#3b82f6',
          borderWidth: 2.5,
          backgroundColor: gradReal,
          fill: true,
          tension: 0.4,
          pointStyle: pointStyles,
          pointRadius: pointRadii,
          pointBackgroundColor: pointColors,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointHoverRadius: 8,
          order: 1
        },
        {
          label: 'Ritmo ideal',
          data: idealData,
          borderColor: '#10b981',
          borderWidth: 2,
          borderDash: [6, 4],
          backgroundColor: gradIdeal,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#10b981',
          order: 2
        }
      ]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            boxWidth: 12, boxHeight: 12, borderRadius: 6,
            usePointStyle: false,
            font: { size: 12, family: 'Inter' },
            color: '#64748b'
          }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#f8fafc',
          bodyColor: '#cbd5e1',
          padding: 12,
          cornerRadius: 10,
          displayColors: true,
          callbacks: {
            title(items) {
              const wi = items[0].dataIndex;
              return `Semana ${wi + 1}`;
            },
            label(item) {
              const wi = item.dataIndex;
              if (item.datasetIndex === 0) {
                const s = getWeekTrainingStats(wi);
                const pct = item.raw;
                const trophy = pct === 100 ? ' 🏆' : '';
                return ` Tu progreso: ${s.completedTrainingDays}/${s.totalTrainingDays} días (${pct}%)${trophy}`;
              }
              return ` Ritmo ideal: ${item.raw}%`;
            },
            afterBody(items) {
              const wi = items[0].dataIndex;
              const real  = realData[wi];
              const ideal = idealData[wi];
              const d = real - ideal;
              if (d === 0) return ['  En ritmo ideal ✓'];
              return [d > 0 ? `  +${d}% por delante 🚀` : `  ${d}% por detrás`];
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            callback: v => v + '%',
            font: { size: 11, family: 'Inter' },
            color: '#94a3b8',
            stepSize: 25
          },
          border: { display: false }
        },
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 11, family: 'Inter' },
            color: '#94a3b8'
          },
          border: { display: false }
        }
      },
      animation: {
        duration: 700,
        easing: 'easeInOutQuart'
      }
    },
    plugins: [
      // Plugin: línea vertical en semana actual
      {
        id: 'currentWeekLine',
        afterDraw(ch) {
          const meta = ch.getDatasetMeta(0);
          if (!meta.data[currentWeekIdx]) return;
          const x = meta.data[currentWeekIdx].x;
          const { top, bottom } = ch.chartArea;
          const { ctx: c } = ch;
          c.save();
          c.setLineDash([4, 3]);
          c.strokeStyle = 'rgba(100,116,139,0.4)';
          c.lineWidth = 1.5;
          c.beginPath();
          c.moveTo(x, top);
          c.lineTo(x, bottom);
          c.stroke();
          // Etiqueta "Hoy"
          c.setLineDash([]);
          c.fillStyle = '#64748b';
          c.font = '500 10px Inter, sans-serif';
          c.textAlign = 'center';
          c.fillText('Hoy', x, top - 4);
          c.restore();
        }
      }
    ]
  };

  if (chart) chart.destroy();
  chart = new Chart(ctx, config);
}

function updateMotivationalMessage({ showBubble = false } = {}) {
  if (!currentUser) return;

  const { completedTrainingDays: completedDays, totalTrainingDays: totalDays } = getPlanTrainingStats();

  const percentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  document.getElementById("progressBar").value = percentage;
  document.getElementById("progressText").textContent = `${percentage}% completado`;
  
  // Obtener mensaje según el nivel del usuario
  const userLevel = currentUser.level || 'beginner';
  const messages = mensajesMotivadores[userLevel] || mensajesMotivadores.beginner;
  const message = messages.find(m => percentage >= m.min && percentage <= m.max)?.mensaje || "";
  
  // Personalizar mensaje con el nombre del usuario
  const personalizedMessage = message.replace(/¡(\w)/, `¡${currentUser.name}, $1`);
  if (!personalizedMessage) return;

  let levelClass = 'low';
  if (percentage >= 100) levelClass = 'complete';
  else if (percentage >= 70) levelClass = 'high';
  else if (percentage >= 30) levelClass = 'medium';

  const canShowBubble = Boolean(
    showBubble &&
    trainingView?.classList.contains('active')
  );

  if (canShowBubble) {
    _showMotivationalBubble(personalizedMessage, levelClass);
  } else {
    _dismissBubble();
  }
}

// ── Globo motivacional flotante ───────────────────────────────────────────────
let _bubbleEl = null;
let _bubbleDismissHandlers = [];

function _dismissBubble() {
  if (!_bubbleEl) return;
  const el = _bubbleEl;
  _bubbleEl = null;
  _bubbleDismissHandlers.forEach(({ target, type, fn }) => target.removeEventListener(type, fn));
  _bubbleDismissHandlers = [];
  el.classList.add('bubble-out');
  setTimeout(() => el.remove(), 350);
}

function _showMotivationalBubble(text, levelClass) {
  if (_bubbleEl) {
    _bubbleDismissHandlers.forEach(({ target, type, fn }) => target.removeEventListener(type, fn));
    _bubbleDismissHandlers = [];
    _bubbleEl.remove();
    _bubbleEl = null;
  }

  const bubble = document.createElement('div');
  bubble.className = `motivational-bubble ${levelClass}`;

  bubble.appendChild(document.createTextNode(text));

  const hint = document.createElement('span');
  hint.className = 'bubble-hint';
  hint.textContent = 'Toca para cerrar';
  bubble.appendChild(hint);

  bubble.style.bottom = '90px';
  bubble.style.left = '20px';

  document.body.appendChild(bubble);
  _bubbleEl = bubble;

  const onTouch = () => _dismissBubble();

  setTimeout(() => {
    document.addEventListener('touchstart', onTouch, { once: true, passive: true });
    document.addEventListener('click', onTouch, { once: true });
    bubble.addEventListener('click', onTouch, { once: true });
    _bubbleDismissHandlers.push(
      { target: document, type: 'touchstart', fn: onTouch },
      { target: document, type: 'click',      fn: onTouch },
      { target: bubble,   type: 'click',      fn: onTouch }
    );
  }, 300);
}

// ===========================================
// LÓGICA DEL TEMPORIZADOR
// ===========================================

function parseTimeToSeconds(valueText, unitText) {
  const normalizedValue = parseFloat(valueText.replace(',', '.'));
  if (Number.isNaN(normalizedValue)) return 0;
  return unitText.toLowerCase().startsWith('min')
    ? Math.round(normalizedValue * 60)
    : Math.round(normalizedValue);
}

function extractWorkoutPreset(description) {
  const cleaned = description.trim();
  const normalized = cleaned.toLowerCase();

  if (isRestDay(normalized)) {
    return null;
  }

  // Detectar contexto HIIT (rondas, circuitos, tabata)
  const isHIIT = /ronda|circuito|tabata|hiit/i.test(normalized);

  // Ejercicios de fuerza/activación sin contexto HIIT → no timer (modo GPS)
  if (/^(fuerza|activaci[oó]n)\b/i.test(normalized) && !isHIIT) {
    return null;
  }

  // Parsear repeticiones: "N series", "N rondas", o "NxTIEMPO"
  const seriesMatch = normalized.match(/(\d+)\s*(series?|rondas?)/i);
  const nxTimeMatch = normalized.match(/(\d+)\s*x\s*(\d+(?:[\.,]\d+)?)\s*(min|minuto|minutos|seg|segundo|segundos|s)\b/i);
  let reps = seriesMatch ? parseInt(seriesMatch[1], 10) : (nxTimeMatch ? parseInt(nxTimeMatch[1], 10) : 1);

  // Multiplicador "xN" al final (ej: "3 rondas de 20s ... x5")
  const xEndMatch = normalized.match(/x(\d+)\s*$/);
  if (xEndMatch && seriesMatch) {
    reps = parseInt(seriesMatch[1], 10) * parseInt(xEndMatch[1], 10);
  }

  // Buscar valores de tiempo — incluye "s" como abreviatura de segundos
  const timeMatches = [...normalized.matchAll(/(\d+(?:[\.,]\d+)?)\s*(min|minuto|minutos|seg|segundo|segundos|s)\b/gi)];
  const seconds = timeMatches.map(match => parseTimeToSeconds(match[1], match[2])).filter(Boolean);

  if (!seconds.length) {
    return null;
  }

  // Labels según tipo de ejercicio
  const exerciseLabel = isHIIT ? 'TRABAJO' : 'CORRER';
  const restLabel = isHIIT ? 'DESCANSO' : 'CAMINAR';

  if (seconds.length === 1) {
    return {
      title: cleaned,
      reps,
      exerciseTime: seconds[0],
      restTime: 0,
      exerciseLabel,
      restLabel
    };
  }

  // Para HIIT: detectar tiempo de descanso por palabra clave y sumar tiempos de trabajo
  if (isHIIT) {
    let restIdx = -1;
    const descKeywordIdx = normalized.search(/descanso|desc\b|caminar/i);
    if (descKeywordIdx >= 0) {
      let minDist = Infinity;
      timeMatches.forEach((match, idx) => {
        const dist = Math.abs(match.index - descKeywordIdx);
        if (dist < minDist) {
          minDist = dist;
          restIdx = idx;
        }
      });
    }
    if (restIdx >= 0) {
      const restTime = seconds[restIdx];
      const exerciseTime = seconds.reduce((sum, s, i) => i !== restIdx ? sum + s : sum, 0);
      return { title: cleaned, reps, exerciseTime, restTime, exerciseLabel, restLabel };
    }
    // Fallback: último tiempo es descanso, resto es trabajo
    const restTime = seconds[seconds.length - 1];
    const exerciseTime = seconds.slice(0, -1).reduce((a, b) => a + b, 0);
    return { title: cleaned, reps, exerciseTime, restTime, exerciseLabel, restLabel };
  }

  // Para ejercicios de carrera: detectar orden caminar/correr
  const walkingWords = ['caminando', 'caminar', 'caminata'];
  const runningWords = ['corriendo', 'correr', 'fuerte', 'rápid', 'trote', 'ritmo'];

  const walkingIndex = Math.min(...walkingWords.map(word => {
    const idx = normalized.indexOf(word);
    return idx === -1 ? Infinity : idx;
  }));

  const runningIndex = Math.min(...runningWords.map(word => {
    const idx = normalized.indexOf(word);
    return idx === -1 ? Infinity : idx;
  }));

  // "alternando" → primer tiempo es duración total, calcular reps
  if (/alternando/.test(normalized) && seconds.length >= 3) {
    const totalDuration = seconds[0];
    const exerciseTime = seconds[1];
    const restTime = seconds[2];
    const calculatedReps = Math.floor(totalDuration / (exerciseTime + restTime));
    return {
      title: cleaned,
      reps: calculatedReps || 1,
      exerciseTime,
      restTime,
      exerciseLabel,
      restLabel
    };
  }

  // "progresivo/más rápido" sin caminar → carrera continua, sumar tiempos
  if (/progresivo|más rápido/.test(normalized) && walkingIndex === Infinity) {
    return {
      title: cleaned,
      reps: 1,
      exerciseTime: seconds.reduce((a, b) => a + b, 0),
      restTime: 0,
      exerciseLabel,
      restLabel
    };
  }

  // Caminata sin palabras de correr → bloque continuo (ignora tiempos de fuerza)
  if (walkingIndex !== Infinity && runningIndex === Infinity) {
    return {
      title: cleaned,
      reps,
      exerciseTime: seconds[0],
      restTime: 0,
      exerciseLabel: 'CAMINAR',
      restLabel
    };
  }

  // 3+ tiempos → buscar descanso por proximidad a palabra clave
  if (seconds.length > 2) {
    const restKeywordIdx = normalized.search(/caminando|caminar|caminata|descanso|desc\b/i);
    if (restKeywordIdx >= 0) {
      let restIdx = -1;
      let minDist = Infinity;
      timeMatches.forEach((match, idx) => {
        const dist = Math.abs(match.index - restKeywordIdx);
        if (dist < minDist) {
          minDist = dist;
          restIdx = idx;
        }
      });
      if (restIdx >= 0) {
        const restTime = seconds[restIdx];
        if (nxTimeMatch) {
          const nxExerciseTime = parseTimeToSeconds(nxTimeMatch[2], nxTimeMatch[3]);
          return { title: cleaned, reps, exerciseTime: nxExerciseTime, restTime, exerciseLabel, restLabel };
        }
        const exerciseTime = seconds.reduce((sum, s, i) => i !== restIdx ? sum + s : sum, 0);
        return { title: cleaned, reps, exerciseTime, restTime, exerciseLabel, restLabel };
      }
    }
  }

  // Si "caminando" aparece antes que "corriendo", invertir el orden
  const isWalkingFirst = walkingIndex < runningIndex;

  if (isWalkingFirst) {
    return {
      title: cleaned,
      reps,
      exerciseTime: seconds[1],  // El segundo tiempo es para correr
      restTime: seconds[0],      // El primer tiempo es para caminar
      exerciseLabel,
      restLabel
    };
  }

  return {
    title: cleaned,
    reps,
    exerciseTime: seconds[0],
    restTime: seconds[1],
    exerciseLabel,
    restLabel
  };
}

function formatSeconds(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return secs.toString().padStart(2, '0');
}

function setRingProgress(remaining, total, mode = 'exercise') {
  if (!timerRingProgress) return;
  const safeTotal = Math.max(total, 1);
  const ratio = Math.max(0, Math.min(1, remaining / safeTotal));
  timerRingProgress.style.strokeDasharray = TIMER_RING_CIRCUMFERENCE;
  timerRingProgress.style.strokeDashoffset = `${TIMER_RING_CIRCUMFERENCE * (1 - ratio)}`;
  timerRingProgress.classList.toggle('exercise', mode === 'exercise');
  timerRingProgress.classList.toggle('rest', mode === 'rest');
}

function parseExerciseAndSetTimer(description) {
  currentDayWorkout = extractWorkoutPreset(description);
  const hasWorkout = Boolean(currentDayWorkout);
  startBtn.disabled = !hasWorkout;

  if (!hasWorkout) {
    timerWorkoutTitle.textContent = description;
    timerPhaseHint.textContent = 'Este dia no tiene un temporizador automatico disponible';
    totalRepsDisplay.textContent = '0';
    return;
  }

  totalReps = currentDayWorkout.reps;
  timerWorkoutTitle.textContent = currentDayWorkout.title;
  totalRepsDisplay.textContent = `${currentDayWorkout.reps}`;

  if (currentDayWorkout.restTime > 0) {
    timerPhaseHint.textContent = `${currentDayWorkout.exerciseLabel} ${formatSeconds(currentDayWorkout.exerciseTime)} / ${currentDayWorkout.restLabel} ${formatSeconds(currentDayWorkout.restTime)}`;
  } else {
    timerPhaseHint.textContent = `${currentDayWorkout.exerciseLabel} ${formatSeconds(currentDayWorkout.exerciseTime)}`;
  }
}

function openTimerModal(description) {
  parseExerciseAndSetTimer(description);
  resetTimer();
  // Mostrar/ocultar indicador GPS en el modal del timer
  const gpsIndicator = document.getElementById('timerGpsIndicator');
  if (gpsIndicator) gpsIndicator.style.display = currentDayWorkout ? 'flex' : 'none';
  timerModal.classList.add('active');
}

// ===========================================
// GPS TRACKING — FUNCIONES AUXILIARES
// ===========================================

async function startGpsTracking() {
  if (!window.GPS) return;
  lastGpsData = null;
  const gpsIndicator = document.getElementById('timerGpsIndicator') || document.getElementById('distGpsIndicator');
  const started = await GPS.start((data) => {
    // Actualizar indicador GPS en vivo
    if (gpsIndicator) {
      const distEl = gpsIndicator.querySelector('.gps-distance');
      const paceEl = gpsIndicator.querySelector('.gps-pace');
      if (distEl) distEl.textContent = GPS.formatDistance(data.distanceMeters);
      if (paceEl) paceEl.textContent = GPS.formatPace(data.paceSecsPerKm) + '/km';
    }
  });
  if (!started) return;
  if (gpsIndicator) {
    gpsIndicator.classList.add('tracking');
  }
}

function stopGpsTracking() {
  if (!window.GPS || !GPS.isTracking()) return;
  lastGpsData = GPS.stop();
  if (gpsUpdateInterval) {
    clearInterval(gpsUpdateInterval);
    gpsUpdateInterval = null;
  }
  const indicators = document.querySelectorAll('.gps-indicator');
  indicators.forEach(el => el.classList.remove('tracking'));
}

// ===========================================
// MODO ENTRENAMIENTO POR DISTANCIA (sin timer)
// ===========================================

let distanceModalDescription = '';
let distanceModalWeekIndex = null;
let distanceModalDayIndex = null;
let distanceElapsedInterval = null;

function extractTargetDistance(description) {
  const text = (description || '').toLowerCase();
  const kmMatches = [...text.matchAll(/(\d+(?:[.,]\d+)?)\s*km/gi)];
  if (kmMatches.length) {
    return kmMatches.reduce((sum, m) => sum + parseFloat(m[1].replace(',', '.')), 0);
  }
  return 0;
}

function hasTimerPreset(description) {
  return Boolean(extractWorkoutPreset(description));
}

function openDistanceModal(description, weekIndex, dayIndex) {
  distanceModalDescription = description;
  distanceModalWeekIndex = weekIndex;
  distanceModalDayIndex = dayIndex;

  const modal = document.getElementById('distanceModal');
  if (!modal) return;

  const targetKm = extractTargetDistance(description);
  document.getElementById('distWorkoutTitle').textContent = description;
  document.getElementById('distTargetLabel').textContent = targetKm > 0
    ? `Objetivo: ${targetKm} km` : 'Sin objetivo de distancia';
  document.getElementById('distCurrentDistance').textContent = '0 m';
  document.getElementById('distCurrentTime').textContent = '0:00';
  document.getElementById('distCurrentPace').textContent = '--:--/km';
  document.getElementById('distStartBtn').style.display = '';
  document.getElementById('distStopBtn').style.display = 'none';

  const gpsInd = document.getElementById('distGpsIndicator');
  if (gpsInd) {
    gpsInd.classList.remove('tracking');
    const distEl = gpsInd.querySelector('.gps-distance');
    const paceEl = gpsInd.querySelector('.gps-pace');
    if (distEl) distEl.textContent = '0 m';
    if (paceEl) paceEl.textContent = '--:--/km';
  }

  modal.classList.add('active');
}

function closeDistanceModal() {
  stopGpsTracking();
  if (distanceElapsedInterval) {
    clearInterval(distanceElapsedInterval);
    distanceElapsedInterval = null;
  }
  const modal = document.getElementById('distanceModal');
  if (modal) {
    modal.classList.remove('active');
    modal.classList.remove('running');
  }
}

async function startDistanceTracking() {
  if (!window.GPS) {
    showToast('GPS no disponible en este dispositivo', 'error');
    return;
  }

  const targetKm = extractTargetDistance(distanceModalDescription);
  let notified = false;

  document.getElementById('distStartBtn').style.display = 'none';
  document.getElementById('distStopBtn').style.display = '';
  document.getElementById('distanceModal').classList.add('running');

  lastGpsData = null;
  const startTs = Date.now();

  const started = await GPS.start((data) => {
    document.getElementById('distCurrentDistance').textContent = GPS.formatDistance(data.distanceMeters);
    document.getElementById('distCurrentPace').textContent = GPS.formatPace(data.paceSecsPerKm) + '/km';

    const gpsInd = document.getElementById('distGpsIndicator');
    if (gpsInd) {
      const distEl = gpsInd.querySelector('.gps-distance');
      const paceEl = gpsInd.querySelector('.gps-pace');
      if (distEl) distEl.textContent = GPS.formatDistance(data.distanceMeters);
      if (paceEl) paceEl.textContent = GPS.formatPace(data.paceSecsPerKm) + '/km';
    }

    // Notificar al alcanzar el objetivo
    if (targetKm > 0 && !notified && data.distanceKm >= targetKm) {
      notified = true;
      showToast(`🎉 ¡Has alcanzado los ${targetKm} km! Puedes seguir o parar.`, 'success');
      if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
  });

  if (!started) {
    document.getElementById('distStartBtn').style.display = '';
    document.getElementById('distStopBtn').style.display = 'none';
    document.getElementById('distanceModal').classList.remove('running');
    return;
  }

  const gpsInd = document.getElementById('distGpsIndicator');
  if (gpsInd) gpsInd.classList.add('tracking');

  // Actualizar cronómetro cada segundo
  distanceElapsedInterval = setInterval(() => {
    const elapsed = Math.round((Date.now() - startTs) / 1000);
    document.getElementById('distCurrentTime').textContent = GPS.formatTime(elapsed);
  }, 1000);
}

function stopDistanceTracking() {
  stopGpsTracking();
  if (distanceElapsedInterval) {
    clearInterval(distanceElapsedInterval);
    distanceElapsedInterval = null;
  }

  const modal = document.getElementById('distanceModal');
  if (modal) modal.classList.remove('running');

  if (lastGpsData && lastGpsData.distanceMeters > 0) {
    lastTimerElapsedSeconds = lastGpsData.elapsedSeconds;
    showToast(`Entrenamiento finalizado: ${GPS.formatDistance(lastGpsData.distanceMeters)} en ${GPS.formatTime(lastGpsData.elapsedSeconds)}`, 'success');
  }

  closeDistanceModal();
}

function closeTimerModal() {
  stopGpsTracking();
  resetTimer();
  timerModal.classList.remove('running');
  timerModal.classList.remove('active');
}

function startTimer() {
  if (isRunning || !currentDayWorkout) return;

  totalReps = currentDayWorkout.reps;
  currentRep = 0;
  isRunning = true;
  isExercise = true;
  timerStartTimestamp = Date.now();
  timerModal.classList.add('running');
  ensureAudioContext();

  // Iniciar GPS tracking
  startGpsTracking();

  nextPhase();
}

function pauseTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  timerLabel.textContent = 'Pausado';
  timerLabel.className = 'paused';
  timerPhaseHint.textContent = 'Presiona Iniciar para continuar';
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  isExercise = true;
  timeLeft = 0;
  phaseDuration = 0;
  countdownDisplay.textContent = '00';
  timerLabel.textContent = 'Listo';
  timerLabel.className = '';
  currentRepDisplay.textContent = '0';
  setRingProgress(1, 1, 'exercise');

  if (currentDayWorkout && currentDayWorkout.restTime > 0) {
    timerPhaseHint.textContent = `${currentDayWorkout.exerciseLabel} ${formatSeconds(currentDayWorkout.exerciseTime)} / ${currentDayWorkout.restLabel} ${formatSeconds(currentDayWorkout.restTime)}`;
  } else if (currentDayWorkout) {
    timerPhaseHint.textContent = `${currentDayWorkout.exerciseLabel} ${formatSeconds(currentDayWorkout.exerciseTime)}`;
  }
}

function updateDisplay() {
  countdownDisplay.textContent = formatSeconds(timeLeft);
  setRingProgress(timeLeft, phaseDuration, isExercise ? 'exercise' : 'rest');
}

function nextPhase() {
  clearInterval(timerInterval);

  if (isExercise) {
    if (currentRep >= totalReps) {
      countdownDisplay.textContent = 'FIN';
      timerLabel.textContent = 'Entrenamiento completado';
      timerLabel.className = 'exercise';
      timerPhaseHint.textContent = 'Excelente trabajo';
      isRunning = false;
      timerModal.classList.remove('running');

      // Guardar tiempo real del temporizador
      if (timerStartTimestamp) {
        lastTimerElapsedSeconds = Math.round((Date.now() - timerStartTimestamp) / 1000);
        timerStartTimestamp = null;
      }

      // Parar GPS y guardar datos
      stopGpsTracking();

      if (soundMode === 'on' || soundMode === 'success') {
        createCompletionSound();
      }

      showToast('¡Entrenamiento completado! 🎉', 'success');
      return;
    }

    currentRep++;
    currentRepDisplay.textContent = `${currentRep}`;
    timeLeft = currentDayWorkout.exerciseTime;
    phaseDuration = currentDayWorkout.exerciseTime;
    timerLabel.textContent = `¡${currentDayWorkout.exerciseLabel}!`;
    timerLabel.className = 'exercise';
    timerPhaseHint.textContent = `Serie ${currentRep} de ${totalReps}`;

    if (soundMode === 'on' || soundMode === 'motivation') {
      createBellSound();
    }
  } else {
    timeLeft = currentDayWorkout.restTime;
    phaseDuration = currentDayWorkout.restTime;
    timerLabel.textContent = `¡${currentDayWorkout.restLabel}!`;
    timerLabel.className = 'rest';
    timerPhaseHint.textContent = `Preparando serie ${Math.min(currentRep + 1, totalReps)}`;

    if (soundMode === 'on' || soundMode === 'motivation') {
      createBellSound();
    }
  }

  // Si no existe fase de descanso, saltar directamente a la siguiente serie.
  if (!phaseDuration || phaseDuration <= 0) {
    isExercise = !isExercise;
    nextPhase();
    return;
  }

  updateDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft === 3 && (soundMode === 'on' || soundMode === 'motivation')) {
      createBellSound();
    }

    if (timeLeft <= 0) {
      if (soundMode === 'on' || soundMode === 'motivation') {
        createCompletionSound();
      }

      isExercise = !isExercise;
      nextPhase();
    }
  }, 1000);
}

// Generador de sonidos
function createBellSound() {
  const context = sharedAudioContext;
  if (!context || context.state !== 'running') return;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, context.currentTime); // La4
  
  gainNode.gain.setValueAtTime(0.5, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);
  
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  oscillator.start();
  oscillator.stop(context.currentTime + 1);
}

function createCompletionSound() {
  const context = sharedAudioContext;
  if (!context || context.state !== 'running') return;

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(523.25, context.currentTime); // C5
  oscillator.frequency.setValueAtTime(659.25, context.currentTime + 0.2); // E5
  oscillator.frequency.setValueAtTime(783.99, context.currentTime + 0.4); // G5
  
  gainNode.gain.setValueAtTime(0.5, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 1);
  
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  oscillator.start();
  oscillator.stop(context.currentTime + 1);
}
// ===========================================
// PREVENIR BLOQUEO DE PANTALLA (WAKE LOCK)
// ===========================================
let wakeLock = null;

// Solicitar Wake Lock
async function enableWakeLock() {
  try {
    if ("wakeLock" in navigator) {
      wakeLock = await navigator.wakeLock.request("screen");
      console.log("🔆 Wake Lock activado");

      wakeLock.addEventListener("release", () => {
        console.log("🌙 Wake Lock liberado");
      });
    }
  } catch (err) {
    console.warn("Wake Lock no disponible:", err);
  }
}

// Liberar Wake Lock
function disableWakeLock() {
  if (wakeLock) {
    wakeLock.release();
    wakeLock = null;
  }
}

// Reactivar Wake Lock si el usuario vuelve a la app
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    enableWakeLock();
  } else {
    disableWakeLock();
  }
});

// Activar Wake Lock cuando el usuario está logueado
function activateWakeLockIfNeeded() {
  if (currentUser) {
    enableWakeLock();
  }
}

/// ===========================================
// USER BAR + HAPTIC FEEDBACK (MÓVIL)
// ===========================================
(function () {
  let lastScrollY = window.scrollY;
  let startY = 0;
  let endY = 0;
  let hideTimeout = null;
  let visibleUntil = 0;

  // La barra superior queda desactivada: toda la información vive en la vista "Yo".
  if (userBar) {
    userBar.classList.remove('visible');
  }
  return;

  // 🔔 HAPTIC (solo si está disponible)
  function vibrate(pattern) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  function showUserBar(withHaptic = false) {
    if (!currentUser) return;

    userBar.classList.add("visible");
    visibleUntil = Date.now() + 3000;

    if (withHaptic) {
      vibrate(15); // vibración corta
    }

    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      userBar.classList.remove("visible");
      visibleUntil = 0;
    }, 3000);
  }

  function hideUserBar(withHaptic = false, force = false) {
    if (!currentUser) return;

    if (!force && Date.now() < visibleUntil) return;

    userBar.classList.remove("visible");
    visibleUntil = 0;

    if (withHaptic) {
      vibrate([10, 40, 10]); // patrón distinto
    }

    if (hideTimeout) clearTimeout(hideTimeout);
  }

  // ===== SCROLL =====
  window.addEventListener("scroll", () => {
    if (!currentUser) return;

    const currentScroll = window.scrollY;
    const scrollDelta = currentScroll - lastScrollY;

    if (currentScroll <= 10) {
      showUserBar(false);
      lastScrollY = currentScroll;
      return;
    }

    if (Math.abs(scrollDelta) < 8) {
      return;
    }

    if (currentScroll < lastScrollY) {
      showUserBar(false);
    } else {
      hideUserBar(false);
    }

    lastScrollY = currentScroll;
  });

  // ===== TOUCH (SWIPE) =====
  window.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
  });

  window.addEventListener("touchmove", (e) => {
    endY = e.touches[0].clientY;
  });

  window.addEventListener("touchend", () => {
    if (!currentUser) return;

    const diffY = endY - startY;

    if (diffY > 60) {
      // Swipe hacia abajo
      showUserBar(true);
    } else if (diffY < -60) {
      // Swipe hacia arriba
      hideUserBar(true, true);
    }

    startY = 0;
    endY = 0;
  });

  // ===== INTERACCIÓN DIRECTA =====
  userBar.addEventListener("touchstart", () => {
    vibrate(8); // micro feedback al tocar la barra
    if (hideTimeout) clearTimeout(hideTimeout);
  });

})();


// ===========================================
// PLAN 10K PERSONALIZADO - LÓGICA COMPLETA
// ===========================================

function calcular10KPaces(pace5kSecs) {
  // Ritmo objetivo 10K con Riegel: t2 = t1 * (d2/d1)^1.06
  const target10kTotal = pace5kSecs * Math.pow(2, 1.06);
  const targetPerKm   = target10kTotal / 10;
  // Z2 suave: +20% sobre ritmo objetivo
  const easyPerKm   = targetPerKm * 1.20;
  // Z3 medio: +8%
  const mediumPerKm = targetPerKm * 1.08;

  return {
    easyPerKm:   Math.round(easyPerKm),
    mediumPerKm: Math.round(mediumPerKm),
    targetPerKm: Math.round(targetPerKm),
    time10k:     Math.round(target10kTotal)
  };
}

function generate10KPlan(paces) {
  const easy   = secsToMMSS(paces.easyPerKm)   + '/km';
  const medium = secsToMMSS(paces.mediumPerKm)  + '/km';
  const target = secsToMMSS(paces.targetPerKm)  + '/km';

  return [
    // S1 — Base aeróbica
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `3 km suaves • Ritmo ${easy}`],
      ["Miércoles","25 min fuerza: sentadillas, zancadas, plancha"],
      ["Jueves",   `4 km ritmo cómodo • Ritmo ${easy}`],
      ["Viernes",  "Descanso"],
      ["Sábado",   `5 km largo suave • Ritmo ${easy}`],
      ["Domingo",  "Descanso activo: caminata 30 min"]
    ],
    // S2 — Construyendo volumen
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `4 km suaves • Ritmo ${easy}`],
      ["Miércoles","Series: 5×400 m con 90 seg descanso • Ritmo fuerte"],
      ["Jueves",   `3 km recuperación • Ritmo ${easy}`],
      ["Viernes",  "Fuerza + core (25 min)"],
      ["Sábado",   `6 km largo suave • Ritmo ${easy}`],
      ["Domingo",  "Descanso"]
    ],
    // S3 — Introduciendo ritmo
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `4 km — últimos 1.5 km a ritmo medio • ${medium}`],
      ["Miércoles","Fuerza piernas (sentadillas búlgaras, peso muerto)"],
      ["Jueves",   `Series: 4×600 m (90 seg descanso) • Ritmo fuerte`],
      ["Viernes",  "Descanso"],
      ["Sábado",   `7 km largo • Ritmo ${easy}`],
      ["Domingo",  "Descanso activo"]
    ],
    // S4 — Descarga
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `3 km muy suave • Ritmo ${easy}`],
      ["Miércoles","20 min movilidad + core"],
      ["Jueves",   `3 km suave • Ritmo ${easy}`],
      ["Viernes",  "Descanso"],
      ["Sábado",   `5 km suave • Ritmo ${easy}`],
      ["Domingo",  "Descanso — semana de recuperación"]
    ],
    // S5 — Calidad
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `5 km: 2 km suaves + 3 km ritmo medio • ${medium}`],
      ["Miércoles","Fuerza + core (25 min)"],
      ["Jueves",   `Series: 3×1 km (90 seg descanso) • Ritmo ${target}`],
      ["Viernes",  "Descanso"],
      ["Sábado",   `8 km largo suave • Ritmo ${easy}`],
      ["Domingo",  "Descanso activo"]
    ],
    // S6 — Pico de volumen
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `5 km suaves • Ritmo ${easy}`],
      ["Miércoles",`Series: 3×1.5 km a ritmo objetivo • ${target} (2 min descanso)`],
      ["Jueves",   `4 km recuperación • Ritmo ${easy}`],
      ["Viernes",  "Fuerza liviana (20 min)"],
      ["Sábado",   `9 km largo — máximo del plan • Ritmo ${easy}`],
      ["Domingo",  "Descanso"]
    ],
    // S7 — Taper
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `4 km suaves • Ritmo ${easy}`],
      ["Miércoles",`3×800 m a ritmo carrera • ${target}`],
      ["Jueves",   `3 km suaves • Ritmo ${easy}`],
      ["Viernes",  "Descanso"],
      ["Sábado",   `6 km suave • Ritmo ${easy}`],
      ["Domingo",  "Descanso"]
    ],
    // S8 — Semana de carrera
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `3 km suaves • Ritmo ${easy}`],
      ["Miércoles","3×400 m a ritmo carrera + estiramientos"],
      ["Jueves",   "Descanso completo"],
      ["Viernes",  "20 min caminata o movilidad"],
      ["Sábado",   "Descanso total — descansa bien"],
      ["Domingo",  "🏆 ¡CARRERA 10K! — Disfruta cada kilómetro"]
    ]
  ];
}

function iniciar10K() {
  if (!currentUser) return;
  document.getElementById('modal10K').classList.add('active');
  if (currentUser.pace5k_10k) {
    const input = document.getElementById('pace5kInput10K');
    input.value = secsToMMSS(currentUser.pace5k_10k);
    calcularYMostrarPaces10K(currentUser.pace5k_10k);
  }
}

function calcularYMostrarPaces10K(secs) {
  const paces = calcular10KPaces(secs);
  document.getElementById('pace10kEasy').textContent    = secsToMMSS(paces.easyPerKm)   + '/km';
  document.getElementById('pace10kMedium').textContent  = secsToMMSS(paces.mediumPerKm) + '/km';
  document.getElementById('pace10kTarget').textContent  = secsToMMSS(paces.targetPerKm) + '/km';
  const m = Math.floor(paces.time10k / 60);
  const s = paces.time10k % 60;
  document.getElementById('time10k').textContent = `${m} min ${String(s).padStart(2,'0')} seg`;
  document.getElementById('paceSummary10K').style.display = 'block';
}

// Event listeners del modal 10K
function initModal10K() {
  const modal10K    = document.getElementById('modal10K');
  const closeBtn    = document.getElementById('closeModal10KBtn');
  const input       = document.getElementById('pace5kInput10K');
  const errorMsg    = document.getElementById('pace5k10KError');
  const generateBtn = document.getElementById('generate10KBtn');

  if (!modal10K) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal10K.classList.remove('active'));
  }
  modal10K.addEventListener('click', (e) => {
    if (e.target === modal10K) modal10K.classList.remove('active');
  });

  if (input) {
    input.addEventListener('input', () => {
      const val = input.value.trim();
      errorMsg.style.display = 'none';
      if (/^\d{1,2}:\d{2}$/.test(val)) {
        const secs = mmssToSecs(val);
        if (!isNaN(secs) && secs > 0) {
          calcularYMostrarPaces10K(secs);
        }
      } else {
        document.getElementById('paceSummary10K').style.display = 'none';
      }
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const val = input.value.trim();
      if (!/^\d{1,2}:\d{2}$/.test(val)) {
        errorMsg.style.display = 'block';
        return;
      }
      const secs = mmssToSecs(val);
      if (isNaN(secs) || secs <= 0) {
        errorMsg.style.display = 'block';
        return;
      }

      const paces = calcular10KPaces(secs);
      planes['10k'] = generate10KPlan(paces);

      if (currentUser) {
        currentUser.pace5k_10k = secs;
        saveUserData();
        if (currentUser.progressData['10k']) {
          delete currentUser.progressData['10k'];
          saveUserData();
        }
      }

      modal10K.classList.remove('active');
      cambiarPlan('10k');
      showToast('🏅 Plan 10K generado con tus ritmos personalizados', 'success');
    });
  }
}

// ===========================================
// PLAN 20K - LÓGICA COMPLETA
// ===========================================

function secsToMMSS(totalSecs) {
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function mmssToSecs(str) {
  const parts = str.split(':');
  if (parts.length !== 2) return NaN;
  const m = parseInt(parts[0], 10);
  const s = parseInt(parts[1], 10);
  if (isNaN(m) || isNaN(s) || s >= 60) return NaN;
  return m * 60 + s;
}

function calcular20KPaces(pace5kSecs) {
  // Ritmo por km en 5K
  const pace5kPerKm = pace5kSecs / 5;
  // Ritmo objetivo 20K (Riegel: t2 = t1 * (d2/d1)^1.06)
  const target20kTotal = pace5kSecs * Math.pow(4, 1.06);
  const targetPerKm   = target20kTotal / 20;
  // Z2 suave: +25% sobre ritmo objetivo
  const easyPerKm   = targetPerKm * 1.25;
  // Z3 medio: +10%
  const mediumPerKm = targetPerKm * 1.10;

  return {
    easyPerKm:   Math.round(easyPerKm),
    mediumPerKm: Math.round(mediumPerKm),
    targetPerKm: Math.round(targetPerKm),
    time20k:     Math.round(target20kTotal)
  };
}

function generate20KPlan(paces) {
  const easy   = secsToMMSS(paces.easyPerKm)   + '/km';
  const medium = secsToMMSS(paces.mediumPerKm)  + '/km';
  const target = secsToMMSS(paces.targetPerKm)  + '/km';

  return [
    // S1 - Base aeróbica
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `5 km suaves • Ritmo ${easy}`],
      ["Miércoles","30 min fuerza: sentadillas, zancadas, plancha"],
      ["Jueves",   `6 km ritmo medio • Ritmo ${medium}`],
      ["Viernes",  "Descanso o movilidad 20 min"],
      ["Sábado",   `8 km largo suave • Ritmo ${easy}`],
      ["Domingo",  "Descanso activo: caminata o bici"]
    ],
    // S2 - Construyendo volumen
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `6 km suaves • Ritmo ${easy}`],
      ["Miércoles","Series: 6×400 m con 90 seg descanso • Ritmo fuerte"],
      ["Jueves",   `5 km recuperación suave • Ritmo ${easy}`],
      ["Viernes",  "Fuerza + core (30 min)"],
      ["Sábado",   `10 km largo suave • Ritmo ${easy}`],
      ["Domingo",  "Descanso"]
    ],
    // S3 - Ritmo objetivo
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `6 km — últimos 2 km a ritmo objetivo • Ritmo objetivo: ${target}`],
      ["Miércoles","Fuerza piernas (sentadillas búlgaras, peso muerto)"],
      ["Jueves",   `Series: 5×800 m (1 min descanso) • Ritmo fuerte`],
      ["Viernes",  "Descanso"],
      ["Sábado",   `12 km largo • Ritmo ${easy}`],
      ["Domingo",  "Descanso activo"]
    ],
    // S4 - Descarga
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `5 km muy suave • Ritmo ${easy}`],
      ["Miércoles","20 min movilidad + core"],
      ["Jueves",   `4 km suave • Ritmo ${easy}`],
      ["Viernes",  "Descanso"],
      ["Sábado",   `8 km suave • Ritmo ${easy}`],
      ["Domingo",  "Descanso — semana de recuperación"]
    ],
    // S5 - Calidad
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `Tempo run 7 km: 3 km suaves + 4 km ritmo medio • ${medium}`],
      ["Miércoles","Fuerza + core (30 min)"],
      ["Jueves",   `Series: 4×1.200 m (90 seg descanso) • Ritmo fuerte`],
      ["Viernes",  "Descanso"],
      ["Sábado",   `14 km largo suave • Ritmo ${easy}`],
      ["Domingo",  "Descanso activo"]
    ],
    // S6 - Pico de volumen
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `8 km suaves • Ritmo ${easy}`],
      ["Miércoles",`Series: 3×2 km a ritmo objetivo • ${target} (2 min descanso)`],
      ["Jueves",   `6 km recuperación suave • Ritmo ${easy}`],
      ["Viernes",  "Fuerza liviana (20 min)"],
      ["Sábado",   `16 km largo — máximo del plan • Ritmo ${easy}`],
      ["Domingo",  "Descanso"]
    ],
    // S7 - Taper
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `6 km suaves • Ritmo ${easy}`],
      ["Miércoles",`3×1 km a ritmo carrera • ${target}`],
      ["Jueves",   `5 km suaves • Ritmo ${easy}`],
      ["Viernes",  "Descanso"],
      ["Sábado",   `10 km suave • Ritmo ${easy}`],
      ["Domingo",  "Descanso"]
    ],
    // S8 - Semana de carrera
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `4 km suaves • Ritmo ${easy}`],
      ["Miércoles","3×400 m a ritmo carrera + estiramientos"],
      ["Jueves",   "Descanso completo"],
      ["Viernes",  "20 min caminata o yoga"],
      ["Sábado",   "Descanso total — descansa bien"],
      ["Domingo",  "🏆 ¡CARRERA 21K! — Disfruta cada kilómetro"]
    ]
  ];
}

function iniciar20K() {
  if (!currentUser) return;
  document.getElementById('modal20K').classList.add('active');
  // Pre-rellenar si ya tiene pace guardado
  if (currentUser.pace5k) {
    const input = document.getElementById('pace5kInput');
    input.value = secsToMMSS(currentUser.pace5k);
    calcularYMostrarPaces(currentUser.pace5k);
  }
}

function calcularYMostrarPaces(secs) {
  const paces = calcular20KPaces(secs);
  document.getElementById('paceEasy').textContent    = secsToMMSS(paces.easyPerKm)   + '/km';
  document.getElementById('paceMedium').textContent  = secsToMMSS(paces.mediumPerKm) + '/km';
  document.getElementById('paceTarget').textContent  = secsToMMSS(paces.targetPerKm) + '/km';
  const h = Math.floor(paces.time20k / 3600);
  const m = Math.floor((paces.time20k % 3600) / 60);
  const s = paces.time20k % 60;
  document.getElementById('time20k').textContent = h > 0
    ? `${h}h ${String(m).padStart(2,'0')}min ${String(s).padStart(2,'0')}seg`
    : `${m} min ${String(s).padStart(2,'0')} seg`;
  document.getElementById('paceSummary').style.display = 'block';
}

// Event listeners del modal 20K
function initModal20K() {
  const modal20K      = document.getElementById('modal20K');
  const closeBtn      = document.getElementById('closeModal20KBtn');
  const input         = document.getElementById('pace5kInput');
  const errorMsg      = document.getElementById('pace5kError');
  const generateBtn   = document.getElementById('generate20KBtn');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => modal20K.classList.remove('active'));
  }
  modal20K.addEventListener('click', (e) => {
    if (e.target === modal20K) modal20K.classList.remove('active');
  });

  // Preview en tiempo real al escribir
  if (input) {
    input.addEventListener('input', () => {
      const val = input.value.trim();
      errorMsg.style.display = 'none';
      if (/^\d{1,2}:\d{2}$/.test(val)) {
        const secs = mmssToSecs(val);
        if (!isNaN(secs) && secs > 0) {
          calcularYMostrarPaces(secs);
        }
      } else {
        document.getElementById('paceSummary').style.display = 'none';
      }
    });
  }

  // Generar plan
  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const val = input.value.trim();
      if (!/^\d{1,2}:\d{2}$/.test(val)) {
        errorMsg.style.display = 'block';
        return;
      }
      const secs = mmssToSecs(val);
      if (isNaN(secs) || secs <= 0) {
        errorMsg.style.display = 'block';
        return;
      }

      const paces = calcular20KPaces(secs);
      planes['20k'] = generate20KPlan(paces);

      // Guardar pace en el usuario
      if (currentUser) {
        currentUser.pace5k = secs;
        saveUserData();
        // Resetear progreso si ya existía
        if (currentUser.progressData['20k']) {
          delete currentUser.progressData['20k'];
          saveUserData();
        }
      }

      modal20K.classList.remove('active');
      cambiarPlan('20k');
      showToast('🎯 Plan 1/2 Maratón generado con tus ritmos personalizados', 'success');
    });
  }
}

// ===========================================
// PLAN MARATÓN 42K - LÓGICA COMPLETA
// ===========================================

function calcularMaratonPaces(pace10kSecs) {
  // Ritmo por km en 10K
  const pace10kPerKm = pace10kSecs / 10;
  // Tiempo maratón estimado con Riegel: t2 = t1 * (42.195/10)^1.06
  const totalMaraton = pace10kSecs * Math.pow(4.2195, 1.06);
  const targetPerKm  = totalMaraton / 42.195;
  // Zonas
  const easyPerKm   = targetPerKm * 1.18;   // Z2: +18%
  const mediumPerKm = targetPerKm * 1.08;   // Z3: +8%
  const tempoPerKm  = targetPerKm * 0.97;   // Tempo: -3%

  return {
    easyPerKm:   Math.round(easyPerKm),
    mediumPerKm: Math.round(mediumPerKm),
    tempoPerKm:  Math.round(tempoPerKm),
    targetPerKm: Math.round(targetPerKm),
    totalMaraton: Math.round(totalMaraton)
  };
}

function generateMaratonPlan(paces) {
  const easy   = secsToMMSS(paces.easyPerKm)   + '/km';
  const medium = secsToMMSS(paces.mediumPerKm)  + '/km';
  const tempo  = secsToMMSS(paces.tempoPerKm)   + '/km';
  const target = secsToMMSS(paces.targetPerKm)  + '/km';

  return [
    // ── BLOQUE 1: BASE AERÓBICA (S1–S4) ──
    // S1
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `8 km suaves Z2 • ${easy}`],
      ["Miércoles",`10 km suaves Z2 • ${easy}`],
      ["Jueves",   `8 km suaves Z2 • ${easy}`],
      ["Viernes",  "Fuerza: sentadillas, zancadas, peso muerto, plancha"],
      ["Sábado",   `5 km suaves • ${easy}`],
      ["Domingo",  `14 km largo Z2 • ${easy}`]
    ],
    // S2
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `8 km suaves Z2 • ${easy}`],
      ["Miércoles",`11 km suaves Z2 • ${easy}`],
      ["Jueves",   `9 km suaves Z2 • ${easy}`],
      ["Viernes",  "Fuerza: sentadillas búlgaras, hip thrust, core 30 min"],
      ["Sábado",   `6 km suaves • ${easy}`],
      ["Domingo",  `16 km largo Z2 • ${easy}`]
    ],
    // S3
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `10 km suaves Z2 • ${easy}`],
      ["Miércoles",`12 km suaves Z2 • ${easy}`],
      ["Jueves",   `10 km suaves Z2 • ${easy}`],
      ["Viernes",  "Fuerza + movilidad de cadera y tobillos"],
      ["Sábado",   `6 km suaves • ${easy}`],
      ["Domingo",  `18 km largo Z2 • ${easy}`]
    ],
    // S4 - Descarga
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `6 km suaves Z2 • ${easy}`],
      ["Miércoles",`8 km suaves Z2 • ${easy}`],
      ["Jueves",   `6 km suaves Z2 • ${easy}`],
      ["Viernes",  "Descanso — semana de recuperación"],
      ["Sábado",   `5 km suaves • ${easy}`],
      ["Domingo",  `12 km largo Z2 • ${easy}`]
    ],

    // ── BLOQUE 2: CALIDAD (S5–S8) ──
    // S5
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `10 km suaves Z2 • ${easy}`],
      ["Miércoles",`13 km: 5 km suaves + 6 km ritmo medio + 2 km suaves • Z3: ${medium}`],
      ["Jueves",   `10 km suaves Z2 • ${easy}`],
      ["Viernes",  "Fuerza liviana + core"],
      ["Sábado",   `6 km suaves • ${easy}`],
      ["Domingo",  `20 km largo Z2 • ${easy}`]
    ],
    // S6
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `10 km suaves Z2 • ${easy}`],
      ["Miércoles",`Series: 6×1 km a ritmo 10K (2 min descanso)`],
      ["Jueves",   `11 km suaves Z2 • ${easy}`],
      ["Viernes",  "Fuerza liviana + core"],
      ["Sábado",   `6 km suaves • ${easy}`],
      ["Domingo",  `22 km largo Z2 • ${easy}`]
    ],
    // S7
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `11 km suaves Z2 • ${easy}`],
      ["Miércoles",`14 km: 4 km suaves + 8 km ritmo medio + 2 km suaves • Z3: ${medium}`],
      ["Jueves",   `11 km suaves Z2 • ${easy}`],
      ["Viernes",  "Fuerza liviana + core"],
      ["Sábado",   `6 km suaves • ${easy}`],
      ["Domingo",  `24 km largo Z2 • ${easy}`]
    ],
    // S8 - Descarga
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `8 km suaves Z2 • ${easy}`],
      ["Miércoles",`10 km: 4 km suaves + 4 km ritmo medio + 2 km suaves • Z3: ${medium}`],
      ["Jueves",   `8 km suaves Z2 • ${easy}`],
      ["Viernes",  "Descanso — semana de recuperación"],
      ["Sábado",   `5 km suaves • ${easy}`],
      ["Domingo",  `16 km largo Z2 • ${easy}`]
    ],

    // ── BLOQUE 3: PICO (S9–S12) ──
    // S9
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `12 km suaves Z2 • ${easy}`],
      ["Miércoles",`17 km tempo: 6 km suaves + 8 km tempo + 3 km suaves • Tempo: ${tempo}`],
      ["Jueves",   `12 km suaves Z2 • ${easy}`],
      ["Viernes",  "Fuerza liviana"],
      ["Sábado",   `8 km suaves • ${easy}`],
      ["Domingo",  `26 km largo: 18 km Z2 + 8 km a ritmo maratón • RM: ${target}`]
    ],
    // S10
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `12 km suaves Z2 • ${easy}`],
      ["Miércoles",`Series: 5×1.600 m a ritmo 10K (2 min descanso)`],
      ["Jueves",   `12 km suaves Z2 • ${easy}`],
      ["Viernes",  "Fuerza liviana"],
      ["Sábado",   `8 km suaves • ${easy}`],
      ["Domingo",  `28 km largo: 18 km Z2 + 10 km a ritmo maratón • RM: ${target}`]
    ],
    // S11 - PICO
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `13 km suaves Z2 • ${easy}`],
      ["Miércoles",`18 km tempo: 5 km suaves + 10 km tempo + 3 km suaves • Tempo: ${tempo}`],
      ["Jueves",   `13 km suaves Z2 • ${easy}`],
      ["Viernes",  "Fuerza liviana"],
      ["Sábado",   `8 km suaves • ${easy}`],
      ["Domingo",  `30 km largo: 18 km Z2 + 12 km a ritmo maratón • RM: ${target} ← PICO DEL PLAN`]
    ],
    // S12 - Descarga
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `10 km suaves Z2 • ${easy}`],
      ["Miércoles",`12 km: 5 km suaves + 5 km ritmo medio + 2 km suaves • Z3: ${medium}`],
      ["Jueves",   `10 km suaves Z2 • ${easy}`],
      ["Viernes",  "Descanso — recuperación post-pico"],
      ["Sábado",   `6 km suaves • ${easy}`],
      ["Domingo",  `20 km largo Z2 • ${easy}`]
    ],

    // ── BLOQUE 4: TAPER (S13–S16) ──
    // S13
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `10 km suaves Z2 • ${easy}`],
      ["Miércoles",`Series: 3×2 km a ritmo maratón (2 min descanso) • RM: ${target}`],
      ["Jueves",   `10 km suaves Z2 • ${easy}`],
      ["Viernes",  "Fuerza liviana"],
      ["Sábado",   `6 km suaves • ${easy}`],
      ["Domingo",  `22 km largo: 14 km Z2 + 8 km a ritmo maratón • RM: ${target}`]
    ],
    // S14
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `8 km suaves Z2 • ${easy}`],
      ["Miércoles",`Series: 4×1 km a ritmo 10K (90 seg descanso)`],
      ["Jueves",   `8 km suaves Z2 • ${easy}`],
      ["Viernes",  "Descanso"],
      ["Sábado",   `5 km suaves • ${easy}`],
      ["Domingo",  `16 km largo Z2 • ${easy}`]
    ],
    // S15 - Taper profundo
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `6 km suaves Z2 • ${easy}`],
      ["Miércoles",`3×1 km a ritmo maratón + estiramientos • RM: ${target}`],
      ["Jueves",   `5 km suaves Z2 • ${easy}`],
      ["Viernes",  "Descanso"],
      ["Sábado",   `4 km muy suaves • ${easy}`],
      ["Domingo",  `12 km muy suave Z2 • ${easy}`]
    ],
    // S16 - Semana de carrera
    [
      ["Lunes",    "Descanso"],
      ["Martes",   `4 km suaves Z2 • ${easy}`],
      ["Miércoles","3×400 m a ritmo carrera + estiramientos completos"],
      ["Jueves",   "Descanso completo"],
      ["Viernes",  "20 min caminata + movilidad articular"],
      ["Sábado",   "Descanso total — hidratación y sueño"],
      ["Domingo",  "🏆 ¡MARATÓN 42K! — Disfruta cada kilómetro. ¡Lo tienes!"]
    ]
  ];
}

function iniciarMaraton() {
  if (!currentUser) return;
  document.getElementById('modalMaraton').classList.add('active');
  if (currentUser.pace10k) {
    const input = document.getElementById('pace10kInput');
    input.value = secsToMMSS(currentUser.pace10k);
    calcularYMostrarPacesMaraton(currentUser.pace10k);
  }
}

function calcularYMostrarPacesMaraton(secs) {
  const paces = calcularMaratonPaces(secs);
  document.getElementById('mPaceEasy').textContent   = secsToMMSS(paces.easyPerKm)   + '/km';
  document.getElementById('mPaceMedium').textContent = secsToMMSS(paces.mediumPerKm) + '/km';
  document.getElementById('mPaceTempo').textContent  = secsToMMSS(paces.tempoPerKm)  + '/km';
  document.getElementById('mPaceTarget').textContent = secsToMMSS(paces.targetPerKm) + '/km';

  const t = paces.totalMaraton;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  document.getElementById('mTime42k').textContent = h > 0
    ? `${h}h ${String(m).padStart(2,'0')}min ${String(s).padStart(2,'0')}seg`
    : `${m} min ${String(s).padStart(2,'0')} seg`;

  document.getElementById('paceSummaryMaraton').style.display = 'block';
}

// Event listeners del modal Maratón
function initModalMaraton() {
  const modalM    = document.getElementById('modalMaraton');
  const closeBtn  = document.getElementById('closeModalMaratonBtn');
  const input     = document.getElementById('pace10kInput');
  const errorMsg  = document.getElementById('pace10kError');
  const genBtn    = document.getElementById('generateMaratonBtn');

  if (closeBtn) closeBtn.addEventListener('click', () => modalM.classList.remove('active'));
  modalM.addEventListener('click', (e) => {
    if (e.target === modalM) modalM.classList.remove('active');
  });

  if (input) {
    input.addEventListener('input', () => {
      const val = input.value.trim();
      errorMsg.style.display = 'none';
      if (/^\d{1,2}:\d{2}$/.test(val)) {
        const secs = mmssToSecs(val);
        if (!isNaN(secs) && secs > 0) calcularYMostrarPacesMaraton(secs);
      } else {
        document.getElementById('paceSummaryMaraton').style.display = 'none';
      }
    });
  }

  if (genBtn) {
    genBtn.addEventListener('click', () => {
      const val = input.value.trim();
      if (!/^\d{1,2}:\d{2}$/.test(val)) { errorMsg.style.display = 'block'; return; }
      const secs = mmssToSecs(val);
      if (isNaN(secs) || secs <= 0) { errorMsg.style.display = 'block'; return; }

      const paces = calcularMaratonPaces(secs);
      planes['maraton'] = generateMaratonPlan(paces);

      if (currentUser) {
        currentUser.pace10k = secs;
        saveUserData();
        if (currentUser.progressData['maraton']) {
          delete currentUser.progressData['maraton'];
          saveUserData();
        }
      }

      modalM.classList.remove('active');
      cambiarPlan('maraton');
      showToast('🏆 Plan Maratón generado con tus ritmos personalizados', 'success');
    });
  }
}
