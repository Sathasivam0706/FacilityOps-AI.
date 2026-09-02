import sys
import json

def optimize_agents(facility_id, active_occupancy, electricity_tariff_rate):
    """
    Python multi-agent orchestrator algorithm.
    Calculates dynamic setpoints and load-shifting instructions.
    """
    is_peak_hours = electricity_tariff_rate > 0.18
    
    if is_peak_hours:
        temp_setpoint = 24.5  # slightly higher for energy saving during peak rate
        lighting_dim_percent = 20
        mode = "PEAK_COST_SAVING"
    else:
        temp_setpoint = 22.0
        lighting_dim_percent = 0
        mode = "COMFORT_OPTIMIZED"
        
    mitigations = [
        f"Energy Agent: Activated {mode} mode (Tariff: ${electricity_tariff_rate:.2f}/kWh).",
        f"Occupancy Agent: Adjusting Floor 1-5 thermal zone to {temp_setpoint}°C for {active_occupancy} occupants.",
        f"Lighting Agent: Dimming common zone lighting by {lighting_dim_percent}%."
    ]
    
    return {
        "facility_id": facility_id,
        "mode": mode,
        "temperature_setpoint_celsius": temp_setpoint,
        "lighting_reduction": f"{lighting_dim_percent}%",
        "mitigations": mitigations,
        "engine": "Autonomous Multi-Agent Orchestrator"
    }

if __name__ == "__main__":
    fac_id = sys.argv[1] if len(sys.argv) > 1 else "HQ-01"
    occ = int(sys.argv[2]) if len(sys.argv) > 2 else 450
    rate = float(sys.argv[3]) if len(sys.argv) > 3 else 0.22
    
    result = optimize_agents(fac_id, occ, rate)
    print(json.dumps(result, indent=2))
