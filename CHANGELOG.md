# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato se basa en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.2.1] - 2026-05-17

### 🔄 Cambiado

#### Entrenamientos y UI
- Ajuste visual de tarjetas de planes para reducir altura y separación en móviles.
- Menor separación entre título de sección y primera tarjeta en la vista de entrenamientos.

#### Mensajes motivacionales
- El globo motivacional al seleccionar plan ahora se auto-oculta en ~4 segundos.
- Se evita la reaparición inmediata del mismo mensaje para mejorar la experiencia.

#### Documentación
- README actualizado con URL real del repositorio, flujo de build actual y estructura de archivos vigente.
- Enlaces y ejemplos de clonado ajustados al repositorio actual.

## [1.1.0] - 2026-03-14

### ✨ Agregado

#### Nuevos Planes Personalizados
- **Plan 20K personalizado (8 semanas)** con generación dinámica según marca de 5K
- **Plan Maratón 42K personalizado (16 semanas)** con generación dinámica según marca de 10K
- Modales de configuración con validación de tiempo en formato `mm:ss`
- Vista previa de ritmos antes de generar cada plan

#### Cálculo de Ritmos
- Conversión y validación de tiempos (`mm:ss` ↔ segundos)
- Estimación de ritmos por zona con fórmula de Riegel
- Cálculo de tiempo objetivo estimado para 20K y Maratón

### 🔄 Cambiado

#### Sistema de XP y Progresión
- Nuevo valor XP para plan **20K**: `50 XP/día`
- Nuevo valor XP para plan **Maratón**: `65 XP/día`
- Actualización de recomendaciones de planes con mayor XP en el perfil

#### Sistema de Insignias
- Nueva insignia `plan-20k` (Medio Maratoniano)
- Nueva insignia `plan-maraton` (Maratoniano)
- Requisito de `todos-planes` actualizado de 6 a 8 planes completados

#### Interfaz
- Se agregan dos nuevas tarjetas de plan: **20K** y **Maratón**
- Se añaden estilos reutilizables para filas de ritmo (`.pace-row`)

### 🛠 Técnico

- Integración de generación dinámica de planes personalizados en `app.js`
- Persistencia de marcas de referencia por usuario (`pace5k`, `pace10k`)
- Reinicio de progreso del plan personalizado al regenerarlo

## [1.0.0] - 2026-03-07

### 🎉 Lanzamiento Inicial

Primer lanzamiento público de RunningTrainer con todas las funcionalidades core implementadas.

### ✨ Agregado

#### Sistema de Autenticación
- Sistema completo de registro e inicio de sesión
- Gestión de perfiles de usuario con niveles (Principiante, Intermedio, Avanzado, Experto)
- Persistencia de datos en localStorage
- Avatares automáticos con iniciales
- Barra de usuario deslizable con información de XP

#### Planes de Entrenamiento
- **7 planes especializados**:
  - Corre 30 Minutos (8 semanas) - 15 XP/día
  - 5K (6 semanas) - 20 XP/día
  - 10K (8 semanas) - 30 XP/día
  - Fartlek (6 semanas) - 25 XP/día
  - HIIT (6 semanas) - 40 XP/día
  - Trail Running (6 semanas) - 35 XP/día
  - Principiantes (6 semanas) - 10 XP/día
- Calendarios semanales expandibles
- Días de descanso identificados y excluidos del progreso

#### Sistema de Gamificación
- 4 niveles de progresión con XP acumulativo
- Barra de experiencia en tiempo real
- Subida de nivel automática con notificación
- Mensajes motivacionales adaptados por nivel y progreso
- Sistema de recompensa por completar entrenamientos

#### Temporizador Inteligente
- **Parser automático** de entrenamientos desde descripción de texto
- Detección de series, tiempo de correr y caminar
- Modo pantalla completa al iniciar
- Cuenta regresiva con círculo SVG animado
- Cambio de color por fase (verde=correr, amarillo=caminar)
- Alertas sonoras configurables (campana, finalización)
- Contador de series actual/total
- Labels dinámicos: CORRER / CAMINAR

#### Seguimiento de Progreso
- Barra de progreso general del plan
- Gráfico de barras por semana (Chart.js)
- Cálculo de porcentaje solo con días entrenables
- Marcado de días completados con estado visual
- Semanas completadas marcadas en verde

#### Exportación de Datos
- Generación de PDF por semana con jsPDF
- Tabla profesional con estado de entrenamientos
- Branding de RunningTrainer en PDFs
- Indicadores visuales: ✅ Completado / ❌ Pendiente / 💤 Descanso

#### Interfaz de Usuario
- Splash screen animado al inicio
- Diseño responsive para móvil, tablet y desktop
- 7 tarjetas de planes con iconos visuales
- Modales elegantes para perfil y temporizador
- Sistema de notificaciones toast
- Animaciones suaves CSS3

#### Características Técnicas
- Wake Lock API para prevenir bloqueo de pantalla
- Vibration API para feedback háptico en móviles
- Web Audio API para generación de sonidos
- localStorage para persistencia de datos
- Scroll behavior adaptativo en móvil

### 🎨 Diseño

- Paleta de colores moderna y accesible
- Fuente Inter de Google Fonts
- Variables CSS para tematización
- Gradientes y sombras profesionales
- Iconos emoji para mejor UX

### 📱 Responsive

- Media queries para todos los tamaños de pantalla
- Modo adaptativo de temporizador (fullscreen en móvil)
- Gestos táctiles optimizados
- Barra de usuario con scroll behavior

### ♿ Accesibilidad

- Atributos ARIA en elementos interactivos
- Labels descriptivos en formularios
- Contraste de colores WCAG AA
- Navegación por teclado

### 🔒 Seguridad

- Validación de formularios
- Sanitización de inputs
- Sin dependencias con vulnerabilidades conocidas

### 📚 Documentación

- README.md completo y profesional
- LICENSE con MIT
- .gitignore configurado
- CONTRIBUTING.md para colaboradores
- Comentarios en código fuente

---

## [Unreleased]

### Planeado para Futuras Versiones

#### Próximos incrementos
- [ ] PWA completa con Service Worker y modo offline
- [ ] Backend (Firebase/Supabase) y sincronización multi-dispositivo
- [ ] Suite de tests automatizados (unit + e2e)
- [ ] Métricas avanzadas (ritmo, carga, evolución por bloques)

#### v2.0.0 (visión)
- [ ] Soporte multiidioma
- [ ] Integración con smartwatches
- [ ] Compartir en redes sociales

---

## Tipos de Cambios

- `Agregado` para nuevas funcionalidades
- `Cambiado` para cambios en funcionalidades existentes
- `Obsoleto` para funcionalidades que serán eliminadas
- `Eliminado` para funcionalidades eliminadas
- `Corregido` para corrección de bugs
- `Seguridad` en caso de vulnerabilidades

---

[1.0.0]: https://github.com/juancartronic/RunningTrainer-APK/releases/tag/v1.0.0
[1.1.0]: https://github.com/juancartronic/RunningTrainer-APK/releases/tag/v1.1.0
[1.2.1]: https://github.com/juancartronic/RunningTrainer-APK/releases/tag/v1.2.1
[Unreleased]: https://github.com/juancartronic/RunningTrainer-APK/compare/v1.2.1...HEAD
