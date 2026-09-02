"""
Python Analytics Unit Tests
"""
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../python')))

from analytics.energy_forecast import forecast_energy
from predictive_maintenance.anomaly_detection import detect_anomalies

def test_energy_forecast():
    result = forecast_energy(400.0, 125000.0)
    assert "forecasted_peak_kw" in result
    assert result["current_kw"] == 400.0

def test_anomaly_detection():
    result = detect_anomalies(2.8, 5.1, 900)
    assert result["status"] == "ANOMALIES_DETECTED"
    assert result["anomaly_count"] > 0

if __name__ == "__main__":
    test_energy_forecast()
    test_anomaly_detection()
    print("All Python analytics tests passed successfully.")
