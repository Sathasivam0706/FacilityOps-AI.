# FacilityOps AI — Enterprise Smart Facility Operations & Optimization Platform

FacilityOps AI is an enterprise-grade agentic AI platform that integrates IoT sensor telemetry, multi-agent AI orchestration, and predictive analytics to optimize energy consumption, automate maintenance work orders, and maintain indoor comfort and security across commercial real estate portfolios.

---

## 🌟 Key Features

- **Energy Intelligence Engine**: Real-time load forecasting, peak tariff demand reduction, and automated anomaly detection (96.4% baseline accuracy).
- **Predictive Maintenance Subsystem**: Remaining Useful Life (RUL) estimation, vibration harmonic analysis, and auto-dispatched work orders.
- **Autonomous AI Agents**: 6 collaborating specialized agents (Energy, Maintenance, Occupancy, Security, Cost Optimization, and Facility Analytics Engine).
- **IoT / ESP32 Microcontroller Telemetry**: High-frequency MQTT streaming from BMS sensors (CO2 PPM, COP, Vibration mm/s, Power Demand kW).
- **Executive Operations Dashboard**: Cross-facility metrics, interactive floorplan heatmaps, and customizable threshold alert automation.

---

## 🏗️ System Architecture

```text
FacilityOps-AI Architecture
│
├── 🌐 Frontend Layer (React + TypeScript + Vite + Tailwind CSS)
│   ├── Executive Overview & Specialized Operation Dashboards
│   └── Real-Time Multi-Agent AI Drawer Interface
│
├── ⚙️ Express Backend API Layer (Node.js + TypeScript)
│   ├── Agentic Orchestration Controllers & Work Order Handlers
│   └── Gemini 3.6 Flash Server Integration Service
│
├── 🐍 Python Analytics & ML Subsystem (Python 3.10+)
│   ├── Energy Load Predictor (`analytics/energy_forecast.py`)
│   ├── Sensor Anomaly Detector (`predictive_maintenance/anomaly_detection.py`)
│   └── Multi-Agent Optimization Engine (`agents/agent_optimizer.py`)
│
└── 📟 IoT & ESP32 Layer
    └── Microcontroller Firmware & Sensor Interface Protocols
```

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide Icons, Recharts
- **Backend**: Node.js, Express, TypeScript, ESBuild, TSX
- **AI Engine**: Google Gemini 3.6 Flash SDK (`@google/genai`)
- **Python ML**: Python 3.10, NumPy, Pandas, Scikit-Learn
- **IoT Firmware**: C++ / ESP32, MQTT / BACnet Data Formats
- **Database**: MongoDB / High-Performance In-Memory Store

---

## 📁 Repository Folder Structure

```text
FacilityOps-AI/
├── frontend/                  # React Frontend Application
│   ├── public/
│   └── src/
│       ├── api/               # API Gateway Client
│       ├── components/        # Dashboards, Modals, Layouts & Modules
│       ├── data/              # Operational Benchmark Datasets
│       ├── services/          # Client API Service Wrappers
│       ├── types/             # TypeScript Interface Definitions
│       ├── App.tsx            # Main Application Container
│       ├── index.css          # Tailwind CSS Entry Point
│       └── main.tsx           # React Mount Point
│
├── backend/                   # Node.js Express Backend
│   └── src/
│       ├── agents/            # Autonomous AI Agent Implementations
│       ├── config/            # Database & Server Configurations
│       ├── controllers/       # HTTP Request Route Controllers
│       ├── middleware/        # Authentication & Error Middlewares
│       ├── models/            # In-Memory & MongoDB Data Models
│       ├── routes/            # Express Router Endpoints
│       ├── services/          # Gemini SDK & Python Process Executors
│       ├── app.ts             # Express Router Aggregator
│       └── server.ts          # Express Production Entry
│
├── python/                    # Python Analytics & ML Subsystem
│   ├── agents/                # Multi-Agent Optimization (`agent_optimizer.py`)
│   ├── analytics/             # Load Forecasting (`energy_forecast.py`)
│   ├── predictive_maintenance/# Anomaly Detection (`anomaly_detection.py`)
│   ├── main.py                # CLI Orchestrator Entry Point
│   └── requirements.txt       # Python Dependencies
│
├── iot/                       # Microcontroller & Sensor Integration
│   └── esp32/
│       ├── firmware/          # ESP32 Main Firmware (`main.cpp`)
│       ├── sensors/           # Telemetry Processing Drivers
│       └── README.md          # Hardware Wiring & Setup Guide
│
├── docs/                      # Project Documentation
│   ├── api/                   # REST API Specification
│   ├── architecture/          # Multi-Agent Architecture Diagrams
│   ├── milestones/            # Project Milestones & Benchmarks
│   └── README.md
│
├── tests/                     # Test Suites (Frontend, Backend, Python)
├── .env.example               # Environment Variables Template
├── package.json               # Package Manifest & Scripts
├── server.ts                  # Development & Unified Entrypoint
├── tsconfig.json              # TypeScript Compiler Configuration
└── vite.config.ts             # Vite Bundler Configuration
```

---

## ⚡ Quick Start & Running the Project

### 1. Prerequisites
- Node.js 18+ & npm / bun
- Python 3.10+

### 2. Installation
```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and provide your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
MONGODB_URI=mongodb://localhost:27017/facilityops_ai
```

### 4. Start Development Server
```bash
npm run dev
```
The application will boot at `http://localhost:3000` with unified frontend and backend API routing.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🛰️ API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Platform & Agent Health Check |
| `POST` | `/api/agent/energy` | Energy Agent Assessment & HVAC Optimization |
| `POST` | `/api/agent/maintenance` | Predictive Maintenance RUL Calculation |
| `POST` | `/api/agent/orchestrate` | Multi-Agent Operational Briefing |
| `GET` / `POST` | `/api/workorders` | Work Order Management & Auto-Dispatch |
| `GET` / `POST` | `/api/alerts` | Notification Routing & Dispatch Logs |
| `POST` | `/api/python/energy-forecast` | Python Energy Load Predictor |
| `POST` | `/api/python/anomaly-detection` | Python Sensor Anomaly Detector |
| `POST` | `/api/python/agent-optimize` | Python Agent Optimization Algorithm |

---

## 🤖 AI Agent Architecture

The platform deploys 6 specialized autonomous sub-agents:
1. **Energy Agent**: Analyzes building sub-meters, reduces peak tariff demand, and eliminates thermal energy wastage.
2. **Predictive Maintenance Agent**: Tracks mechanical wear (vibration, bearing temp, run hours) to prevent equipment failure.
3. **Occupancy Agent**: Adjusts thermal setbacks and fresh air dampers according to real-time zone occupant density.
4. **Security Agent**: Monitors access control points, CCTV motion anomalies, and perimeter security breaches.
5. **Cost Optimization Agent**: Identifies utility demand response incentives and OpEx reduction opportunities.
6. **Facility Analytics Engine**: Synthesizes cross-agent telemetry into single executive facility health scores.

---

## 📄 License & Infosys Internship Presentation
Designed for Infosys Internship Evaluation and Smart Facility Management Presentations.
