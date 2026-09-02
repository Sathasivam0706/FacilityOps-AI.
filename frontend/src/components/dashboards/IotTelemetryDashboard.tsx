import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Wifi,
  Activity,
  Zap,
  Thermometer,
  Gauge,
  RefreshCw,
  Server,
  Code,
  Send,
  AlertTriangle,
  Radio,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { fetchIotDevicesApi, fetchIotTelemetryApi, postIotTelemetryApi } from '../../api/client';

interface Gateway {
  id: string;
  name: string;
  location: string;
  type: string;
  status: 'Online' | 'Offline' | 'Degraded';
  rssi: string;
  firmware: string;
  uptime: string;
  lastPing: string;
  isPhysicalHardware?: boolean;
}

interface TelemetryLog {
  timestamp: string;
  deviceId: string;
  topic: string;
  payload: Record<string, any>;
}

export const IotTelemetryDashboard: React.FC = () => {
  const [selectedGateway, setSelectedGateway] = useState('GW-ESP32-CHILLER-01');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [gateways, setGateways] = useState<Gateway[]>([
    { id: 'GW-ESP32-CHILLER-01', name: 'Chiller Plant ESP32', location: 'Chiller Plant Room B', type: 'ESP32 Modbus/MQTT', status: 'Online', rssi: '-58 dBm', firmware: 'v2.4.1-bms', uptime: '99.98%', lastPing: 'Just now' },
    { id: 'GW-ESP32-AHU-FLOOR3', name: 'AHU Gateway 03', location: 'AHU Mech Room 3', type: 'ESP32 RS485 Node', status: 'Online', rssi: '-62 dBm', firmware: 'v2.4.1-bms', uptime: '99.91%', lastPing: '2s ago' },
    { id: 'GW-ESP32-POWER-MAIN', name: 'Substation Transformer', location: 'Substation Transformer 2', type: 'ESP32 Power Meter Bridge', status: 'Online', rssi: '-48 dBm', firmware: 'v2.5.0-bms', uptime: '100.00%', lastPing: 'Just now' },
    { id: 'GW-ESP32-CO2-LOBBY', name: 'Lobby Environmental Node', location: 'Main Entrance Lobby', type: 'ESP32 IAQ Sensor Gateway', status: 'Degraded', rssi: '-81 dBm', firmware: 'v2.3.9-bms', uptime: '96.40%', lastPing: '12s ago' },
  ]);

  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLog[]>([]);
  const [isHardwareConnected, setIsHardwareConnected] = useState(false);
  const [lastHardwarePing, setLastHardwarePing] = useState<string | null>(null);

  // Modal / Test Ingestion State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testDeviceId, setTestDeviceId] = useState('GW-ESP32-CHILLER-01');
  const [testTopic, setTestTopic] = useState('telemetry/chiller1/sensors');
  const [testTemp, setTestTemp] = useState('78.4');
  const [testVibration, setTestVibration] = useState('4.82');
  const [testPower, setTestPower] = useState('420.5');
  const [testVoltage, setTestVoltage] = useState('415.0');
  const [testCurrent, setTestCurrent] = useState('62.5');
  const [testCo2, setTestCo2] = useState('890');
  const [testHumidity, setTestHumidity] = useState('48.5');
  const [sendingTest, setSendingTest] = useState(false);
  const [testSuccessMsg, setTestSuccessMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [devRes, telemRes] = await Promise.all([
        fetchIotDevicesApi(),
        fetchIotTelemetryApi(),
      ]);

      if (devRes && devRes.devices && devRes.devices.length > 0) {
        setGateways(devRes.devices);
      }

      if (telemRes) {
        if (telemRes.telemetry) {
          setTelemetryLogs(telemRes.telemetry);
        }
        setIsHardwareConnected(!!telemRes.isHardwareConnected);
        setLastHardwarePing(telemRes.lastHardwarePing || null);
      }
    } catch (err) {
      console.warn('Failed to refresh IoT telemetry:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s sync interval
    return () => clearInterval(interval);
  }, []);

  const handleSendTestTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTest(true);
    setTestSuccessMsg(null);

    const payload = {
      deviceId: testDeviceId,
      topic: testTopic,
      temperatureC: parseFloat(testTemp) || 24.5,
      vibrationMms: parseFloat(testVibration) || 1.8,
      powerKw: parseFloat(testPower) || 120.0,
      voltageV: parseFloat(testVoltage) || 230.0,
      currentA: parseFloat(testCurrent) || 15.0,
      co2Ppm: parseInt(testCo2) || 600,
      humidityPct: parseFloat(testHumidity) || 50.0,
      status: parseFloat(testVibration) > 3.5 || parseFloat(testTemp) > 75 ? 'Degraded' : 'Online',
      equipmentId: testDeviceId.includes('CHILLER') ? 'CHILLER-02' : undefined,
    };

    const res = await postIotTelemetryApi(payload);
    setSendingTest(false);

    if (res && res.success) {
      setTestSuccessMsg('ESP32 Telemetry packet ingested successfully into backend database!');
      setTimeout(() => {
        setTestSuccessMsg(null);
        setIsTestModalOpen(false);
        loadData();
      }, 1200);
    }
  };

  const currentGw = gateways.find((g) => g.id === selectedGateway) || gateways[0];

  const arduinoSnippet = `#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://your-facilityops-domain.com/api/iot/telemetry";

void sendTelemetry() {
  if(WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["deviceId"] = "GW-ESP32-CHILLER-01";
    doc["topic"] = "telemetry/chiller1/sensors";
    doc["temperatureC"] = 78.4;
    doc["vibrationMms"] = 4.82;
    doc["powerKw"] = 420.5;
    doc["voltageV"] = 415.0;
    doc["currentA"] = 62.5;
    doc["co2Ppm"] = 890;
    doc["humidityPct"] = 48.5;
    doc["status"] = "Online";

    String jsonString;
    serializeJson(doc, jsonString);
    int httpResponseCode = http.POST(jsonString);
    http.end();
  }
}`;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center space-x-2 bg-cyan-50 text-cyan-800 border border-cyan-200 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold">
              <Cpu className="w-3.5 h-3.5 text-cyan-600" />
              <span>IoT Hardware Telemetry Layer</span>
            </div>

            {/* Hardware Status Badge */}
            {isHardwareConnected ? (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Physical ESP32 Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded font-mono text-[11px] font-bold">
                <Radio className="w-3 h-3 text-amber-600" />
                Dev Seed Mode (Hardware Offline)
              </span>
            )}
          </div>

          <h1 className="text-xl lg:text-2xl font-extrabold text-slate-900 mt-2">
            ESP32 Microcontroller & MQTT Edge Gateways
          </h1>
          <p className="text-xs text-slate-600 font-medium mt-1">
            Real-time sensor telemetry packet ingestion via HTTP REST & MQTT protocol bridges.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 text-slate-600" />
            <span>Test Ingest API</span>
          </button>

          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center space-x-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-cyan-300 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync ESP32 Mesh</span>
          </button>
        </div>
      </div>

      {/* Hardware Status Disclaimer Banner */}
      {!isHardwareConnected && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3 text-xs text-slate-700">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-900">Physical Hardware Connectivity Status</span>
            <p className="text-slate-600">
              No physical ESP32 microcontrollers are currently transmitting active telemetry packets to <code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-[11px]">/api/iot/telemetry</code>. Displaying backend database development telemetry logs. The REST endpoint is active and listening for live ESP32 HTTP POST payloads.
            </p>
          </div>
        </div>
      )}

      {/* Gateway Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {gateways.map((gw) => (
          <div
            key={gw.id}
            onClick={() => setSelectedGateway(gw.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 shadow-2xs ${
              selectedGateway === gw.id
                ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-cyan-500/20'
                : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-extrabold">{gw.id}</span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  gw.status === 'Online'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {gw.status}
              </span>
            </div>

            <div className="text-[11px] opacity-80">{gw.location}</div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-700/30 pt-2">
              <div>
                <span className="opacity-60 block">Signal RSSI</span>
                <span className="font-bold">{gw.rssi}</span>
              </div>
              <div>
                <span className="opacity-60 block">Last Ping</span>
                <span className="font-bold">{gw.lastPing}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Active Sensor Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-600" />
              Gateway: {currentGw.id} ({currentGw.location}) Sensors
            </h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold">
              Packet Protocol: REST/MQTT
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Temperature */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  Bearing Temperature
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                  Warning
                </span>
              </div>
              <div className="text-xl font-mono font-black text-slate-900">78.4°C</div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Sensor: PT100 RTD Probe</span>
                <span>Normal: &lt; 70.0°C</span>
              </div>
            </div>

            {/* Vibration */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-500" />
                  Vibration Acceleration
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                  Alert
                </span>
              </div>
              <div className="text-xl font-mono font-black text-slate-900">4.82 mm/s</div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Sensor: Piezo Accelerometer</span>
                <span>Normal: &lt; 3.5 mm/s</span>
              </div>
            </div>

            {/* Electrical Power & Voltage */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  Power & Voltage
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  Optimal
                </span>
              </div>
              <div className="text-xl font-mono font-black text-slate-900">420.5 kW</div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Voltage: 415.0V AC (3-Phase)</span>
                <span>Current: 62.5 A</span>
              </div>
            </div>

            {/* Gas & Environment (CO2 / Humidity) */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Wifi className="w-3.5 h-3.5 text-cyan-500" />
                  Indoor Gas & Air Quality
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  Optimal
                </span>
              </div>
              <div className="text-xl font-mono font-black text-slate-900">890 PPM CO₂</div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Gas Sensor: NDIR CO2</span>
                <span>Humidity: 48.5% RH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Packet Stream Log */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <Server className="w-4 h-4 text-slate-700" />
              Telemetry Log Store ({telemetryLogs.length} Records)
            </h2>

            <div className="space-y-2 text-[10px] font-mono mt-3 max-h-[260px] overflow-y-auto">
              {telemetryLogs.length === 0 ? (
                <p className="text-slate-400 py-4 text-center">No telemetry logs ingested yet.</p>
              ) : (
                telemetryLogs.slice(0, 5).map((log, i) => (
                  <div key={i} className="p-2.5 bg-slate-900 text-slate-200 rounded-lg space-y-1">
                    <div className="flex justify-between text-cyan-400">
                      <span>{log.timestamp ? log.timestamp.substring(11, 19) : 'Just now'}</span>
                      <span className="text-emerald-400 font-bold">{log.deviceId}</span>
                    </div>
                    <div className="text-slate-400 truncate">{log.topic}</div>
                    <div className="text-slate-300 font-medium overflow-x-auto whitespace-pre">
                      {JSON.stringify(log.payload)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Ingestion Modal */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-2xl space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-slate-900 text-white rounded-lg">
                  <Code className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">
                    ESP32 Ingestion Testing & Firmware Guide
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Test REST payload POSTs or view physical micro-controller code snippet
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Test Form */}
            <form onSubmit={handleSendTestTelemetry} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Device ID</label>
                  <input
                    type="text"
                    value={testDeviceId}
                    onChange={(e) => setTestDeviceId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Topic</label>
                  <input
                    type="text"
                    value={testTopic}
                    onChange={(e) => setTestTopic(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Temperature (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={testTemp}
                    onChange={(e) => setTestTemp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Vibration (mm/s)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={testVibration}
                    onChange={(e) => setTestVibration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Power (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={testPower}
                    onChange={(e) => setTestPower(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Voltage (V)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={testVoltage}
                    onChange={(e) => setTestVoltage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Current (A)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={testCurrent}
                    onChange={(e) => setTestCurrent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Gas / CO2 (PPM)</label>
                  <input
                    type="number"
                    value={testCo2}
                    onChange={(e) => setTestCo2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              {testSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center space-x-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{testSuccessMsg}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={sendingTest}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center space-x-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-cyan-400" />
                  <span>{sendingTest ? 'Sending Packet...' : 'Submit Test Telemetry'}</span>
                </button>
              </div>
            </form>

            {/* Arduino Code Snippet */}
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  ESP32 / Arduino C++ Firmware Code Pattern:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(arduinoSnippet);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 1500);
                  }}
                  className="text-cyan-700 hover:text-cyan-800 font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied!' : 'Copy C++ Code'}</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[10px] font-mono overflow-x-auto">
                {arduinoSnippet}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
