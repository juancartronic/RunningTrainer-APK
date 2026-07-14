package com.runningtrainer.app;

import android.Manifest;
import android.content.Context;
import android.content.SharedPreferences;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.SystemClock;
import android.util.Log;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Map;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "StepCounter",
    permissions = {
        @Permission(alias = "activityRecognition", strings = { Manifest.permission.ACTIVITY_RECOGNITION })
    }
)
public class StepCounterPlugin extends Plugin implements SensorEventListener {
    private static final String TAG = "StepCounterPlugin";
    private static final String PREFS_NAME = "running_trainer_step_counter";
    private static final String KEY_DAY = "day_key";
    private static final String KEY_DAILY_TOTAL = "daily_total";
    private static final String KEY_LAST_SENSOR_VALUE = "last_sensor_value";
    private static final String KEY_LAST_BOOT_TIME_MS = "last_boot_time_ms";
    private static final String KEY_LAST_TIMESTAMP_MS = "last_timestamp_ms";

    private SensorManager sensorManager;
    private Sensor stepCounterSensor;
    private Sensor stepDetectorSensor;
    private boolean listening = false;
    private int lastSensorValue = -1;
    private long dailyTotalSteps = 0L;
    private int detectorSessionSteps = 0;
    private long lastBootTimeMs = 0L;
    private String stateDayKey;
    private PluginCall pendingStartCall;

