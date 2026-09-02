import sys
import json
from analytics.energy_forecast import forecast_energy
from predictive_maintenance.anomaly_detection import detect_anomalies
from predictive_maintenance.failure_risk import calculate_failure_risks
from agents.agent_optimizer import optimize_agents

def main():
    print("FacilityOps AI Python Intelligence Subsystem Online.")
    print("Available Analytics & Prototype Predictive Models:")
    print(" 1. Energy Load Forecasting (analytics/energy_forecast.py)")
    print(" 2. IoT Anomaly Detection (predictive_maintenance/anomaly_detection.py)")
    print(" 3. Equipment Failure Risk & RUL Engine (predictive_maintenance/failure_risk.py)")
    print(" 4. Multi-Agent Optimization (agents/agent_optimizer.py)")

if __name__ == "__main__":
    main()
