# FacilityOps AI - System Architecture

## Architecture Overview
The platform connects IoT sensor telemetry from BMS (Building Management Systems) with 6 specialized autonomous sub-agents powered by Gemini 3.6 Flash and backend analytical Python engines.

```text
[ BMS / ESP32 Sensors ] ---> [ Express API Gateway ] ---> [ Autonomous AI Agents ]
                                   |                           |
                                   v                           v
                        [ Python ML Engines ]       [ Gemini 3.6 Flash ]
```
