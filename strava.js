// strava.js — Integración Strava para RunningTrainer
// Depende de variables globales: currentUser, planActual, planes, showToast
// =============================================================================

const STRAVA = {

  // ─── CONFIGURACIÓN ────────────────────────────────────────────────────────
  CLIENT_ID: '213935', // 👈 Cámbialo por tu Client ID de Strava

  get REDIRECT_URI() {
    return window.location.origin + '/callback.html';
  },

  SCOPE:          'activity:read_all,activity:write',
  API_BASE:       'https://www.strava.com/api/v3',
  TOKEN_ENDPOINT: '/api/strava-token',
  CACHE_TTL:      15 * 60 * 1000,

  // Si defines window.RUNNING_TRAINER_CONFIG.apiBaseUrl, la app usa ese backend.
  // En Android debe apuntar a tu dominio desplegado (ej: https://tu-app.vercel.app).
  get API_BASE_URL() {
    const configured = window.RUNNING_TRAINER_CONFIG?.apiBaseUrl || '';
    return configured.trim().replace(/\/$/, '');
  },
  getTokenEndpoint() {
    return this.API_BASE_URL ? this.API_BASE_URL + this.TOKEN_ENDPOINT : this.TOKEN_ENDPOINT;
  },

  _accessToken: null, _refreshToken: null, _expiresAt: null,
  _athlete: null, _activities: [],

  // ─── PERSISTENCIA ─────────────────────────────────────────────────────────
  save() {
    localStorage.setItem('strava_session', JSON.stringify({
      accessToken: this._accessToken, refreshToken: this._refreshToken,
      expiresAt: this._expiresAt, athlete: this._athlete,
    }));
  },
  load() {
    try {
      const d = JSON.parse(localStorage.getItem('strava_session') || 'null');
      if (!d) return false;
      this._accessToken = d.accessToken; this._refreshToken = d.refreshToken;
      this._expiresAt = d.expiresAt; this._athlete = d.athlete;
      return !!this._accessToken;
    } catch { return false; }
  },
  disconnect() {
    this._accessToken = this._refreshToken = this._expiresAt = this._athlete = null;
    this._activities = [];
    localStorage.removeItem('strava_session');
    localStorage.removeItem('strava_cache');
    this.renderWidget();
  },
  isConnected() { return !!this._accessToken; },

  // ─── OAUTH ────────────────────────────────────────────────────────────────
  startOAuth() {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID, redirect_uri: this.REDIRECT_URI,
      response_type: 'code', approval_prompt: 'auto', scope: this.SCOPE,
    });
    window.location.href = 'https://www.strava.com/oauth/authorize?' + params;
  },

  async handleCallback(code) {
    try {
      const tokenEndpoint = this.getTokenEndpoint();
      const res  = await fetch(tokenEndpoint + '?code=' + encodeURIComponent(code));
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      this._accessToken = data.access_token; this._refreshToken = data.refresh_token;
      this._expiresAt = data.expires_at; this._athlete = data.athlete;
      this.save(); return true;
    } catch (e) { console.error('[Strava]', e); return false; }
  },

  async refreshIfNeeded() {
    if (!this._refreshToken) return false;
    if (this._expiresAt && this._expiresAt > Math.floor(Date.now()/1000) + 300) return true;
    try {
      const tokenEndpoint = this.getTokenEndpoint();
      const res  = await fetch(tokenEndpoint, {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({refresh_token: this._refreshToken}),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      this._accessToken = data.access_token; this._refreshToken = data.refresh_token;
      this._expiresAt = data.expires_at; this.save(); return true;
    } catch (e) { console.error('[Strava] refresh error', e); this.disconnect(); return false; }
  },

  // ─── API ──────────────────────────────────────────────────────────────────
  async fetchActivities(forceRefresh = false) {
    if (!await this.refreshIfNeeded()) return [];
    if (!forceRefresh) {
      try {
        const c = JSON.parse(localStorage.getItem('strava_cache') || 'null');
        if (c && Date.now() - c.ts < this.CACHE_TTL) { this._activities = c.data; return c.data; }
      } catch {}
    }
    try {
      const after = Math.floor(Date.now()/1000) - 30*24*3600;
      const res   = await fetch(this.API_BASE + '/athlete/activities?after='+after+'&per_page=60',
        {headers: {Authorization: 'Bearer ' + this._accessToken}});
      if (!res.ok) throw new Error('HTTP '+res.status);
      const data  = await res.json();
      this._activities = data.filter(a => ['Run','TrailRun','VirtualRun'].includes(a.type));
      localStorage.setItem('strava_cache', JSON.stringify({ts: Date.now(), data: this._activities}));
      return this._activities;
    } catch (e) { console.error('[Strava]', e); return this._activities; }
  },

  // ─── ANÁLISIS ─────────────────────────────────────────────────────────────
  getTodayActivity() {
    const today = new Date().toISOString().split('T')[0];
    return this._activities.find(a => (a.start_date_local||'').startsWith(today)) || null;
  },
  getWeekActivities() {
    const now = new Date(), day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() + (day===0 ? -6 : 1-day));
    monday.setHours(0,0,0,0);
    return this._activities.filter(a => new Date(a.start_date_local) >= monday);
  },
  totalKm(acts) { return acts.reduce((s,a) => s + (a.distance||0)/1000, 0); },
  avgPaceSecs(acts) {
    const v = acts.filter(a => a.distance>0 && a.moving_time>0);
    if (!v.length) return null;
    const d = v.reduce((s,a)=>s+a.distance,0), t = v.reduce((s,a)=>s+a.moving_time,0);
    return d>0 ? t/(d/1000) : null;
  },
  formatPace(s) {
    if (!s) return '—';
    return Math.floor(s/60)+':'+(Math.round(s%60)<10?'0':'')+Math.round(s%60)+'/km';
  },
  getLast4WeeksStats() {
    return [3,2,1,0].map(w => {
      const start = new Date(), day = start.getDay();
      const monday = new Date(start);
      monday.setDate(start.getDate() + (day===0?-6:1-day) - w*7);
      monday.setHours(0,0,0,0);
      const sunday = new Date(monday); sunday.setDate(monday.getDate()+6); sunday.setHours(23,59,59);
      const acts = this._activities.filter(a => {
        const d = new Date(a.start_date_local); return d>=monday && d<=sunday;
      });
      return {
        label: w===0 ? 'Esta sem.' : 'Sem -'+w,
        km: parseFloat(this.totalKm(acts).toFixed(2)),
        pace: this.avgPaceSecs(acts),
      };
    });
  },
  compareTodayWithPlan(planText, activity) {
    if (!activity) return {status:'missing', label:'❌ Sin actividad hoy', detail:''};
    const km   = (activity.distance/1000).toFixed(2);
    const pace = this.formatPace(activity.moving_time/(activity.distance/1000));
    const mins = Math.round(activity.moving_time/60);
    const planKm  = parseFloat((planText.match(/(\d+(?:\.\d+)?)\s*km/i)||[])[1]);
    const planMin = parseFloat((planText.match(/(\d+)\s*min/i)||[])[1]);
    let status = 'done';
    if (planKm  && parseFloat(km) < planKm*0.85)  status = 'partial';
    if (planMin && mins < planMin*0.85)            status = 'partial';
    return {
      status,
      label:  status==='done' ? '✅ Completado' : '⚠️ Parcial',
      detail: km+' km · '+pace+' · '+mins+' min',
    };
  },

  // ─── WIDGET ───────────────────────────────────────────────────────────────
  async renderWidget() {
    const container = document.getElementById('stravaWidget');
    if (!container) return;

    if (!this.isConnected()) {
      container.innerHTML = `
        <div class="strava-connect-box">
          <div class="strava-logo-row">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#FC4C02">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
            </svg>
            <span class="strava-title">Conectar con Strava</span>
          </div>
          <p class="strava-desc">Sincroniza tus carreras y compáralas automáticamente con tu plan de entrenamiento diario.</p>
          <button class="btn-strava" id="stravaConnectBtn">🔗 Conectar cuenta Strava</button>
        </div>`;
      document.getElementById('stravaConnectBtn')?.addEventListener('click', () => this.startOAuth());
      return;
    }

    container.innerHTML = `<div class="strava-loading">⏳ Cargando actividades de Strava...</div>`;
    await this.fetchActivities();

    const today    = this.getTodayActivity();
    const weekActs = this.getWeekActivities();
    const weekKm   = this.totalKm(weekActs).toFixed(1);
    const weekDays = new Set(weekActs.map(a => a.start_date_local.split('T')[0])).size;
    const avgPace  = this.formatPace(this.avgPaceSecs(weekActs));
    const stats4w  = this.getLast4WeeksStats();

    let planHoyTexto = 'Sin plan activo', comparacion = null;
    try {
      const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
      const hoy  = dias[new Date().getDay()];
      const pd   = window.currentUser?.progressData?.[window.planActual] || {};
      const si   = Math.max(0, Object.keys(pd).length - 1);
      const sd   = window.planes?.[window.planActual]?.[si];
      const dd   = sd?.find(d => d[0] === hoy);
      if (dd) { planHoyTexto = dd[1]; comparacion = this.compareTodayWithPlan(planHoyTexto, today); }
    } catch {}

    const todayHtml = today
      ? `<div class="strava-today-activity">
           <span class="strava-status ${comparacion?.status||'done'}">${comparacion?.label||'✅'}</span>
           <span class="strava-activity-detail">${comparacion?.detail||''}</span>
         </div>`
      : `<div class="strava-today-activity">
           <span class="strava-status missing">❌ Sin actividad registrada hoy</span>
         </div>`;

    const maxKm = Math.max(...stats4w.map(w=>w.km), 1);
    const barsHtml = stats4w.map(w => {
      const pct = Math.round((w.km/maxKm)*100);
      return `<div class="strava-bar-col">
        <div class="strava-bar-wrap"><div class="strava-bar" style="height:${Math.max(pct,4)}%"></div></div>
        <span class="strava-bar-km">${w.km}</span>
        <span class="strava-bar-label">${w.label}</span>
      </div>`;
    }).join('');

    const fechaHoy = new Date().toLocaleDateString('es-ES', {weekday:'long', day:'numeric', month:'short'});

    container.innerHTML = `
      <div class="strava-widget-inner">
        <div class="strava-header">
          <div class="strava-header-left">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" style="opacity:.9">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
            </svg>
            <span class="strava-athlete-name">${this._athlete?.firstname||'Strava'} conectado</span>
          </div>
          <button class="strava-sync-btn" id="stravaRefreshBtn" title="Actualizar">🔄</button>
          <button class="strava-disconnect-btn" id="stravaDisconnectBtn">Desconectar</button>
        </div>
        <div class="strava-section">
          <div class="strava-section-title">📅 Hoy · ${fechaHoy}</div>
          <div class="strava-plan-row">
            <span class="strava-plan-label">Plan:</span>
            <span class="strava-plan-text">${planHoyTexto}</span>
          </div>
          ${todayHtml}
        </div>
        <div class="strava-section">
          <div class="strava-section-title">📊 Esta semana</div>
          <div class="strava-stats-row">
            <div class="strava-stat"><span class="strava-stat-value">${weekKm}</span><span class="strava-stat-label">km totales</span></div>
            <div class="strava-stat"><span class="strava-stat-value">${weekDays}</span><span class="strava-stat-label">días activos</span></div>
            <div class="strava-stat"><span class="strava-stat-value">${avgPace}</span><span class="strava-stat-label">ritmo medio</span></div>
          </div>
        </div>
        <div class="strava-section">
          <div class="strava-section-title">📈 Km · últimas 4 semanas</div>
          <div class="strava-bars">${barsHtml}</div>
        </div>
      </div>`;

    document.getElementById('stravaRefreshBtn')?.addEventListener('click', async () => {
      container.innerHTML = `<div class="strava-loading">⏳ Actualizando...</div>`;
      await this.fetchActivities(true);
      this.renderWidget();
    });
    document.getElementById('stravaDisconnectBtn')?.addEventListener('click', () => {
      if (confirm('¿Desconectar tu cuenta de Strava?')) {
        this.disconnect();
        if (window.showToast) showToast('Cuenta de Strava desconectada', 'success');
      }
    });
  },

  // ─── CREAR ACTIVIDAD EN STRAVA ──────────────────────────────────────────
  async createActivity({ name, elapsedTime, distance, description, sportType }) {
    if (!await this.refreshIfNeeded()) return null;
    try {
      const body = {
        name: name || 'RunningTrainer Workout',
        type: 'Run',
        sport_type: sportType || 'Run',
        start_date_local: new Date().toISOString(),
        elapsed_time: Math.round(elapsedTime),
        description: description || '',
      };
      if (distance && distance > 0) body.distance = distance;

      const res = await fetch(this.API_BASE + '/activities', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + this._accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'HTTP ' + res.status);
      }
      const data = await res.json();
      // Invalidar caché para que el widget muestre la nueva actividad
      localStorage.removeItem('strava_cache');
      return data;
    } catch (e) {
      console.error('[Strava] createActivity error', e);
      return null;
    }
  },

  // ─── PARSEAR DATOS DEL PLAN ───────────────────────────────────────────────
  parsePlanData(planText) {
    const text = (planText || '').toLowerCase();
    let totalSeconds = 0;
    let distanceKm = 0;

    // Extraer km: "5 km", "3.5 km"
    const kmMatches = [...text.matchAll(/(\d+(?:[.,]\d+)?)\s*km/gi)];
    if (kmMatches.length) {
      distanceKm = kmMatches.reduce((sum, m) => sum + parseFloat(m[1].replace(',', '.')), 0);
    }

    // Extraer minutos/segundos: "30 min", "1.5 min", "30 seg"
    const timeMatches = [...text.matchAll(/(\d+(?:[.,]\d+)?)\s*(min(?:uto)?s?|seg(?:undo)?s?)/gi)];
    const seconds = timeMatches.map(m => {
      const val = parseFloat(m[1].replace(',', '.'));
      return m[2].toLowerCase().startsWith('min') ? val * 60 : val;
    });

    // Si hay series: "5 Series de 1 min corriendo + 2 min caminando" → 5 * (60 + 120)
    const seriesMatch = text.match(/(\d+)\s*series?/i);
    if (seriesMatch && seconds.length) {
      const reps = parseInt(seriesMatch[1], 10);
      const perRep = seconds.reduce((a, b) => a + b, 0);
      totalSeconds = reps * perRep;
    } else if (seconds.length) {
      totalSeconds = seconds.reduce((a, b) => a + b, 0);
    }

    return { totalSeconds, distanceMeters: distanceKm * 1000 };
  },

  getSportTypeForPlan(planType) {
    return planType === 'trail' ? 'TrailRun' : 'Run';
  },

  // ─── MODAL SUBIR A STRAVA ─────────────────────────────────────────────────
  showUploadModal({ planText, planType, weekIndex, dayIndex, timerSeconds, gpsData }) {
    if (!this.isConnected()) return;

    const parsed = this.parsePlanData(planText);
    const sportType = this.getSportTypeForPlan(planType);

    const hasGpsData = gpsData && gpsData.distanceMeters > 0;
    const hasTimerData = !!timerSeconds;
    const hasParsedTime = parsed.totalSeconds > 0;

    // Prioridad para tiempo: GPS > temporizador > parseado del plan
    let estimatedTime = (hasGpsData ? gpsData.elapsedSeconds : 0) || timerSeconds || parsed.totalSeconds || 0;
    // Prioridad para distancia: GPS > parseado del plan
    let estimatedDist = (hasGpsData ? gpsData.distanceMeters : 0) || parsed.distanceMeters || 0;

    // Formatear tiempo para mostrar
    const fmtTime = (s) => {
      if (!s) return '';
      const m = Math.floor(s / 60), sec = Math.round(s % 60);
      return m + ':' + (sec < 10 ? '0' : '') + sec;
    };

    const sourceLabel = hasGpsData ? '📍 GPS en vivo'
      : hasTimerData ? '⏱️ Temporizador'
      : hasParsedTime ? '📋 Estimado del plan'
      : '✏️ Introduce tus datos';
    
    const timeReadonly = hasGpsData || hasTimerData;
    const distReadonly = hasGpsData;

    // Eliminar modal anterior si existe
    document.getElementById('stravaUploadModal')?.remove();

    const modal = document.createElement('div');
    modal.id = 'stravaUploadModal';
    modal.className = 'strava-upload-overlay';
    modal.innerHTML = `
      <div class="strava-upload-modal">
        <div class="strava-upload-header">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#FC4C02">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/>
          </svg>
          <span>Subir a Strava</span>
          <button class="strava-upload-close" id="stravaUploadClose">&times;</button>
        </div>
        <div class="strava-upload-body">
          <div class="strava-upload-plan"><strong>Entrenamiento:</strong> ${planText}</div>
          <div class="strava-upload-source">${sourceLabel}</div>
          <div class="strava-upload-field">
            <label>Tiempo (min:seg)</label>
            <input type="text" id="stravaUploadTime" value="${fmtTime(estimatedTime)}" 
                   placeholder="ej: 30:00" ${timeReadonly ? 'readonly' : ''}>
          </div>
          <div class="strava-upload-field">
            <label>Distancia (km)</label>
            <input type="text" id="stravaUploadDist" value="${estimatedDist > 0 ? (estimatedDist / 1000).toFixed(2) : ''}" 
                   placeholder="ej: 5.0 (opcional)" ${distReadonly ? 'readonly' : ''}>
          </div>
          <div class="strava-upload-field">
            <label>Nombre actividad</label>
            <input type="text" id="stravaUploadName" value="RunningTrainer: ${planText}" maxlength="100">
          </div>
          <div class="strava-upload-actions">
            <button class="btn btn-secondary" id="stravaUploadCancel">Cancelar</button>
            <button class="btn btn-strava" id="stravaUploadConfirm">🚀 Subir a Strava</button>
          </div>
          <div class="strava-upload-status" id="stravaUploadStatus"></div>
        </div>
      </div>`;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active'));

    // Parsear time input "mm:ss" → seconds
    const parseTimeInput = (val) => {
      const parts = val.trim().split(':');
      if (parts.length === 2) return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
      if (parts.length === 1) return parseFloat(parts[0]) * 60;
      return 0;
    };

    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    };

    document.getElementById('stravaUploadClose').onclick = closeModal;
    document.getElementById('stravaUploadCancel').onclick = closeModal;

    document.getElementById('stravaUploadConfirm').onclick = async () => {
      const status = document.getElementById('stravaUploadStatus');
      const timeVal = parseTimeInput(document.getElementById('stravaUploadTime').value);
      const distVal = parseFloat(document.getElementById('stravaUploadDist').value.replace(',', '.')) || 0;
      const nameVal = document.getElementById('stravaUploadName').value.trim();

      if (!timeVal || timeVal <= 0) {
        status.textContent = '⚠️ El tiempo es obligatorio';
        status.className = 'strava-upload-status error';
        return;
      }

      status.textContent = '⏳ Subiendo a Strava...';
      status.className = 'strava-upload-status';
      document.getElementById('stravaUploadConfirm').disabled = true;

      const planLabel = planType ? planType.toUpperCase() : '';
      const weekLabel = weekIndex !== undefined ? `Semana ${weekIndex + 1}` : '';

      const result = await this.createActivity({
        name: nameVal || 'RunningTrainer Workout',
        elapsedTime: timeVal,
        distance: distVal > 0 ? distVal * 1000 : 0,
        description: `${planLabel} · ${weekLabel} — via RunningTrainer`,
        sportType,
      });

      if (result) {
        status.textContent = '✅ ¡Actividad subida a Strava!';
        status.className = 'strava-upload-status success';
        if (window.showToast) showToast('✅ Actividad subida a Strava', 'success');
        setTimeout(closeModal, 1500);
        // Refrescar widget
        this.fetchActivities(true).then(() => this.renderWidget());
      } else {
        status.textContent = '❌ Error al subir. Inténtalo de nuevo.';
        status.className = 'strava-upload-status error';
        document.getElementById('stravaUploadConfirm').disabled = false;
      }
    };
  },

  // ─── INIT ─────────────────────────────────────────────────────────────────
  init() {
    this.load();
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('strava_code');
    const error  = params.get('strava_error');

    if (error) {
      window.history.replaceState({}, '', window.location.pathname);
      if (window.showToast) showToast('Conexión con Strava cancelada', 'error');
      this.renderWidget(); return;
    }
    if (code) {
      window.history.replaceState({}, '', window.location.pathname);
      this.handleCallback(code).then(ok => {
        if (window.showToast) showToast(ok ? '✅ Strava conectado correctamente' : '❌ Error conectando con Strava', ok?'success':'error');
        this.renderWidget();
      }); return;
    }
    this.renderWidget();
  },
};

window.STRAVA = STRAVA;
