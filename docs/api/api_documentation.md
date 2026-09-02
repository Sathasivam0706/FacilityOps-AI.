# FacilityOps AI - API Documentation

## REST API Endpoints

### Health Check
- `GET /api/health` — Platform status & active agent status

### Autonomous AI Agents
- `POST /api/agent/energy` — Energy Agent optimization assessment
- `POST /api/agent/maintenance` — Predictive Maintenance Agent RUL & work order generator
- `POST /api/agent/orchestrate` — Cross-agent multi-agent synthesis

### Work Orders
- `GET /api/workorders` — Retrieve list of work orders
- `POST /api/workorders` — Create a new work order

### Alerts
- `GET /api/alerts` — Retrieve alerts log
- `POST /api/alerts/send` — Dispatch alert notification

### Python ML Engine
- `POST /api/python/energy-forecast` — Execute Python energy demand load predictor
- `POST /api/python/anomaly-detection` — Execute Python sensor anomaly detector
- `POST /api/python/agent-optimize` — Execute Python multi-agent optimizer
