import { Request, Response } from 'express';
import {
  getIotDevicesDb,
  getTelemetryDb,
  saveTelemetryDb,
  updateIotDeviceDb,
  updateEquipmentDb,
  updateOccupancyZoneDb,
  TelemetryData,
} from '../../../database/models/store';
import { runAnomalyDetectionEngine } from '../services/anomalyDetectionService';

export async function getIotDevices(req: Request, res: Response) {
  try {
    const devices = await getIotDevicesDb();
    return res.json({ success: true, devices });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch IoT devices' });
  }
}

export async function getIotTelemetry(req: Request, res: Response) {
  try {
    const telemetry = await getTelemetryDb();
    const devices = await getIotDevicesDb();

    // Check if any physical hardware pinged within the last 10 minutes
    const now = Date.now();
    const tenMinutesMs = 10 * 60 * 1000;
    const physicalDevices = devices.filter(
      (d) => d.isPhysicalHardware && d.lastPingTimestamp && now - d.lastPingTimestamp < tenMinutesMs
    );

    const isHardwareConnected = physicalDevices.length > 0;
    const lastHardwarePing = isHardwareConnected
      ? new Date(Math.max(...physicalDevices.map((d) => d.lastPingTimestamp || 0))).toISOString()
      : null;

    return res.json({
      success: true,
      telemetry,
      devices,
      gatewayCount: devices.length,
      sampleRateHz: 10,
      isHardwareConnected,
      lastHardwarePing,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Failed to fetch telemetry' });
  }
}

export async function ingestIotTelemetry(req: Request, res: Response) {
  try {
    const body = req.body || {};
    const deviceId = body.deviceId || 'GW-ESP32-CHILLER-01';
    const topic = body.topic || 'telemetry/esp32/sensors';

    // Normalize sensor payload from raw MQTT or direct ESP32 HTTP POST fields
    const sensorPayload: Record<string, any> = {
      ...(body.payload || {}),
    };

    if (body.temperatureC !== undefined) sensorPayload.temperatureC = Number(body.temperatureC);
    if (body.humidityPct !== undefined) sensorPayload.humidityPct = Number(body.humidityPct);
    if (body.voltageV !== undefined) sensorPayload.voltageV = Number(body.voltageV);
    if (body.currentA !== undefined) sensorPayload.currentA = Number(body.currentA);
    if (body.powerKw !== undefined) sensorPayload.powerKw = Number(body.powerKw);
    if (body.energyKwh !== undefined) sensorPayload.energyKwh = Number(body.energyKwh);
    if (body.co2Ppm !== undefined) sensorPayload.co2Ppm = Number(body.co2Ppm);
    if (body.occupantCount !== undefined) sensorPayload.occupantCount = Number(body.occupantCount);
    if (body.vibrationMms !== undefined) sensorPayload.vibrationMms = Number(body.vibrationMms);
    if (body.status !== undefined) sensorPayload.status = String(body.status);

    const isPhysical = body.isSimulated !== true;

    const newTelemetry: TelemetryData = {
      timestamp: new Date().toISOString(),
      deviceId,
      topic,
      payload: sensorPayload,
    };

    // 1. Save telemetry log to MongoDB / Store
    const savedTelemetry = await saveTelemetryDb(newTelemetry);

    // 2. Update Gateway Device record in MongoDB / Store
    await updateIotDeviceDb(deviceId, {
      status: body.status === 'Degraded' ? 'Degraded' : body.status === 'Offline' ? 'Offline' : 'Online',
      lastPing: 'Just now',
      lastPingTimestamp: Date.now(),
      isPhysicalHardware: isPhysical,
      rssi: body.rssi || '-58 dBm',
    });

    // 3. Propagate sensor data to equipment / occupancy if target IDs supplied
    if (body.equipmentId || sensorPayload.equipmentId) {
      const eqId = body.equipmentId || sensorPayload.equipmentId;
      const eqUpdate: Record<string, any> = {};
      if (sensorPayload.vibrationMms !== undefined) eqUpdate.vibrationMms = sensorPayload.vibrationMms;
      if (sensorPayload.temperatureC !== undefined) eqUpdate.temperatureC = sensorPayload.temperatureC;
      if (Object.keys(eqUpdate).length > 0) {
        await updateEquipmentDb(eqId, eqUpdate);
      }
    }

    if (body.zoneId || sensorPayload.zoneId) {
      const zId = body.zoneId || sensorPayload.zoneId;
      const zoneUpdate: Record<string, any> = {};
      if (sensorPayload.co2Ppm !== undefined) zoneUpdate.co2Ppm = sensorPayload.co2Ppm;
      if (sensorPayload.occupantCount !== undefined) zoneUpdate.occupantCount = sensorPayload.occupantCount;
      if (sensorPayload.temperatureC !== undefined) zoneUpdate.tempC = sensorPayload.temperatureC;
      if (sensorPayload.humidityPct !== undefined) zoneUpdate.humidityPct = sensorPayload.humidityPct;
      if (Object.keys(zoneUpdate).length > 0) {
        await updateOccupancyZoneDb(zId, zoneUpdate);
      }
    }

    // Trigger anomaly evaluation in background
    runAnomalyDetectionEngine().catch((e) => console.warn('Background anomaly evaluation error:', e));

    return res.status(201).json({
      success: true,
      message: 'ESP32 telemetry ingested successfully',
      telemetry: savedTelemetry,
      isPhysicalHardware: isPhysical,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || 'Telemetry ingestion failed' });
  }
}
