# FacilityOps AI - ESP32 IoT Microcontroller Integration

This module contains ESP32 micro-controller firmware code and sensor interface drivers for transmitting real-time building telemetry to the FacilityOps AI platform.

## Sensor Telemetry
- **HVAC Vibration**: MPU6050 3-Axis Accelerometer (mm/s RMS calculation)
- **Indoor Air Quality**: MH-Z19B NDIR CO2 Sensor (PPM reading)
- **Power Monitoring**: PZEM-004T AC Energy Meter (kW & Power Factor)
- **Thermal Imaging**: AMG8833 Thermal Camera Grid (°C zone profiling)

## MQTT Communication
Telemetry data is published over TLS-encrypted MQTT to the backend API endpoint (`/api/iot/telemetry`).
