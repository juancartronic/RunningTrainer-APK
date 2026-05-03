// gps.js — Módulo de tracking GPS para RunningTrainer
const GPS = (() => {
  let watchId = null;
  let positions = [];
  let totalDistance = 0; // metros
  let startTime = null;
  let isTracking = false;
  let onUpdate = null; // callback(data)
  let lastPosition = null;

  function getCapacitorGeolocation() {
    return window.Capacitor?.Plugins?.Geolocation || null;
  }

  function isSupported() {
    return Boolean(getCapacitorGeolocation() || ('geolocation' in navigator));
  }

  function normalizeError(err, fallbackMessage = 'No se pudo acceder al GPS.') {
    if (!err) return { code: 0, message: fallbackMessage };
    if (typeof err === 'string') return { code: 0, message: err };
    return {
      code: Number.isFinite(err.code) ? err.code : 0,
      message: err.message || fallbackMessage
    };
  }

  async function ensurePermission() {
    const nativeGeolocation = getCapacitorGeolocation();
    if (nativeGeolocation) {
      try {
        const current = await nativeGeolocation.checkPermissions();
        const currentState = current.location || current.coarseLocation || 'prompt';
        if (currentState === 'granted') {
          return { granted: true, message: '' };
        }

        const requested = await nativeGeolocation.requestPermissions();
        const requestedState = requested.location || requested.coarseLocation || 'prompt';
        if (requestedState === 'granted') {
          return { granted: true, message: '' };
        }

        return { granted: false, message: 'Permiso GPS denegado. Habilitalo en ajustes.' };
      } catch (err) {
        const geoError = normalizeError(err);
        return { granted: false, message: geoError.message };
      }
    }

    if (!('geolocation' in navigator)) {
      return { granted: false, message: 'GPS no disponible en este dispositivo.' };
    }

    try {
      if (navigator.permissions?.query) {
        const state = await navigator.permissions.query({ name: 'geolocation' });
        if (state.state === 'denied') {
          return { granted: false, message: 'Permiso GPS denegado. Habilitalo en ajustes.' };
        }
      }
    } catch (_) {
      // Algunos navegadores o WebViews no implementan permissions.query para geolocalizacion.
    }

    return { granted: true, message: '' };
  }

  async function getCurrentPosition(options = {}) {
    const nativeGeolocation = getCapacitorGeolocation();
    if (nativeGeolocation) {
      return nativeGeolocation.getCurrentPosition(options);
    }

    if (!('geolocation' in navigator)) {
      throw normalizeError(null, 'GPS no disponible en este dispositivo.');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, (err) => reject(normalizeError(err)), options);
    });
  }

  // Haversine: distancia entre dos coordenadas en metros
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Filtro: ignora puntos con precisión > 30m o saltos absurdos
  function isValidPoint(pos) {
    if (pos.coords.accuracy > 30) return false;
    if (!lastPosition) return true;
    const dt = (pos.timestamp - lastPosition.timestamp) / 1000;
    if (dt <= 0) return false;
    const d = haversine(
      lastPosition.coords.latitude, lastPosition.coords.longitude,
      pos.coords.latitude, pos.coords.longitude
    );
    const speed = d / dt; // m/s
    // Máx ~40 km/h = 11.1 m/s (filtrar teletransportaciones GPS)
    if (speed > 11.2) return false;
    return true;
  }

  function handlePosition(pos) {
    if (!isTracking) return;
    if (!isValidPoint(pos)) return;

    if (lastPosition) {
      const d = haversine(
        lastPosition.coords.latitude, lastPosition.coords.longitude,
        pos.coords.latitude, pos.coords.longitude
      );
      // Mínimo 2m para evitar ruido GPS estando parado
      if (d >= 2) {
        totalDistance += d;
        lastPosition = pos;
        positions.push({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          time: pos.timestamp,
          accuracy: pos.coords.accuracy
        });
      }
    } else {
      lastPosition = pos;
      positions.push({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        time: pos.timestamp,
        accuracy: pos.coords.accuracy
      });
    }

    if (onUpdate) {
      onUpdate(getData());
    }
  }

  let _gpsPermDeniedAt = 0;

  function handleError(err) {
    console.warn('GPS error:', err.message);
    if (err.code === 1) {
      // Permiso denegado — no mostrar si el panel de ajustes GPS está abierto
      const settingsPanel = document.getElementById('homeGpsSettingsPanel');
      const settingsOpen = settingsPanel && settingsPanel.classList.contains('active');
      const now = Date.now();
      if (!settingsOpen && window.showToast && now - _gpsPermDeniedAt > 30000) {
        _gpsPermDeniedAt = now;
        showToast('GPS: permiso denegado. Activa la ubicación.', 'error');
      }
    }
  }

  function getData() {
    const elapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    const distKm = totalDistance / 1000;
    const paceSecsPerKm = distKm > 0.01 ? Math.round(elapsed / distKm) : 0;
    return {
      distanceMeters: Math.round(totalDistance),
      distanceKm: distKm,
      elapsedSeconds: elapsed,
      paceSecsPerKm,
      positions,
      isTracking
    };
  }

  return {
    async start(updateCallback) {
      if (isTracking) return true;

      const permission = await ensurePermission();
      if (!permission.granted) {
        if (window.showToast) showToast(permission.message || 'GPS no disponible en este dispositivo', 'error');
        return false;
      }

      positions = [];
      totalDistance = 0;
      startTime = Date.now();
      lastPosition = null;
      isTracking = true;
      onUpdate = updateCallback || null;

      const watchOptions = {
        enableHighAccuracy: true,
        maximumAge: 3000,
        timeout: 10000
      };

      try {
        const nativeGeolocation = getCapacitorGeolocation();
        if (nativeGeolocation) {
          watchId = await nativeGeolocation.watchPosition(watchOptions, (pos, err) => {
            if (err) {
              handleError(normalizeError(err));
              return;
            }
            if (pos) handlePosition(pos);
          });
        } else {
          watchId = navigator.geolocation.watchPosition(handlePosition, handleError, watchOptions);
        }
      } catch (err) {
        isTracking = false;
        onUpdate = null;
        lastPosition = null;
        watchId = null;
        handleError(normalizeError(err));
        return false;
      }

      return true;
    },

    stop() {
      if (watchId !== null) {
        const nativeGeolocation = getCapacitorGeolocation();
        if (nativeGeolocation && typeof watchId === 'string') {
          nativeGeolocation.clearWatch({ id: watchId }).catch(() => {});
        } else {
          navigator.geolocation.clearWatch(watchId);
        }
        watchId = null;
      }
      isTracking = false;
      const data = getData();
      // Resetear callback
      onUpdate = null;
      return data;
    },

    getData,

    isSupported,

    getCurrentPosition,

    ensurePermission,

    isTracking() {
      return isTracking;
    },

    // Formato mm:ss desde segundos
    formatPace(secsPerKm) {
      if (!secsPerKm || secsPerKm <= 0) return '--:--';
      const m = Math.floor(secsPerKm / 60);
      const s = secsPerKm % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    },

    formatTime(totalSecs) {
      if (!totalSecs || totalSecs <= 0) return '0:00';
      const h = Math.floor(totalSecs / 3600);
      const m = Math.floor((totalSecs % 3600) / 60);
      const s = totalSecs % 60;
      if (h > 0) return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    },

    formatDistance(meters) {
      if (meters < 1000) return `${Math.round(meters)} m`;
      return `${(meters / 1000).toFixed(2)} km`;
    }
  };
})();

window.GPS = GPS;
