/**
 * FacilityOps AI - Sensor Reading & Data Formatting
 */

struct SensorReadings {
    float vibrationMms;
    float co2Ppm;
    float powerKw;
    float hvacCop;
};

SensorReadings readSensors() {
    SensorReadings s;
    s.vibrationMms = 2.1;
    s.co2Ppm = 750.0;
    s.powerKw = 420.0;
    s.hvacCop = 4.1;
    return s;
}