    @Override
    public void load() {
        sensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
            stepDetectorSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR);
        }

        try {
            restoreStateFromPreferences();
        } catch (Exception ex) {
            Log.e(TAG, "Estado de pasos corrupto; se reinicia estado local de StepCounter", ex);
            clearPersistedState();
            resetRuntimeState();
        }
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        boolean hasStepCounter = stepCounterSensor != null;
        boolean hasStepDetector = stepDetectorSensor != null;

        result.put("available", hasStepCounter || hasStepDetector);
        result.put("hasStepCounter", hasStepCounter);
        result.put("hasStepDetector", hasStepDetector);
        result.put("accumulatedSensor", hasStepCounter ? "TYPE_STEP_COUNTER" : (hasStepDetector ? "TYPE_STEP_DETECTOR" : "none"));
        result.put("permissionRequired", Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q);
        result.put("permissionGranted", hasRecognitionPermission());
        call.resolve(result);
    }

    @PluginMethod
    public void startUpdates(PluginCall call) {
        if (stepCounterSensor == null && stepDetectorSensor == null) {
            call.reject("Sensor de pasos no disponible en este dispositivo.");
            return;
        }

        if (!hasRecognitionPermission()) {
            call.reject("Permiso de actividad fisica requerido.");
            return;
        }

        beginListening(call);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            JSObject result = new JSObject();
            result.put("granted", true);
            result.put("state", "granted");
            call.resolve(result);
            return;
        }

        if (hasRecognitionPermission()) {
            JSObject result = new JSObject();
            result.put("granted", true);
            result.put("state", "granted");
            call.resolve(result);
            return;
        }

        requestPermissionForAlias("activityRecognition", call, "handleRequestPermissionResult");
    }

    @PluginMethod
    public void stopUpdates(PluginCall call) {
        stopListening();
        JSObject result = new JSObject();
        result.put("stopped", true);
        call.resolve(result);
    }

    @PluginMethod
    public void getSnapshot(PluginCall call) {
        ensureDayState();
        JSObject cached = getCachedPayload();
        if (cached != null) {
            call.resolve(cached);
        } else {
            call.reject("No snapshot available");
        }
    }

    @PermissionCallback
    private void handleRequestPermissionResult(PluginCall call) {
        JSObject result = new JSObject();
        boolean granted = hasRecognitionPermission();
        result.put("granted", granted);
        result.put("state", granted ? "granted" : "denied");
        call.resolve(result);
    }

    private void beginListening(PluginCall call) {
        if (!listening && sensorManager != null) {
            boolean counterRegistered = false;
            boolean detectorRegistered = false;

            if (stepCounterSensor != null) {
                counterRegistered = sensorManager.registerListener(this, stepCounterSensor, SensorManager.SENSOR_DELAY_UI);
            }

            if (stepDetectorSensor != null) {
                detectorRegistered = sensorManager.registerListener(this, stepDetectorSensor, SensorManager.SENSOR_DELAY_UI);
            }

            listening = counterRegistered || detectorRegistered;
        }

        if (!listening) {
            call.reject("No se pudo iniciar el contador de pasos.");
            return;
        }

        JSObject cachedPayload = getCachedPayload();
        if (cachedPayload != null) {
            call.resolve(cachedPayload);
            return;
        }

        pendingStartCall = call;
    }

    private boolean hasRecognitionPermission() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.Q || getPermissionState("activityRecognition") == PermissionState.GRANTED;
    }

    private JSObject buildStepCounterPayload(float sensorTotal) {
        ensureDayState();

        int sensorValue = Math.max(0, (int) Math.floor(sensorTotal));
        long deltaSteps = 0L;

        if (lastSensorValue >= 0) {
            if (sensorValue >= lastSensorValue) {
                deltaSteps = sensorValue - lastSensorValue;
            } else {
                // Reinicio de contador del sistema (reboot/dispositivo): sumar lectura actual como nuevo tramo.
                deltaSteps = sensorValue;
            }
            dailyTotalSteps += Math.max(0L, deltaSteps);
        }

        lastSensorValue = sensorValue;

        long nowTs = System.currentTimeMillis();
        lastBootTimeMs = nowTs - SystemClock.elapsedRealtime();
        persistState(nowTs);

        return buildCounterPayload(dailyTotalSteps, lastBootTimeMs, nowTs, lastSensorValue, deltaSteps, false);
    }

    private JSObject buildCounterPayload(
        long totalSteps,
        long bootTimeMs,
        long timestampMs,
        int sensorValue,
        long deltaSteps,
        boolean cached
    ) {
        long safeTotal = Math.max(0L, totalSteps);
        long safeBootTime = Math.max(0L, bootTimeMs);
        long safeTimestamp = timestampMs > 0L ? timestampMs : System.currentTimeMillis();

        JSObject result = new JSObject();
        result.put("totalSteps", safeTotal);
        result.put("bootTimeMs", safeBootTime);
        result.put("timestamp", safeTimestamp);
        result.put("source", "TYPE_STEP_COUNTER");
        result.put("accumulatedFromCounter", true);
        result.put("counterMode", "dailyDelta");
        result.put("sensorValue", Math.max(0, sensorValue));
        result.put("deltaSteps", Math.max(0L, deltaSteps));
        result.put("cached", cached);
        result.put("dailySteps", safeTotal);
        result.put("detectorSessionSteps", detectorSessionSteps);
        return result;
    }

    private SharedPreferences getStepCounterPreferences() {
        Context context = getContext();
        if (context == null) {
            return null;
        }
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    private long getCurrentBootTimeMs() {
        return System.currentTimeMillis() - SystemClock.elapsedRealtime();
    }

    private String getTodayKey() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    private void resetRuntimeState() {
        stateDayKey = getTodayKey();
        dailyTotalSteps = 0L;
        lastSensorValue = -1;
        detectorSessionSteps = 0;
        lastBootTimeMs = 0L;
    }

    private void clearPersistedState() {
        SharedPreferences prefs = getStepCounterPreferences();
        if (prefs == null) {
            return;
        }

        prefs.edit()
            .remove(KEY_DAY)
            .remove(KEY_DAILY_TOTAL)
            .remove(KEY_LAST_SENSOR_VALUE)
            .remove(KEY_LAST_BOOT_TIME_MS)
            .remove(KEY_LAST_TIMESTAMP_MS)
            .apply();
    }

    private int readIntCompat(SharedPreferences prefs, String key, int fallback) {
        Map<String, ?> all = prefs.getAll();
        if (!all.containsKey(key)) {
            return fallback;
        }

        Object value = all.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException ex) {
                return fallback;
            }
        }
        return fallback;
    }

    private long readLongCompat(SharedPreferences prefs, String key, long fallback) {
        Map<String, ?> all = prefs.getAll();
        if (!all.containsKey(key)) {
            return fallback;
        }

        Object value = all.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException ex) {
                return fallback;
            }
        }
        return fallback;
    }

    private String readStringCompat(SharedPreferences prefs, String key, String fallback) {
        Map<String, ?> all = prefs.getAll();
        if (!all.containsKey(key)) {
            return fallback;
        }

        Object value = all.get(key);
        if (value == null) {
            return fallback;
        }
        return String.valueOf(value);
    }

    private void ensureDayState() {
        String today = getTodayKey();
        if (stateDayKey == null) {
            stateDayKey = today;
        }

        if (!today.equals(stateDayKey)) {
            stateDayKey = today;
            dailyTotalSteps = 0L;
            lastSensorValue = -1;
            persistState(System.currentTimeMillis());
        }
    }

    private void restoreStateFromPreferences() {
        SharedPreferences prefs = getStepCounterPreferences();
        if (prefs == null) {
            stateDayKey = getTodayKey();
            return;
        }

        stateDayKey = readStringCompat(prefs, KEY_DAY, getTodayKey());
        dailyTotalSteps = Math.max(0L, readLongCompat(prefs, KEY_DAILY_TOTAL, 0L));
        lastSensorValue = readIntCompat(prefs, KEY_LAST_SENSOR_VALUE, -1);
        lastBootTimeMs = Math.max(0L, readLongCompat(prefs, KEY_LAST_BOOT_TIME_MS, 0L));

        ensureDayState();
    }

    private void persistState(long timestampMs) {
        persistStateInternal(timestampMs, false);
    }

    private void persistStateSync(long timestampMs) {
        persistStateInternal(timestampMs, true);
    }

    private void persistStateInternal(long timestampMs, boolean sync) {
        SharedPreferences prefs = getStepCounterPreferences();
        if (prefs == null) {
            return;
        }

        SharedPreferences.Editor editor = prefs.edit()
            .putString(KEY_DAY, stateDayKey != null ? stateDayKey : getTodayKey())
            .putLong(KEY_DAILY_TOTAL, Math.max(0L, dailyTotalSteps))
            .putLong(KEY_LAST_BOOT_TIME_MS, Math.max(0L, lastBootTimeMs))
            .putLong(KEY_LAST_TIMESTAMP_MS, Math.max(0L, timestampMs))
            ;

        if (lastSensorValue >= 0) {
            editor.putInt(KEY_LAST_SENSOR_VALUE, lastSensorValue);
        } else {
            editor.remove(KEY_LAST_SENSOR_VALUE);
        }

        if (sync) {
            editor.commit();
        } else {
            editor.apply();
        }
    }

    private JSObject getCachedPayload() {
        if (stepCounterSensor == null && stepDetectorSensor == null) {
            return null;
        }

        ensureDayState();

        SharedPreferences prefs = getStepCounterPreferences();
        long timestampMs = prefs != null ? Math.max(0L, readLongCompat(prefs, KEY_LAST_TIMESTAMP_MS, 0L)) : 0L;
        if (timestampMs == 0L) {
            timestampMs = System.currentTimeMillis();
        }

        long bootTimeMs = prefs != null ? Math.max(0L, readLongCompat(prefs, KEY_LAST_BOOT_TIME_MS, 0L)) : 0L;
        if (bootTimeMs == 0L) {
            bootTimeMs = getCurrentBootTimeMs();
        }

        lastBootTimeMs = bootTimeMs;

        int safeSensorValue = lastSensorValue >= 0
            ? Math.max(0, lastSensorValue)
            : 0;

        if (stepCounterSensor != null) {
            return buildCounterPayload(dailyTotalSteps, bootTimeMs, timestampMs, safeSensorValue, 0L, true);
        }

        return buildDetectorFallbackPayload(dailyTotalSteps, 0, true);
    }

    private JSObject buildDetectorFallbackPayload(long totalSteps, int deltaSteps, boolean cached) {
        long nowTs = System.currentTimeMillis();
        long bootTimeMs = nowTs - SystemClock.elapsedRealtime();
        lastBootTimeMs = bootTimeMs;

        JSObject result = new JSObject();
        result.put("totalSteps", Math.max(0L, totalSteps));
        result.put("dailySteps", Math.max(0L, totalSteps));
        result.put("bootTimeMs", bootTimeMs);
        result.put("timestamp", nowTs);
        result.put("source", "TYPE_STEP_DETECTOR");
        result.put("accumulatedFromCounter", false);
        result.put("counterMode", "dailyDeltaDetector");
        result.put("deltaSteps", Math.max(0, deltaSteps));
        result.put("cached", cached);
        result.put("detectorSessionSteps", detectorSessionSteps);
        return result;
    }

    private void stopListening() {
        if (sensorManager != null && listening) {
            sensorManager.unregisterListener(this);
        }
        listening = false;
    }

    @Override
    protected void handleOnPause() {
        super.handleOnPause();
        persistStateSync(System.currentTimeMillis());
        stopListening();
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        if (sensorManager == null || !hasRecognitionPermission()) {
            return;
        }

        boolean resumed = false;
        if (stepCounterSensor != null) {
            resumed = sensorManager.registerListener(this, stepCounterSensor, SensorManager.SENSOR_DELAY_UI);
        }
        if (stepDetectorSensor != null) {
            resumed = sensorManager.registerListener(this, stepDetectorSensor, SensorManager.SENSOR_DELAY_UI) || resumed;
        }

        listening = resumed;

        // Emitir inmediatamente el valor persistido para que el JS actualice la UI
        // sin esperar al primer evento del sensor (que puede tardar varios segundos).
        if (listening) {
            JSObject cached = getCachedPayload();
            if (cached != null) {
                cached.put("cached", true);
                notifyListeners("stepUpdate", cached, true);
            }
        }
    }

    @Override
    protected void handleOnDestroy() {
        persistStateSync(System.currentTimeMillis());
        stopListening();
        super.handleOnDestroy();
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.values.length == 0) {
            return;
        }

        int sensorType = event.sensor.getType();
        JSObject payload;

        if (sensorType == Sensor.TYPE_STEP_COUNTER) {
            payload = buildStepCounterPayload(event.values[0]);
        } else if (sensorType == Sensor.TYPE_STEP_DETECTOR) {
            int delta = Math.max(1, Math.round(event.values[0]));
            detectorSessionSteps += delta;

            // El acumulado diario debe basarse en TYPE_STEP_COUNTER cuando exista.
            if (stepCounterSensor != null) {
                return;
            }

            ensureDayState();
            dailyTotalSteps += delta;
            persistState(System.currentTimeMillis());
            payload = buildDetectorFallbackPayload(dailyTotalSteps, delta, false);
        } else {
            return;
        }

        notifyListeners("stepUpdate", payload, true);

        if (pendingStartCall != null) {
            pendingStartCall.resolve(payload);
            pendingStartCall = null;
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // No-op.
    }
}