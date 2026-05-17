# Guía de Contribución

¡Gracias por tu interés en contribuir a RunningTrainer! 🎉

## Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas un ambiente respetuoso y acogedor para todos.

## ¿Cómo puedo contribuir?

### 🐛 Reportar Bugs

Si encuentras un bug, por favor crea un issue con:

1. **Título descriptivo**: Resume el problema en pocas palabras
2. **Descripción detallada**: 
   - ¿Qué esperabas que sucediera?
   - ¿Qué sucedió en realidad?
3. **Pasos para reproducir**:
   ```
   1. Ve a '...'
   2. Haz clic en '...'
   3. Observa el error
   ```
4. **Información del entorno**:
   - Navegador y versión
   - Sistema operativo
   - Tamaño de pantalla (si es relevante)
5. **Capturas de pantalla**: Si aplica

### 💡 Proponer Mejoras

Para sugerir nuevas funcionalidades:

1. Verifica que no exista un issue similar
2. Crea un nuevo issue con la etiqueta `enhancement`
3. Describe:
   - El problema que resuelve
   - La solución propuesta
   - Alternativas consideradas
   - Impacto en usuarios

### 🔧 Pull Requests

#### Proceso

1. **Fork** el repositorio
2. **Crea una rama** desde `main`:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```
3. **Realiza tus cambios**:
   - Escribe código limpio y comentado
   - Sigue las convenciones de estilo existentes
   - Prueba en múltiples navegadores
4. **Commit** con mensajes descriptivos:
   ```bash
   git commit -m "feat: Agregar sistema de notificaciones push"
   ```
5. **Push** a tu fork:
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```
6. **Abre un Pull Request** hacia `main`

#### Convención de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Formato, punto y coma, etc.
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

Ejemplos:
```
feat: Agregar integración con Strava
fix: Corregir cálculo de XP en planes HIIT
docs: Actualizar README con nuevas capturas
style: Aplicar formato consistente en app.js
refactor: Simplificar lógica del temporizador
```

### 🎨 Guía de Estilo

#### JavaScript

```javascript
// ✅ Bueno
function calcularProgreso(completados, total) {
  if (total === 0) return 0;
  return Math.round((completados / total) * 100);
}

// ❌ Evitar
function calc(c,t){return t==0?0:Math.round(c/t*100)}
```

**Principios**:
- Variables y funciones en camelCase
- Constantes en UPPER_CASE
- Nombres descriptivos
- Funciones pequeñas y enfocadas
- Comentarios para lógica compleja

#### CSS

```css
/* ✅ Bueno */
.timer-countdown {
  font-size: clamp(3rem, 12vw, 5.5rem);
  font-weight: 800;
  line-height: 1;
}

/* ❌ Evitar */
.tc{font-size:3rem;font-weight:800;}
```

**Principios**:
- Clases descriptivas con BEM si aplica
- Variables CSS para colores y espaciados
- Mobile-first con media queries
- Prefijos vendor cuando sea necesario

#### HTML

```html
<!-- ✅ Bueno -->
<button 
  id="startBtn" 
  class="btn btn-success" 
  aria-label="Iniciar temporizador"
>
  Iniciar
</button>

<!-- ❌ Evitar -->
<button id=b class=bs>Start</button>
```

**Principios**:
- Semántico (usar `<button>`, `<nav>`, `<section>`)
- Accesible (ARIA labels cuando sea necesario)
- Indentación consistente
- Atributos en orden: id, class, otros

### 🧪 Testing

Actualmente no hay tests automatizados, pero antes de hacer PR:

**Checklist Manual**:
- [ ] Prueba en Chrome, Firefox y Safari
- [ ] Prueba en móvil (responsive)
- [ ] Verifica que no haya errores en consola
- [ ] Prueba el flujo completo:
  - [ ] Registro/Login
  - [ ] Selección de plan
  - [ ] Completar día
  - [ ] Usar temporizador
  - [ ] Ver perfil
  - [ ] Descargar PDF

### 📝 Documentación

Si tu cambio afecta al usuario:

- Actualiza el README.md
- Agrega comentarios en el código
- Crea ejemplos si es complejo
- Actualiza el CHANGELOG

### 🌍 Traducción

Para agregar un nuevo idioma:

1. Crea un archivo `i18n/[idioma].js`
2. Traduce todas las claves
3. Actualiza el selector de idioma
4. Documenta el proceso

## Ideas de Contribución

### Funcionalidades Deseadas

- [ ] 🔐 Backend con Firebase/Supabase
- [ ] 📱 Progressive Web App (PWA) completa
- [ ] 📊 Gráficas de ritmo y VO2max
- [ ] 🌍 Soporte multiidioma (i18n)
- [ ] 🎵 Integración con Spotify
- [ ] 🗺️ Mejoras de mapas y capas avanzadas de rutas
- [ ] ⌚ Sincronización con smartwatches
- [ ] 👥 Sistema de amigos y competencias
- [ ] 📸 Compartir logros en redes sociales
- [ ] 🧠 Recomendaciones inteligentes de entrenamiento según progreso
- [ ] ♿ Mejoras de accesibilidad
- [ ] 🧪 Suite de tests (Jest, Cypress)

### Mejoras Técnicas

- [ ] Migrar a TypeScript
- [ ] Implementar Service Workers
- [ ] Optimizar rendimiento (Lighthouse)
- [ ] Agregar bundle con Webpack/Vite
- [ ] Implementar CI/CD
- [ ] Agregar ESLint y Prettier

## Recursos

- [MDN Web Docs](https://developer.mozilla.org/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)
- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)

## Preguntas

Si tienes dudas, puedes:

- Abrir un issue con la etiqueta `question`
- Comentar en issues/PRs existentes
- Contactar al mantenedor principal

---

¡Gracias por hacer de RunningTrainer un mejor proyecto! 🏃‍♂️💨
