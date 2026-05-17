package com.runningtrainer.app;

import android.Manifest;
import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.SystemClock;

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
    private SensorManager sensorManager;
    private Sensor stepCounterSensor;
    private boolean listening = false;
    private float lastStepCount = -1f;
    private long lastBootTimeMs = 0L;
    private PluginCall pendingStartCall;

    @Override
    public void load() {
        sensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        }
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        JSObject result = new JSObject();
        result.put("available", stepCounterSensor != null);
        result.put("permissionRequired", Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q);
        result.put("permissionGranted", hasRecognitionPermission());
        call.resolve(result);
    }

    @PluginMethod
    public void startUpdates(PluginCall call) {
        if (stepCounterSensor == null) {
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

    @PermissionCallback
    private void handleRequestPermissionResult(PluginCall call) {
        JSObject result = new JSObject();
        boolean granted = hasRecognitionPermission();
        result.put("granted", granted);
        result.put("state", granted ? "granted" : "denied");
        call.resolve(result);
    }

    private void beginListening(PluginCall call) {
        if (!listening && sensorManager != null && stepCounterSensor != null) {
            listening = sensorManager.registerListener(this, stepCounterSensor, SensorManager.SENSOR_DELAY_NORMAL);
        }

        if (!listening) {
            call.reject("No se pudo iniciar el contador de pasos.");
            return;
        }

        if (lastStepCount >= 0) {
            call.resolve(buildPayload(lastStepCount));
        } else {
            pendingStartCall = call;
        }
    }

    private boolean hasRecognitionPermission() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.Q || getPermissionState("activityRecognition") == PermissionState.GRANTED;
    }

    private JSObject buildPayload(float sensorTotal) {
        lastStepCount = sensorTotal;
        lastBootTimeMs = System.currentTimeMillis() - SystemClock.elapsedRealtime();

        JSObject result = new JSObject();
        result.put("totalSteps", Math.max(0, (int) Math.floor(sensorTotal)));
        result.put("bootTimeMs", lastBootTimeMs);
        result.put("timestamp", System.currentTimeMillis());
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
        stopListening();
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        if (stepCounterSensor != null && hasRecognitionPermission()) {
            sensorManager.registerListener(this, stepCounterSensor, SensorManager.SENSOR_DELAY_NORMAL);
            listening = true;
        }
    }

    @Override
    protected void handleOnDestroy() {
        stopListening();
        super.handleOnDestroy();
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() != Sensor.TYPE_STEP_COUNTER || event.values.length == 0) {
            return;
        }

        JSObject payload = buildPayload(event.values[0]);
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