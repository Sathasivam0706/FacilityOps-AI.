import sys
import json
import random

def forecast_energy(current_kw, sqft, hour=14):
    """
    Python algorithm for facility energy load forecasting.
    """
    base_load = sqft * 0.003  # ~3W per sqft baseline
    time_factor = 1.0 + 0.3 * (1.0 if 9 <= hour <= 18 else 0.4)
    predicted_kw = round(base_load * time_factor + random.uniform(-15.0, 15.0), 1)
    
    peak_risk = "HIGH" if predicted_kw > 450 else "MEDIUM" if predicted_kw > 300 else "LOW"
    recommendations = []
    if peak_risk == "HIGH":
        recommendations.append("Pre-cool chiller loops before 14:00 peak hours.")
        recommendations.append("Shed non-critical floor 4-6 lighting load by 15%.")
    else:
        recommendations.append("Maintain standard HVAC setpoints.")
        
    return {
        "current_kw": current_kw,
        "forecasted_peak_kw": predicted_kw,
        "peak_risk": peak_risk,
        "recommendations": recommendations,
        "engine": "Energy Demand Forecast Algorithm"
    }

if __name__ == "__main__":
    current_kw = float(sys.argv[1]) if len(sys.argv) > 1 else 380.0
    sqft = float(sys.argv[2]) if len(sys.argv) > 2 else 125000.0
    result = forecast_energy(current_kw, sqft)
    print(json.dumps(result, indent=2))
